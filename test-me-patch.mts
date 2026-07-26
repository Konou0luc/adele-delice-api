import { createApiToken } from './src/lib/api-token.ts';
import prisma from './src/lib/prisma.ts';

async function main() {
  const email = 'konouluc0@gmail.com';
  const user = await prisma.user.findUnique({ where: { email } });
  console.log(
    'DB user:',
    user
      ? {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
        }
      : 'NOT FOUND'
  );

  if (user) {
    const token = createApiToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      firstName: user.firstName || 'Luc',
      lastName: user.lastName || 'KONOU',
    });
    const res = await fetch('http://localhost:3001/api/me', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Luc',
        lastName: 'KONOU',
        phone: '+22897240460',
      }),
    });
    console.log('UUID PATCH status:', res.status);
    console.log('UUID PATCH body:', await res.text());
  }

  const googleSub = '108234567890123456789';
  const token2 = createApiToken({
    sub: googleSub,
    role: 'EMPLOYEE',
    email,
    firstName: 'Luc',
    lastName: 'KONOU',
  });
  const res2 = await fetch('http://localhost:3001/api/me', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token2}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName: 'Luc',
      lastName: 'KONOU',
      phone: '+22897240460',
    }),
  });
  console.log('Google sub PATCH status:', res2.status);
  console.log('Google sub PATCH body:', await res2.text());

  try {
    const created = await prisma.user.upsert({
      where: { email },
      create: {
        id: googleSub,
        email,
        firstName: 'Luc',
        lastName: 'KONOU',
        phone: '+22897240460',
        name: 'Luc KONOU',
        role: 'EMPLOYEE',
        isActive: true,
      },
      update: {
        firstName: 'Luc',
        lastName: 'KONOU',
        phone: '+22897240460',
        name: 'Luc KONOU',
      },
    });
    console.log('Direct upsert OK:', created.id);
  } catch (error) {
    console.error('Direct upsert error:', error);
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
