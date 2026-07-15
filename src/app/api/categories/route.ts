import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Récupérer toutes les catégories actives
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Liste des catégories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         description: Erreur serveur
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: { dishes: true }
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer les catégories' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Créer une nouvelle catégorie
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: Catégorie créée
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const category = await prisma.category.create({
      data: body
    });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de créer la catégorie' }, { status: 500 });
  }
}
