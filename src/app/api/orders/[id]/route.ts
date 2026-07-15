import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = Promise<{ id: string }>;

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Récupérer une commande par son ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Commande trouvée
 *       404:
 *         description: Commande non trouvée
 *       500:
 *         description: Erreur serveur
 */
export async function GET(request: Request, segmentData: { params: Params }) {
  try {
    const { id } = await segmentData.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: { include: { dish: true } }, payment: true }
    });
    if (!order) return NextResponse.json({ erreur: 'Commande introuvable' }, { status: 404 });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer la commande' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Mettre à jour une commande (changer son statut, etc.)
 *     tags: [Orders]
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
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Commande mise à jour
 *       500:
 *         description: Erreur serveur
 */
export async function PUT(request: Request, segmentData: { params: Params }) {
  try {
    const { id } = await segmentData.params;
    const body = await request.json();
    const order = await prisma.order.update({
      where: { id },
      data: body
    });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de mettre à jour la commande' }, { status: 500 });
  }
}
