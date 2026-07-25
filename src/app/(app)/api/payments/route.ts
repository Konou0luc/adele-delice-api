import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth-helpers';
import { Customer, Transaction } from '@/lib/fedapay';

type PaymentMethod = 'YAS_MONEY' | 'MOOV_MONEY';

const FEDAPAY_MODE_BY_METHOD: Record<PaymentMethod, string> = {
  YAS_MONEY: 'mtn_open',
  MOOV_MONEY: 'moov_tg',
};

const PHONE_COUNTRY_BY_PREFIX: Record<string, string> = {
  '228': 'tg',
  '229': 'bj',
  '225': 'ci',
  '221': 'sn',
  '223': 'ml',
  '224': 'gn',
  '226': 'bf',
  '232': 'sl',
  '233': 'gh',
  '235': 'td',
  '237': 'cm',
};

function resolveWebhookUrl(request: Request) {
  const requestOrigin = (() => {
    try {
      return new URL(request.url).origin;
    } catch {
      return null;
    }
  })();

  const resolvedBaseUrl =
    requestOrigin ||
    process.env.NEXTAUTH_URL ||
    process.env.FRONTEND_URL ||
    'http://localhost:3000';

  return `${resolvedBaseUrl.replace(/\/$/, '')}/api/payments/webhook`;
}

function splitCustomerName(fullName: string) {
  const normalized = fullName.trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return { firstname: 'Client', lastname: 'Adèle' };
  }

  const [firstname, ...rest] = normalized.split(' ');
  return {
    firstname: firstname || 'Client',
    lastname: rest.join(' ') || 'Adèle',
  };
}

function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, '');
}

function inferPhoneCountry(phoneDigits: string) {
  const prefixes = Object.keys(PHONE_COUNTRY_BY_PREFIX).sort((a, b) => b.length - a.length);
  const match = prefixes.find((prefix) => phoneDigits.startsWith(prefix));
  return (match && PHONE_COUNTRY_BY_PREFIX[match]) || 'tg';
}

function buildFedapayPhoneNumber(phoneValue: string) {
  const number = normalizePhoneNumber(phoneValue);
  if (!number) {
    return null;
  }

  return {
    number,
    country: inferPhoneCountry(number),
  };
}

async function createFedapayCustomer(params: {
  firstname: string;
  lastname: string;
  email: string;
  phone_number: { number: string; country: string } | null;
}) {
  try {
    return await Customer.create({
      firstname: params.firstname,
      lastname: params.lastname,
      email: params.email,
      ...(params.phone_number ? { phone_number: params.phone_number } : {}),
    });
  } catch (error) {
    console.warn('FedaPay customer creation skipped:', error);
    return null;
  }
}

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Récupérer tous les paiements
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Liste des paiements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payment'
 *       500:
 *         description: Erreur serveur
 */
export async function GET() {
  const authResult = await requireRole(['ADMIN', 'MANAGER', 'EMPLOYEE']);
  if (authResult.response) return authResult.response;

  try {
    const payments = await prisma.payment.findMany({
      include: { order: true },
    });
    return NextResponse.json(payments);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer les paiements' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Enregistrer un paiement (authentifié seulement)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *               amount:
 *                 type: number
 *               method:
 *                 type: string
 *                 enum: [YAS_MONEY, MOOV_MONEY]
 *               fedaPayReference:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paiement enregistré
 *       401:
 *         description: Authentification requise
 *       403:
 *         description: Accès non autorisé
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: Request) {
  const authResult = await requireAuth();

  if (authResult.response) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const { orderId, amount, method } = body as {
      orderId?: string;
      amount?: number | string;
      method?: PaymentMethod;
    };

    const parsedAmount = Number(amount);
    if (!orderId || !Number.isFinite(parsedAmount) || parsedAmount <= 0 || !method || !(method in FEDAPAY_MODE_BY_METHOD)) {
      return NextResponse.json({ erreur: 'Données de paiement invalides' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ erreur: 'Commande introuvable' }, { status: 404 });
    }

    if (!process.env.FEDAPAY_SECRET_KEY) {
      return NextResponse.json({ erreur: 'Configuration FedaPay manquante' }, { status: 500 });
    }

    const phoneNumber = buildFedapayPhoneNumber(order.customerPhone);
    const customerName = splitCustomerName(authResult.session.user.firstName || order.customerName);
    const callbackUrl = resolveWebhookUrl(request);
    const fedapayMode = FEDAPAY_MODE_BY_METHOD[method];
    const customerEmail = authResult.session.user.email;

    const fedapayCustomer = await createFedapayCustomer({
      firstname: customerName.firstname,
      lastname: authResult.session.user.lastName || customerName.lastname,
      email: customerEmail,
      phone_number: phoneNumber,
    });

    const transaction = await Transaction.create({
      description: `Paiement pour commande ${order.orderNumber}`,
      amount: parsedAmount,
      currency: { iso: 'XOF' },
      callback_url: callbackUrl,
      mode: fedapayMode,
      customer: fedapayCustomer?.id
        ? { id: fedapayCustomer.id }
        : {
            firstname: customerName.firstname,
            lastname: authResult.session.user.lastName || customerName.lastname,
            email: customerEmail,
            ...(phoneNumber ? { phone_number: phoneNumber } : {}),
          },
    });

    const tokenObject = await transaction.generateToken();

    const sendPayload = phoneNumber ? { phone_number: phoneNumber } : {};
    const fedapayResponse = await transaction.sendNowWithToken(fedapayMode, tokenObject.token, sendPayload);

    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: parsedAmount,
        method,
        fedaPayReference: transaction.reference,
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      {
        payment,
        paymentUrl: null,
        fedapay: {
          reference: transaction.reference,
          token: tokenObject.token,
          url: tokenObject.url,
          response: fedapayResponse,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Impossible de créer le paiement';
    return NextResponse.json(
      { erreur: 'Impossible de créer le paiement', details: message },
      { status: 500 }
    );
  }
}
