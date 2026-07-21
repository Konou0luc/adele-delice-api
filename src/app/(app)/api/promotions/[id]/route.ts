import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';

type Params = Promise<{ id: string }>;

/**
 * @swagger
 * /api/promotions/{id}:
 *   get:
 *     summary: Récupérer une promotion par son ID
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Promotion trouvée
 *       404:
 *         description: Promotion non trouvée
 *       500:
 *         description: Erreur serveur
 */
export async function GET(request: Request, segmentData: { params: Params }) {
  try {
    const { id } = await segmentData.params;
    const promotion = await prisma.promotion.findUnique({
      where: { id },
      include: { dish: true }
    });
    if (!promotion) return NextResponse.json({ erreur: 'Promotion introuvable' }, { status: 404 });
    return NextResponse.json(promotion);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer la promotion' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/promotions/{id}:
 *   put:
 *     summary: Mettre à jour une promotion
 *     tags: [Promotions]
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
 *             $ref: '#/components/schemas/Promotion'
 *     responses:
 *       200:
 *         description: Promotion mise à jour
 *       500:
 *         description: Erreur serveur
 */
export async function PUT(request: Request, segmentData: { params: Params }) {
  const authResult = await requireRole(["ADMIN", "MANAGER"]);
  if (authResult.response) return authResult.response;

  try {
    const { id } = await segmentData.params;
    const body = await request.json();
    const data: Record<string, unknown> = { ...body };
    if (body.startDate) data.startDate = new Date(body.startDate);
    if (body.endDate) data.endDate = new Date(body.endDate);
    
    const promotion = await prisma.promotion.update({
      where: { id },
      data
    });
    return NextResponse.json(promotion);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de mettre à jour la promotion' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/promotions/{id}:
 *   delete:
 *     summary: Supprimer une promotion (désactive) (ADMIN/MANAGER seulement)
 *     tags: [Promotions]
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
 *         description: Promotion désactivée
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
    const promotion = await prisma.promotion.update({
      where: { id },
      data: { isActive: false }
    });
    return NextResponse.json({ succès: true, promotion });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de supprimer la promotion' }, { status: 500 });
  }
}
