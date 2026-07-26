export type ProfileUpdateSessionUser = {
  id: string;
  email: string;
  role?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export type ProfileUpdateExistingUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role?: string | null;
  image?: string | null;
  name?: string | null;
  isActive?: boolean | null;
};

export type ProfileUpdateBody = {
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export function resolveProfileUpdateOperation({
  sessionUser,
  existingUser,
  body,
}: {
  sessionUser: ProfileUpdateSessionUser;
  existingUser: ProfileUpdateExistingUser | null;
  body: ProfileUpdateBody;
}) {
  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : undefined;
  const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : undefined;
  const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined;

  if (existingUser) {
    return {
      mode: 'update' as const,
      where: { id: existingUser.id },
      data: {
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(firstName !== undefined || lastName !== undefined
          ? { name: `${firstName ?? existingUser.firstName ?? ''} ${lastName ?? existingUser.lastName ?? ''}`.trim() || null }
          : {}),
      },
    };
  }

  return {
    mode: 'create' as const,
    create: {
      id: sessionUser.id,
      email: sessionUser.email,
      firstName: firstName ?? sessionUser.firstName ?? undefined,
      lastName: lastName ?? sessionUser.lastName ?? undefined,
      phone: phone ?? undefined,
      name: `${firstName ?? sessionUser.firstName ?? ''} ${lastName ?? sessionUser.lastName ?? ''}`.trim() || null,
      role: (sessionUser.role === 'ADMIN' || sessionUser.role === 'MANAGER' || sessionUser.role === 'EMPLOYEE'
        ? sessionUser.role
        : 'EMPLOYEE') as 'ADMIN' | 'MANAGER' | 'EMPLOYEE',
      isActive: true,
      image: undefined,
    },
  };
}
