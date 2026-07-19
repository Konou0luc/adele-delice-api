import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';

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
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        order: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        dishes: {
          where: { isAvailable: true },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            images: true,
            isAvailable: true,
            preparationTime: true,
            spiceLevel: true,
            allergens: true,
            isPromoted: true,
            isNew: true,
            orderCount: true
          }
        }
      }
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
 *     summary: Créer une nouvelle catégorie (ADMIN/MANAGER seulement)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Authentification requise
 *       403:
 *         description: Accès non autorisé
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: Request) {
  const authResult = await requireRole(["ADMIN", "MANAGER"]);
  
  if (authResult.response) {
    return authResult.response;
  }
  
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
