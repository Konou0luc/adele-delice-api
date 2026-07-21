import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL!,
].filter(Boolean);

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");

  // Préflight
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }

    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );

    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    response.headers.set(
      "Access-Control-Allow-Credentials",
      "true"
    );

    return response;
  }

  const response = NextResponse.next();

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );

  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  response.headers.set(
    "Access-Control-Allow-Credentials",
    "true"
  );

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};