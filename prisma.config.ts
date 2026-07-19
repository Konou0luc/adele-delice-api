import { defineConfig } from "prisma/config";

// On crée l'adapter seulement en runtime, pas pendant la génération
// Ceci permet à `prisma generate` de fonctionner sans DATABASE_URL
export default defineConfig({});
