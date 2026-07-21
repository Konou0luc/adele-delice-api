import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth-helpers';
import { Transaction } from '@/lib/fedapay';

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
      include: { order: true }
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
    const { orderId, amount, method } = body;

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ erreur: 'Commande introuvable' }, { status: 404 });
    }

    const transaction = await Transaction.create({
      description: `Paiement pour commande ${order.orderNumber}`,
      amount: amount,
      currency: { iso: 'XOF' },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
      customer: {
        firstname: authResult.session.user.firstName || 'Client',
        lastname: authResult.session.user.lastName || order.customerName,
        email: authResult.session.user.email,
        phone_number: order.customerPhone
      }
    });

    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount,
        method,
        fedaPayReference: transaction.reference,
        status: 'PENDING'
      }
    });

    return NextResponse.json({
      payment,
      paymentUrl: transaction.url
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erreur: 'Impossible de créer le paiement' }, { status: 500 });
  }
}
