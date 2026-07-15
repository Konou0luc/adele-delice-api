import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/dishes:
 *   get:
 *     summary: Récupérer tous les plats disponibles
 *     tags: [Dishes]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: isPromoted
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isNew
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Liste des plats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Dish'
 *       500:
 *         description: Erreur serveur
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const isPromoted = searchParams.get('isPromoted');
    const isNew = searchParams.get('isNew');

    const where: Record<string, unknown> = { isAvailable: true };
    
    if (categoryId) where.categoryId = categoryId;
    if (isPromoted === 'true') where.isPromoted = true;
    if (isNew === 'true') where.isNew = true;

    const dishes = await prisma.dish.findMany({
      where,
      include: { category: true },
      orderBy: { orderCount: 'desc' }
    });
    
    return NextResponse.json(dishes);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer les plats' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/dishes:
 *   post:
 *     summary: Créer un nouveau plat
 *     tags: [Dishes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Dish'
 *     responses:
 *       201:
 *         description: Plat créé
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dish = await prisma.dish.create({
      data: {
        ...body,
        images: body.images || []
      }
    });
    return NextResponse.json(dish, { status: 201 });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de créer le plat' }, { status: 500 });
  }
}
