import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { deleteCloudinaryImages } from '@/lib/cloudinary-utils';
import { requireRole } from '@/lib/auth-helpers';

type Params = Promise<{ id: string }>;

/**
 * @swagger
 * /api/menus/{id}:
 *   get:
 *     summary: Récupérer un menu par son ID
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu trouvé
 *       404:
 *         description: Menu non trouvé
 *       500:
 *         description: Erreur serveur
 */
export async function GET(request: Request, segmentData: { params: Params }) {
  try {
    const { id } = await segmentData.params;
    const menu = await prisma.menu.findUnique({
      where: { id },
      include: { menuItems: { include: { dish: true } } }
    });
    if (!menu) return NextResponse.json({ erreur: 'Menu introuvable' }, { status: 404 });
    return NextResponse.json(menu);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer le menu' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/menus/{id}:
 *   put:
 *     summary: Mettre à jour un menu (ADMIN/MANAGER seulement)
 *     tags: [Menus]
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
 *             $ref: '#/components/schemas/Menu'
 *     responses:
 *       200:
 *         description: Menu mis à jour
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
    const menu = await prisma.menu.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        type: body.type,
        date: body.date ? new Date(body.date) : null,
        dayOfWeek: body.dayOfWeek ?? null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        imageUrl: body.imageUrl,
        isActive: body.isActive ?? true,
        menuItems: body.menuItems
          ? {
              deleteMany: {},
              create: body.menuItems.map((item: Record<string, unknown>) => ({
                dishId: item.dishId as string,
                price: item.price as number,
                quantity: item.quantity as number
              }))
            }
          : undefined
      },
      include: { menuItems: { include: { dish: true } } }
    });
    return NextResponse.json(menu);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de mettre à jour le menu' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/menus/{id}:
 *   delete:
 *     summary: Supprimer un menu et son image sur Cloudinary (ADMIN/MANAGER seulement)
 *     tags: [Menus]
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
 *         description: Menu supprimé
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
    const menu = await prisma.menu.findUnique({ where: { id } });
    if (menu && menu.imageUrl) {
      await deleteCloudinaryImages([menu.imageUrl]);
    }
    await prisma.menu.delete({ where: { id } });
    return NextResponse.json({ succès: true });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de supprimer le menu' }, { status: 500 });
  }
}
