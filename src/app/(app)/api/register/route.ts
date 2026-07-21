import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Créer un nouveau compte utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Email déjà utilisé
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ erreur: 'Email déjà utilisé' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        name: `${firstName} ${lastName}`,
      },
    });

    return NextResponse.json(
      { user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ erreur: 'Erreur lors de la création du compte' }, { status: 500 });
  }
}
