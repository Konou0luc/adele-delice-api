import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';

/**
 * @swagger
 * /api/promotions:
 *   get:
 *     summary: Récupérer toutes les promotions actives
 *     tags: [Promotions]
 *     responses:
 *       200:
 *         description: Liste des promotions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Promotion'
 *       500:
 *         description: Erreur serveur
 */
export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      where: { isActive: true },
      include: { dish: true }
    });
    return NextResponse.json(promotions);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer les promotions' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/promotions:
 *   post:
 *     summary: Créer une nouvelle promotion
 *     tags: [Promotions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Promotion'
 *     responses:
 *       201:
 *         description: Promotion créée
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: Request) {
  const authResult = await requireRole(["ADMIN", "MANAGER"]);
  if (authResult.response) return authResult.response;
  
  try {
    const body = await request.json();
    const promotion = await prisma.promotion.create({
      data: {
        ...body,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate)
      }
    });
    return NextResponse.json(promotion, { status: 201 });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de créer la promotion' }, { status: 500 });
  }
}
