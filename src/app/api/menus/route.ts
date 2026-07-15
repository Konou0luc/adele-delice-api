import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
