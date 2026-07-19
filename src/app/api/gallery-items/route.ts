import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';

/**
 * @swagger
 * /api/gallery-items:
 *   get:
 *     summary: Récupérer la galerie d'images
 *     tags: [Gallery]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des images de la galerie
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GalleryItem'
 *       500:
 *         description: Erreur serveur
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;

    const galleryItems = await prisma.galleryItem.findMany({
      where,
      orderBy: { order: 'asc' }
    });
    return NextResponse.json(galleryItems);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer la galerie' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/gallery-items:
 *   post:
 *     summary: Ajouter une image à la galerie
 *     tags: [Gallery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GalleryItem'
 *     responses:
 *       201:
 *         description: Image ajoutée à la galerie
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: Request) {
  const authResult = await requireRole(["ADMIN", "MANAGER"]);
  if (authResult.response) return authResult.response;
  
  try {
    const body = await request.json();
    const galleryItem = await prisma.galleryItem.create({
      data: body
    });
    return NextResponse.json(galleryItem, { status: 201 });
  } catch {
    return NextResponse.json({ erreur: 'Impossible d\'ajouter l\'image à la galerie' }, { status: 500 });
  }
}
