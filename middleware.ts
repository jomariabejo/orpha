import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow access to auth pages and API routes
    if (
      req.nextUrl.pathname.startsWith("/auth") ||
      req.nextUrl.pathname.startsWith("/api/auth")
    ) {
      return NextResponse.next();
    }

    // Check if user is authenticated
    const token = req.nextauth.token;
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    // Check role-based access
    const userRole = (token as any).role;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin/");
    if (isAdminRoute && userRole !== "admin") {
      return NextResponse.redirect(new URL("/monitoring", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/monitoring/:path*",
    "/admin/:path*",
    "/api/monitoring/:path*",
    "/api/admin/:path*",
  ],
}; 