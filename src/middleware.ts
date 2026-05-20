import { NextRequest, NextResponse } from "next/server";
import { cookieName, verifyAdminSessionToken } from "@/lib/admin-session";

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith("/admin")) {
        const isLoginPage = pathname === "/admin/login";
        const isAuthenticated = await verifyAdminSessionToken(
            req.cookies.get(cookieName)?.value
        );

        if (!isAuthenticated && !isLoginPage) {
            const url = new URL("/admin/login", req.url);
            return NextResponse.redirect(url);
        }

        if (isAuthenticated && isLoginPage) {
            const url = new URL("/admin", req.url);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"]
}; 
