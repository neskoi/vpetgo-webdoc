import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isSupportedLocale, resolvePreferredLocale } from "@/shared/i18n/locales";

const PUBLIC_FILE = /\.(.*)$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const firstSegment = pathname.split("/")[1];

  if (isSupportedLocale(firstSegment)) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    const locale = resolvePreferredLocale(request.headers.get("accept-language"));
    return NextResponse.redirect(new URL(`/${locale}/docs`, request.url));
  }

  return NextResponse.redirect(new URL(`/${defaultLocale}/docs`, request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
