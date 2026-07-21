import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs actifs (ADMIN/MANAGER seulement)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentification requise
 *       403:
 *         description: Accès non autorisé
 *       500:
 *         description: Erreur serveur
 */
export async function GET() {
  const authResult = await requireRole(["ADMIN", "MANAGER"]);
  
  if (authResult.response) {
    return authResult.response;
  }
  
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true }
    });
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer les utilisateurs' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Créer un nouvel utilisateur (ADMIN seulement)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MANAGER, EMPLOYEE]
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       401:
 *         description: Authentification requise
 *       403:
 *         description: Accès non autorisé
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: Request) {
  const authResult = await requireRole(["ADMIN"]);
  
  if (authResult.response) {
    return authResult.response;
  }
  
  try {
    const body = await request.json();
    const user = await prisma.user.create({
      data: body
    });
    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de créer l\'utilisateur' }, { status: 500 });
  }
}
