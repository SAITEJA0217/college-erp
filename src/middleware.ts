import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getRoleFromPathname, ROLE_HOME } from "@/config/navigation";
import { isDashboardRole, type AppRole } from "@/types/roles";
import { isSupabaseConfigured } from "@/lib/auth/foundation";

const PROTECTED_PREFIXES = [
  "/student",
  "/faculty",
  "/hod",
  "/placement",
  "/admin",
];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow local UI exploration until real Supabase credentials are configured.
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  const { supabase, user, supabaseResponse } = await updateSession(request);

  if (pathname === "/login" && user) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = (data as { role: AppRole } | null)?.role;
    const destination =
      role && isDashboardRole(role) ? ROLE_HOME[role] : "/login";

    if (destination !== "/login") {
      const url = request.nextUrl.clone();
      url.pathname = destination;
      return NextResponse.redirect(url);
    }
  }

  if (isProtectedPath(pathname)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = (data as { role: AppRole } | null)?.role;
    const requiredRole = getRoleFromPathname(pathname);

    if (!role || !isDashboardRole(role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (requiredRole && role !== requiredRole) {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_HOME[role];
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
