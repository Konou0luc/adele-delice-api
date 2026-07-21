import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { requireRole } from '@/lib/auth-helpers';

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Uploader une image sur Cloudinary (ADMIN/MANAGER/EMPLOYEE seulement)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploadée avec succès
 *       401:
 *         description: Authentification requise
 *       403:
 *         description: Accès non autorisé
 *       400:
 *         description: Aucun fichier fourni
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: Request) {
  const authResult = await requireRole(["ADMIN", "MANAGER", "EMPLOYEE"]);
  
  if (authResult.response) {
    return authResult.response;
  }
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Convertir le fichier en buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Uploader sur Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'adele-delice',
          resource_type: 'auto',
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload de l\'image' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/upload:
 *   delete:
 *     summary: Supprimer une image de Cloudinary (ADMIN/MANAGER/EMPLOYEE seulement)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               publicId:
 *                 type: string
 *                 description: Public ID de l'image Cloudinary
 *     responses:
 *       200:
 *         description: Image supprimée avec succès
 *       401:
 *         description: Authentification requise
 *       403:
 *         description: Accès non autorisé
 *       400:
 *         description: Aucun public ID fourni
 *       500:
 *         description: Erreur serveur
 */
export async function DELETE(request: Request) {
  const authResult = await requireRole(["ADMIN", "MANAGER", "EMPLOYEE"]);
  
  if (authResult.response) {
    return authResult.response;
  }
  
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: 'Aucun public ID fourni' },
        { status: 400 }
      );
    }

    // Supprimer de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'image' },
      { status: 500 }
    );
  }
}

