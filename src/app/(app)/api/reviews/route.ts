import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Récupérer les avis approuvés
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: dishId
 *         schema:
 *           type: string
 *       - in: query
 *         name: all
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Liste des avis
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       500:
 *         description: Erreur serveur
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dishId = searchParams.get('dishId');
    const all = searchParams.get('all') === 'true';
    
    const where: Record<string, unknown> = {};
    if (!all) where.isApproved = true;
    if (dishId) where.dishId = dishId;

    const reviews = await prisma.review.findMany({
      where,
      include: { dish: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer les avis' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Soumettre un nouvel avis
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *               dishId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Avis soumis (en attente d'approbation)
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const review = await prisma.review.create({
      data: body
    });
    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de soumettre l\'avis' }, { status: 500 });
  }
}
