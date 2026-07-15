import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = Promise<{ id: string }>;

/**
 * @swagger
 * /api/dishes/{id}:
 *   get:
 *     summary: Récupérer un plat par son ID
 *     tags: [Dishes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plat trouvé
 *       404:
 *         description: Plat non trouvé
 *       500:
 *         description: Erreur serveur
 */
export async function GET(request: Request, segmentData: { params: Params }) {
  try {
    const { id } = await segmentData.params;
    const dish = await prisma.dish.findUnique({
      where: { id },
      include: { category: true, reviews: true }
    });
    if (!dish) return NextResponse.json({ erreur: 'Plat introuvable' }, { status: 404 });
    return NextResponse.json(dish);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer le plat' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/dishes/{id}:
 *   put:
 *     summary: Mettre à jour un plat
 *     tags: [Dishes]
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
 *             $ref: '#/components/schemas/Dish'
 *     responses:
 *       200:
 *         description: Plat mis à jour
 *       500:
 *         description: Erreur serveur
 */
export async function PUT(request: Request, segmentData: { params: Params }) {
  try {
    const { id } = await segmentData.params;
    const body = await request.json();
    const dish = await prisma.dish.update({
      where: { id },
      data: body
    });
    return NextResponse.json(dish);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de mettre à jour le plat' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/dishes/{id}:
 *   delete:
 *     summary: Supprimer un plat
 *     tags: [Dishes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plat supprimé
 *       500:
 *         description: Erreur serveur
 */
export async function DELETE(request: Request, segmentData: { params: Params }) {
  try {
    const { id } = await segmentData.params;
    await prisma.dish.delete({
      where: { id }
    });
    return NextResponse.json({ succès: true });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de supprimer le plat' }, { status: 500 });
  }
}
