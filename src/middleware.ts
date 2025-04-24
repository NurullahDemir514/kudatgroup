import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // Admin sayfaları için kontrol
    if (pathname.startsWith("/admin")) {
        // Login sayfası kontrolü
        const isLoginPage = pathname === "/admin/login";

        // JWT token kontrolü - kullanıcı giriş yapmış mı?
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET || "gizli-anahtar-bulten-admin-panel"
        });

        const isAuthenticated = !!token;

        // 1. Kullanıcı giriş yapmamış ve login sayfasında değilse - Login sayfasına yönlendir
        if (!isAuthenticated && !isLoginPage) {
            const url = new URL("/admin/login", req.url);
            return NextResponse.redirect(url);
        }

        // 2. Kullanıcı giriş yapmış ve login sayfasındaysa - Admin ana sayfasına yönlendir
        if (isAuthenticated && isLoginPage) {
            const url = new URL("/admin", req.url);
            return NextResponse.redirect(url);
        }

        // 3. Kullanıcı admin değilse - Ana sayfaya yönlendir
        if (isAuthenticated && token.role !== "admin" && !isLoginPage) {
            const url = new URL("/", req.url);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"]
}; 