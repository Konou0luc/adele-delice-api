import cloudinary from './cloudinary';

// Fonction pour extraire le public ID d'une URL Cloudinary
export function extractPublicId(url: string): string | null {
  try {
    // Exemple d'URL : https://res.cloudinary.com/dgdwwp7lq/image/upload/v123456789/adele-delice/abc123.jpg
    const urlParts = url.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) return null;

    // Récupérer la partie après upload/ et avant l'extension
    const pathParts = urlParts.slice(uploadIndex + 1);
    // Enlever la version (v...)
    const filteredParts = pathParts.filter(part => !part.startsWith('v'));
    // Joindre et enlever l'extension
    const publicIdWithExt = filteredParts.join('/');
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
    return publicId;
  } catch {
    return null;
  }
}

// Fonction pour supprimer une ou plusieurs images de Cloudinary
export async function deleteCloudinaryImages(urls: string[]) {
  const promises = urls.map(async (url) => {
    const publicId = extractPublicId(url);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error(`Erreur lors de la suppression de l'image ${url}:`, error);
      }
    }
  });
  await Promise.all(promises);
}
