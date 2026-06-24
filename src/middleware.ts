import { NextRequest, NextResponse } from "next/server";
import { cookieName, verifyAdminSessionToken } from "@/lib/admin-session";

const protectedApiPrefixes = [
    "/api/admin",
    "/api/campaigns",
    "/api/collection-images",
    "/api/create-admin",
    "/api/customers",
    "/api/firebase-instructions",
    "/api/firebase-simple-test",
    "/api/hero-images",
    "/api/kudat-orders",
    "/api/products",
    "/api/sales",
    "/api/test-firebase",
    "/api/toptan-satis",
    "/api/updateAdminPassword",
    "/api/upload",
    "/api/upload-existing-images",
    "/api/whatsapp",
];

const publicApiReads = new Set([
    "/api/catalog/categories",
    "/api/catalog/tree",
    "/api/products",
]);

const publicApiPrefixes = [
    "/api/qanta-order-decision/",
    "/api/qanta-order-receipt/",
    "/api/qanta-order-tracking/",
];

const publicApiPosts = new Set([
    "/api/admin/access/login",
    "/api/newsletters",
    "/api/newsletters-firebase",
    "/api/newsletters/count",
    "/api/qanta-wholesale-order",
]);

function isPublicApiRequest(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    if (req.method === "GET" && publicApiReads.has(pathname)) return true;
    if (req.method === "POST" && publicApiPosts.has(pathname)) return true;
    return publicApiPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isProtectedApiRequest(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    if (!pathname.startsWith("/api/")) return false;
    if (isPublicApiRequest(req)) return false;

    return protectedApiPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const isAuthenticated = await verifyAdminSessionToken(
        req.cookies.get(cookieName)?.value
    );

    if (isProtectedApiRequest(req) && !isAuthenticated) {
        return NextResponse.json(
            { success: false, error: "Oturum gerekli" },
            { status: 401 }
        );
    }

    if (pathname.startsWith("/admin")) {
        const isLoginPage = pathname === "/admin/login";

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
    matcher: ["/admin/:path*", "/api/:path*"]
};
