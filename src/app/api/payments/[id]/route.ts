import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';

type Params = Promise<{ id: string }>;

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Récupérer un paiement par son ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paiement trouvé
 *       404:
 *         description: Paiement non trouvé
 *       500:
 *         description: Erreur serveur
 */
export async function GET(request: Request, segmentData: { params: Params }) {
  const authResult = await requireRole(["ADMIN", "MANAGER", "EMPLOYEE"]);
  if (authResult.response) return authResult.response;

  try {
    const { id } = await segmentData.params;
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { order: true }
    });
    if (!payment) return NextResponse.json({ erreur: 'Paiement introuvable' }, { status: 404 });
    return NextResponse.json(payment);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer le paiement' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/payments/{id}:
 *   put:
 *     summary: Mettre à jour le statut d'un paiement (authentifié seulement)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, SUCCESS, FAILED]
 *     responses:
 *       200:
 *         description: Paiement mis à jour
 *       401:
 *         description: Authentification requise
 *       403:
 *         description: Accès non autorisé
 *       500:
 *         description: Erreur serveur
 */
export async function PUT(request: Request, segmentData: { params: Params }) {
  const authResult = await requireRole(["ADMIN", "MANAGER", "EMPLOYEE"]);
  if (authResult.response) return authResult.response;

  try {
    const { id } = await segmentData.params;
    const body = await request.json();
    const payment = await prisma.payment.update({
      where: { id },
      data: { status: body.status }
    });
    return NextResponse.json(payment);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de mettre à jour le paiement' }, { status: 500 });
  }
}
