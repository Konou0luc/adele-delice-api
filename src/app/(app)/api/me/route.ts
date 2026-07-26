import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { resolveProfileUpdateOperation } from '@/lib/profile-update';
import bcrypt from 'bcryptjs';

function buildName(firstName?: string | null, lastName?: string | null) {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim() || null;
}

function normalizePhone(phone?: string | null) {
  return phone?.replace(/\s+/g, '').trim() || null;
}

function isValidTogolesePhone(phone?: string | null) {
  if (!phone) {
    return false;
  }

  const normalized = normalizePhone(phone);
  return typeof normalized === 'string' && /^\+228\d{8}$/.test(normalized);
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
    const rawPhone = typeof body.phone === 'string' ? body.phone.trim() : undefined;
    const phone = rawPhone ? normalizePhone(rawPhone) : undefined;

    if (rawPhone && !isValidTogolesePhone(rawPhone)) {
      return NextResponse.json(
        { erreur: 'Le numéro de téléphone doit être togolais et respecter le format +228XXXXXXXX.' },
        { status: 400 }
      );
    }

    const operation = resolveProfileUpdateOperation({
      sessionUser: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
      },
      existingUser: currentUser,
      body: {
        firstName,
        lastName,
        phone: phone ?? undefined,
      },
    });

    let user;

    if (operation.mode === 'update') {
      user = await prisma.user.update({
        where: operation.where,
        data: operation.data,
      });
    } else {
      // Validate required fields before attempting to create to avoid DB null-constraint errors
      const createPayload = operation.create;

      if (!createPayload || !createPayload.email) {
        console.error('Profile create failed - missing required email', { createPayload, session: session.user });
        return NextResponse.json({ erreur: 'Impossible de créer le profil : email manquant' }, { status: 400 });
      }

      // Log the payload to detect any nulls that would violate DB constraints
      console.error('Creating user payload for prisma.user.create', createPayload);

      // Ensure required DB columns are provided. The migrations in the DB mark
      // `password`, `firstName` and `lastName` as NOT NULL — supply safe
      // defaults so the insert doesn't violate constraints.
      const tempPlain = Math.random().toString(36).slice(2) + Date.now().toString();
      const hashed = await bcrypt.hash(tempPlain, 10);

      const safeCreatePayload = {
        ...createPayload,
        password: hashed,
        firstName: createPayload.firstName ?? '',
        lastName: createPayload.lastName ?? '',
      } as any;

      user = await prisma.user.create({
        data: safeCreatePayload,
      });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    // Log error with driver adapter details when available
    console.error('Profile update failed', error?.message ?? error);
    try {
      if (error?.meta?.driverAdapterError) {
        console.error('Driver adapter error cause:', error.meta.driverAdapterError.cause || error.meta.driverAdapterError);
      } else if (error?.meta) {
        console.error('Prisma meta:', error.meta);
      }
    } catch (e) {
      console.error('Failed to log adapter error details', e);
    }

    return NextResponse.json({ erreur: 'Impossible de mettre à jour le profil' }, { status: 500 });
  }
}
