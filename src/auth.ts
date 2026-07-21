import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        // Convert Prisma user to NextAuth user (replace null with empty strings)
        return {
          id: user.id,
          role: user.role,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email,
          password: user.password,
          name: user.name,
          emailVerified: user.emailVerified,
          phone: user.phone,
          isActive: user.isActive,
          image: user.image,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        // Assurez-vous que l'utilisateur a un rôle et les champs prénom/nom
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            // Mettre à jour si besoin
            firstName: profile?.given_name || "",
            lastName: profile?.family_name || "",
            image: profile?.picture || null,
          },
          create: {
            email: user.email,
            name: user.name || null,
            firstName: profile?.given_name || "",
            lastName: profile?.family_name || "",
            image: profile?.picture || null,
            role: "EMPLOYEE", // Rôle par défaut pour les nouveaux utilisateurs Google
          },
        });
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName || "";
        token.lastName = user.lastName || "";
      }
      
      // Si c'est une connexion Google, on met à jour le token avec les infos du profil
      if (account?.provider === "google" && profile) {
        const dbUser = await prisma.user.findUnique({
          where: { email: profile.email! },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.firstName = dbUser.firstName || "";
          token.lastName = dbUser.lastName || "";
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
      }
      return session;
    },
  },
});
