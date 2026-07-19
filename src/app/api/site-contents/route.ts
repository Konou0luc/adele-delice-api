import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';

/**
 * @swagger
 * /api/site-contents:
 *   get:
 *     summary: Récupérer le contenu du site
 *     tags: [SiteContent]
 *     parameters:
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contenu du site
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/SiteContent'
 *                 - $ref: '#/components/schemas/SiteContent'
 *       404:
 *         description: Clé non trouvée
 *       500:
 *         description: Erreur serveur
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (key) {
      const siteContent = await prisma.siteContent.findUnique({
        where: { key }
      });
      if (!siteContent) return NextResponse.json({ erreur: 'Clé non trouvée' }, { status: 404 });
      return NextResponse.json(siteContent);
    }

    const siteContents = await prisma.siteContent.findMany();
    return NextResponse.json(siteContents);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer le contenu du site' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/site-contents:
 *   post:
 *     summary: Ajouter ou mettre à jour du contenu du site
 *     tags: [SiteContent]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SiteContent'
 *     responses:
 *       201:
 *         description: Contenu créé ou mis à jour
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: Request) {
  const authResult = await requireRole(["ADMIN", "MANAGER"]);
  if (authResult.response) return authResult.response;
  
  try {
    const body = await request.json();
    const siteContent = await prisma.siteContent.upsert({
      where: { key: body.key },
      update: { value: body.value },
      create: body
    });
    return NextResponse.json(siteContent, { status: 201 });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de sauvegarder le contenu' }, { status: 500 });
  }
}
