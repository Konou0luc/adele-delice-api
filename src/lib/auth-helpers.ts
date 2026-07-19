import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";

/**
 * Vérifie si l'utilisateur est connecté
 */
export async function requireAuth(): Promise<{
  session: Session;
  response: null;
} | {
  session: null;
  response: NextResponse;
}> {
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
  
  return { session, response: null };
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
