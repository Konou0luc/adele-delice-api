import { auth } from "@/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { verifyApiToken } from "@/lib/api-token";

type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";

type AuthenticatedSession = Session & {
  user: Session["user"] & {
    id: string;
    role: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

async function getBearerToken() {
  const headerStore = await headers();
  const authorization = headerStore.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

/**
 * Vérifie si l'utilisateur est connecté
 */
export async function requireAuth(): Promise<{
  session: AuthenticatedSession;
  response: null;
} | {
  session: null;
  response: NextResponse;
}> {
  const bearerToken = await getBearerToken();

  if (bearerToken) {
    const payload = verifyApiToken(bearerToken);

    if (payload) {
      return {
        session: {
          user: {
            id: payload.sub,
            role: payload.role,
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
          },
          expires: new Date(payload.exp * 1000).toISOString(),
        },
        response: null,
      };
    }
  }

  const session = await auth();
  
  if (!session || !session.user) {
    return {
      session: null,
      response: NextResponse.json(
        { erreur: "Authentification requise" },
        { status: 401 }
      ),
    };
  }
  
  return { session: session as AuthenticatedSession, response: null };
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export async function requireRole(allowedRoles: Role[]) {
  const authResult = await requireAuth();
  
  if (authResult.response) {
    return authResult;
  }
  
  const userRole = authResult.session.user.role as Role;
  
  if (!allowedRoles.includes(userRole)) {
    return {
      session: null,
      response: NextResponse.json(
        { erreur: "Accès non autorisé" },
        { status: 403 }
      ),
    };
  }
  
  return authResult;
}
