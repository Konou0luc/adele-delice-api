import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { deleteCloudinaryImages } from '@/lib/cloudinary-utils';
import { requireRole } from '@/lib/auth-helpers';

type Params = Promise<{ id: string }>;

/**
 * @swagger
 * /api/gallery-items/{id}:
 *   put:
 *     summary: Mettre à jour une image de la galerie
 *     tags: [Gallery]
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
 *             $ref: '#/components/schemas/GalleryItem'
 *     responses:
 *       200:
 *         description: Image mise à jour
 *       500:
 *         description: Erreur serveur
 */
export async function PUT(request: Request, segmentData: { params: Params }) {
  const authResult = await requireRole(["ADMIN", "MANAGER"]);
  if (authResult.response) return authResult.response;

  try {
    const { id } = await segmentData.params;
    const body = await request.json();
    const galleryItem = await prisma.galleryItem.update({
      where: { id },
      data: body
    });
    return NextResponse.json(galleryItem);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de mettre à jour l\'image' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/gallery-items/{id}:
 *   delete:
 *     summary: Supprimer une image de la galerie et son image sur Cloudinary (ADMIN/MANAGER seulement)
 *     tags: [Gallery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image supprimée
 *       401:
 *         description: Authentification requise
 *       403:
 *         description: Accès non autorisé
 *       500:
 *         description: Erreur serveur
 */
export async function DELETE(request: Request, segmentData: { params: Params }) {
  const authResult = await requireRole(["ADMIN", "MANAGER"]);
  if (authResult.response) return authResult.response;

  try {
    const { id } = await segmentData.params;
    const galleryItem = await prisma.galleryItem.findUnique({ where: { id } });
    if (galleryItem) {
      await deleteCloudinaryImages([galleryItem.imageUrl]);
    }
    await prisma.galleryItem.delete({ where: { id } });
    return NextResponse.json({ succès: true });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de supprimer l\'image' }, { status: 500 });
  }
}
