import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';

/**
 * @swagger
 * /api/blog-posts:
 *   get:
 *     summary: Récupérer les articles de blog publiés
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: all
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Liste des articles de blog
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BlogPost'
 *       500:
 *         description: Erreur serveur
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    
    const where: Record<string, unknown> = {};
    if (!all) where.isPublished = true;

    const blogPosts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(blogPosts);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer les articles de blog' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/blog-posts:
 *   post:
 *     summary: Créer un article de blog
 *     tags: [Blog]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlogPost'
 *     responses:
 *       201:
 *         description: Article de blog créé
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: Request) {
  const authResult = await requireRole(["ADMIN", "MANAGER"]);
  if (authResult.response) return authResult.response;
  
  try {
    const body = await request.json();
    const blogPost = await prisma.blogPost.create({
      data: body
    });
    return NextResponse.json(blogPost, { status: 201 });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de créer l\'article de blog' }, { status: 500 });
  }
}
