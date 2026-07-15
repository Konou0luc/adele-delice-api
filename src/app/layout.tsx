import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "API Adèle Délice",
  description: "API pour le restaurant Adèle Délice",
};

export default function RootLayout({
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
