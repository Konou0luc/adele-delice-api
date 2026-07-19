import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth-helpers';
import { OrderCreateOrderSchema } from '@/lib/validators';

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Récupérer toutes les commandes ou une commande par son numéro (authentifié seulement)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orderNumber
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des commandes ou commande unique
 *       401:
 *         description: Authentification requise
 *       404:
 *         description: Commande non trouvée
 *       500:
 *         description: Erreur serveur
 */
export async function GET(request: Request) {
  const authResult = await requireAuth();
  if (authResult.response) return authResult.response;
  
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    
    if (orderNumber) {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { orderItems: { include: { dish: true } }, payment: true }
      });
      if (!order) return NextResponse.json({ erreur: 'Commande introuvable' }, { status: 404 });
      return NextResponse.json(order);
    }

    const orders = await prisma.order.findMany({
      include: { orderItems: { include: { dish: true } }, payment: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer les commandes' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Créer une nouvelle commande
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *               customerPhone:
 *                 type: string
 *               deliveryAddress:
 *                 type: string
 *               comment:
 *                 type: string
 *               orderType:
 *                 type: string
 *               totalAmount:
 *                 type: number
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dishId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unitPrice:
 *                       type: number
 *     responses:
 *       201:
 *         description: Commande créée
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = OrderCreateOrderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { erreur: 'Données invalides', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const orderNumber = `AD${Date.now()}`;
    
    const order = await prisma.order.create({
      data: {
        ...validationResult.data,
        orderNumber,
        orderItems: {
          create: validationResult.data.orderItems.map(item => ({
            dishId: item.dishId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        }
      },
      include: { orderItems: true }
    });
    
    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de créer la commande' }, { status: 500 });
  }
}
