import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';

type Params = Promise<{ id: string }>;

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Approuver ou rejeter un avis
 *     tags: [Reviews]
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
 *             type: object
 *             properties:
 *               isApproved:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Avis mis à jour
 *       500:
 *         description: Erreur serveur
 */
export async function PUT(request: Request, segmentData: { params: Params }) {
  const authResult = await requireRole(["ADMIN", "MANAGER"]);
  if (authResult.response) return authResult.response;

  try {
    const { id } = await segmentData.params;
    const body = await request.json();
    const review = await prisma.review.update({
      where: { id },
      data: { isApproved: body.isApproved }
    });
    return NextResponse.json(review);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de mettre à jour l\'avis' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Supprimer un avis (ADMIN/MANAGER seulement)
 *     tags: [Reviews]
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
 *         description: Avis supprimé
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
    await prisma.review.delete({
      where: { id }
    });
    return NextResponse.json({ succès: true });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de supprimer l\'avis' }, { status: 500 });
  }
}
