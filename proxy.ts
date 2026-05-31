import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const session = await auth();
  const isAuth = !!session?.user;
  const pathname = request.nextUrl.pathname;

  const isPublicPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/user") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico";

  if (!isAuth && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuth && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
