import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { deleteCloudinaryImages } from '@/lib/cloudinary-utils';
import { requireRole } from '@/lib/auth-helpers';

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
 *     summary: Mettre à jour un plat (ADMIN/MANAGER seulement)
 *     tags: [Dishes]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Authentification requise
 *       403:
 *         description: Accès non autorisé
 *       500:
 *         description: Erreur serveur
 */
export async function PUT(request: Request, segmentData: { params: Params }) {
  const authResult = await requireRole(["ADMIN", "MANAGER"]);
  
  if (authResult.response) {
    return authResult.response;
  }
  
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
 *     summary: Supprimer un plat et ses images sur Cloudinary (ADMIN/MANAGER seulement)
 *     tags: [Dishes]
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
 *         description: Plat supprimé
 *       401:
 *         description: Authentification requise
 *       403:
 *         description: Accès non autorisé
 *       500:
 *         description: Erreur serveur
 */
export async function DELETE(request: Request, segmentData: { params: Params }) {
  const authResult = await requireRole(["ADMIN", "MANAGER"]);
  
  if (authResult.response) {
    return authResult.response;
  }
  
  try {
    const { id } = await segmentData.params;
    // Récupérer le plat avant suppression pour obtenir les images
    const dish = await prisma.dish.findUnique({ where: { id } });
    if (dish) {
      // Supprimer les images de Cloudinary
      await deleteCloudinaryImages(dish.images);
    }
    // Supprimer le plat de la base de données
    await prisma.dish.delete({ where: { id } });
    return NextResponse.json({ succès: true });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de supprimer le plat' }, { status: 500 });
  }
}
