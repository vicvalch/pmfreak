import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const protectedRoutes = ["/dashboard", "/onboarding", "/upload", "/portfolio"];
const authRoutes = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/upload/:path*", "/portfolio/:path*", "/login", "/signup"],
};
