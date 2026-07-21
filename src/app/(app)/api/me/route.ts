import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

function buildName(firstName?: string | null, lastName?: string | null) {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim() || null;
}

export async function GET() {
  const authResult = await requireAuth();

  if (authResult.response) {
    return authResult.response;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: authResult.session.user.id },
    });

    if (!user) {
      return NextResponse.json({ erreur: 'Utilisateur introuvable' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer le profil' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authResult = await requireAuth();

  if (authResult.response) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : undefined;
    const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : undefined;
    const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined;

    const user = await prisma.user.update({
      where: { id: authResult.session.user.id },
      data: {
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(firstName !== undefined || lastName !== undefined
          ? { name: buildName(firstName ?? authResult.session.user.firstName, lastName ?? authResult.session.user.lastName) }
          : {}),
      },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de mettre à jour le profil' }, { status: 500 });
  }
}
