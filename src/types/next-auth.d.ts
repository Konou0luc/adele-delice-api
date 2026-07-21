import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }

  interface User {
    id: string;
    role: string;
    firstName: string;
    lastName: string;
    password?: string | null;
    name?: string | null;
    emailVerified?: Date | null;
    phone?: string | null;
    isActive?: boolean;
    image?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    firstName: string;
    lastName: string;
  }
}
