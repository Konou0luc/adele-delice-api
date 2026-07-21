import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signIn } from '@/auth';

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Se connecter avec email et mot de passe
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
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Identifiants invalides
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json({ erreur: 'Identifiants invalides' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ erreur: 'Identifiants invalides' }, { status: 401 });
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    return NextResponse.json({ ...result, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
  } catch {
    return NextResponse.json({ erreur: 'Erreur lors de la connexion' }, { status: 500 });
  }
}
