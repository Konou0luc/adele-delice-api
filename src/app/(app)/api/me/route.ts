import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

function buildName(firstName?: string | null, lastName?: string | null) {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim() || null;
}

async function findCurrentUser(user: { id: string; email: string }) {
  return prisma.user.findFirst({
    where: {
      OR: [{ id: user.id }, { email: user.email }],
    },
  });
}

function buildFallbackUser(session: {
  user: { id: string; email: string; firstName?: string | null; lastName?: string | null; image?: string | null; role?: string | null };
  expires: string;
}) {
  return {
    id: session.user.id,
    email: session.user.email,
    name: buildName(session.user.firstName, session.user.lastName),
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    phone: null,
    image: session.user.image ?? null,
    role: session.user.role ?? 'EMPLOYEE',
    isActive: true,
    createdAt: session.expires,
    updatedAt: session.expires,
  };
}

export async function GET() {
  const authResult = await requireAuth();

  if (authResult.response) {
    return authResult.response;
  }

  const session = authResult.session;

  if (!session) {
    return NextResponse.json({ erreur: 'Authentification requise' }, { status: 401 });
  }

  try {
    const user = await findCurrentUser(session.user);

    if (!user) {
      return NextResponse.json(buildFallbackUser(session));
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

  const session = authResult.session;

  if (!session) {
    return NextResponse.json({ erreur: 'Authentification requise' }, { status: 401 });
  }

  try {
    const currentUser = await findCurrentUser(session.user);

    const body = await request.json();
    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : undefined;
    const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : undefined;
    const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined;

    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      create: {
        id: currentUser?.id ?? session.user.id,
        email: session.user.email,
        firstName: firstName ?? currentUser?.firstName ?? session.user.firstName,
        lastName: lastName ?? currentUser?.lastName ?? session.user.lastName,
        phone: phone ?? currentUser?.phone ?? undefined,
        name: buildName(
          firstName ?? currentUser?.firstName ?? session.user.firstName,
          lastName ?? currentUser?.lastName ?? session.user.lastName
        ),
        role: (session.user.role ?? 'EMPLOYEE') as any,
        isActive: true,
        image: currentUser?.image ?? undefined,
      },
      update: {
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(firstName !== undefined || lastName !== undefined
          ? { name: buildName(firstName ?? currentUser?.firstName, lastName ?? currentUser?.lastName) }
          : {}),
      },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de mettre à jour le profil' }, { status: 500 });
  }
}
