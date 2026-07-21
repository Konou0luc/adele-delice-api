import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';

/**
 * @swagger
 * /api/menu-items:
 *   get:
 *     summary: Récupérer tous les éléments de menu
 *     tags: [MenuItems]
 *     responses:
 *       200:
 *         description: Liste des éléments de menu
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MenuItem'
 *       500:
 *         description: Erreur serveur
 */
export async function GET() {
  const authResult = await requireRole(["ADMIN", "MANAGER", "EMPLOYEE"]);
  if (authResult.response) return authResult.response;
  
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: { menu: true, dish: true }
    });
    return NextResponse.json(menuItems);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer les éléments de menu' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/menu-items:
 *   post:
 *     summary: Ajouter un élément à un menu (ADMIN/MANAGER seulement)
 *     tags: [MenuItems]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuItem'
 *     responses:
 *       201:
 *         description: Élément de menu créé
 *       401:
 *         description: Authentification requise
 *       403:
 *         description: Accès non autorisé
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: Request) {
  const authResult = await requireRole(["ADMIN", "MANAGER"]);
  if (authResult.response) return authResult.response;
  
  try {
    const body = await request.json();
    const menuItem = await prisma.menuItem.create({
      data: body
    });
    return NextResponse.json(menuItem, { status: 201 });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de créer l\'élément de menu' }, { status: 500 });
  }
}
