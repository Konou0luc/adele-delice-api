import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';

/**
 * @swagger
 * /api/menus:
 *   get:
 *     summary: Récupérer tous les menus actifs
 *     tags: [Menus]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [DAILY, WEEKLY, SPECIAL]
 *     responses:
 *       200:
 *         description: Liste des menus
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Menu'
 *       500:
 *         description: Erreur serveur
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    const where: Record<string, unknown> = { isActive: true };
    if (type) where.type = type;

    const menus = await prisma.menu.findMany({
      where,
      include: { menuItems: { include: { dish: true } } }
    });
    return NextResponse.json(menus);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer les menus' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/menus:
 *   post:
 *     summary: Créer un nouveau menu (ADMIN/MANAGER seulement)
 *     tags: [Menus]
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
 *               type:
 *                 type: string
 *                 enum: [DAILY, WEEKLY, SPECIAL]
 *               date:
 *                 type: string
 *                 format: date-time
 *               dayOfWeek:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               imageUrl:
 *                 type: string
 *               menuItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dishId:
 *                       type: string
 *                     price:
 *                       type: number
 *                     quantity:
 *                       type: number
 *     responses:
 *       201:
 *         description: Menu créé
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
    const menu = await prisma.menu.create({
      data: {
        name: body.name,
        description: body.description,
        type: body.type,
        date: body.date ? new Date(body.date) : null,
        dayOfWeek: body.dayOfWeek,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        imageUrl: body.imageUrl,
        menuItems: body.menuItems ? {
          create: body.menuItems.map((item: Record<string, unknown>) => ({
            dishId: item.dishId as string,
            price: item.price as number,
            quantity: item.quantity as number
          }))
        } : undefined
      },
      include: { menuItems: true }
    });
    return NextResponse.json(menu, { status: 201 });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de créer le menu' }, { status: 500 });
  }
}
