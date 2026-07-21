import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Adèle Délice - Documentation",
  description: "Documentation de l'API Adèle Délice",
};

export default function DocLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
