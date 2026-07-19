import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { deleteCloudinaryImages } from '@/lib/cloudinary-utils';
import { requireRole } from '@/lib/auth-helpers';

type Params = Promise<{ id: string }>;

/**
 * @swagger
 * /api/blog-posts/{id}:
 *   get:
 *     summary: Récupérer un article de blog par son ID
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article trouvé
 *       404:
 *         description: Article non trouvé
 *       500:
 *         description: Erreur serveur
 */
export async function GET(request: Request, segmentData: { params: Params }) {
  try {
    const { id } = await segmentData.params;
    const blogPost = await prisma.blogPost.findUnique({
      where: { id }
    });
    if (!blogPost) return NextResponse.json({ erreur: 'Article introuvable' }, { status: 404 });
    return NextResponse.json(blogPost);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer l\'article' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/blog-posts/{id}:
 *   put:
 *     summary: Mettre à jour un article de blog
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlogPost'
 *     responses:
 *       200:
 *         description: Article mis à jour
 *       500:
 *         description: Erreur serveur
 */
export async function PUT(request: Request, segmentData: { params: Params }) {
  const authResult = await requireRole(["ADMIN", "MANAGER"]);
  if (authResult.response) return authResult.response;

  try {
    const { id } = await segmentData.params;
    const body = await request.json();
    const blogPost = await prisma.blogPost.update({
      where: { id },
      data: body
    });
    return NextResponse.json(blogPost);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de mettre à jour l\'article' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/blog-posts/{id}:
 *   delete:
 *     summary: Supprimer un article de blog et son image sur Cloudinary (ADMIN/MANAGER seulement)
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article supprimé
 *       401:
 *         description: Authentification requise
 *       403:
 *         description: Accès non autorisé
 *       500:
 *         description: Erreur serveur
 */
export async function DELETE(request: Request, segmentData: { params: Params }) {
  const authResult = await requireRole(["ADMIN", "MANAGER"]);
  if (authResult.response) return authResult.response;

  try {
    const { id } = await segmentData.params;
    const blogPost = await prisma.blogPost.findUnique({ where: { id } });
    if (blogPost && blogPost.imageUrl) {
      await deleteCloudinaryImages([blogPost.imageUrl]);
    }
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ succès: true });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de supprimer l\'article' }, { status: 500 });
  }
}
