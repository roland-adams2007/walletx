import { NextRequest, NextResponse } from "next/server";

const publicOnlyRoutes = ["/login", "/register", "/forgot-password"];
const protectedRoutes = ["/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("refresh_token");

  if (pathname === "/dashboard/settings") {
    return NextResponse.redirect(
      new URL("/dashboard/settings/profile", request.url),
    );
  }

  if (hasSession && publicOnlyRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!hasSession && protectedRoutes.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/forgot-password", "/dashboard/:path*"],
};
