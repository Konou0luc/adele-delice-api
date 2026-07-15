import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = Promise<{ id: string }>;

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Récupérer une catégorie par son ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Catégorie trouvée
 *       404:
 *         description: Catégorie non trouvée
 *       500:
 *         description: Erreur serveur
 */
export async function GET(request: Request, segmentData: { params: Params }) {
  try {
    const { id } = await segmentData.params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: { dishes: true }
    });
    if (!category) return NextResponse.json({ erreur: 'Catégorie introuvable' }, { status: 404 });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer la catégorie' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Mettre à jour une catégorie
 *     tags: [Categories]
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
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Catégorie mise à jour
 *       500:
 *         description: Erreur serveur
 */
export async function PUT(request: Request, segmentData: { params: Params }) {
  try {
    const { id } = await segmentData.params;
    const body = await request.json();
    const category = await prisma.category.update({
      where: { id },
      data: body
    });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de mettre à jour la catégorie' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Supprimer une catégorie
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Catégorie supprimée
 *       500:
 *         description: Erreur serveur
 */
export async function DELETE(request: Request, segmentData: { params: Params }) {
  try {
    const { id } = await segmentData.params;
    await prisma.category.delete({
      where: { id }
    });
    return NextResponse.json({ succès: true });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de supprimer la catégorie' }, { status: 500 });
  }
}
