"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const navItems = [
    { name: "Katalog", path: "/admin/catalog" },
    { name: "Ürünler", path: "/admin/products" },
    { name: "Siparişler", path: "/admin/orders" },
    { name: "Ayarlar", path: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    if (pathname === "/admin/login") return <>{children}</>;

    const logout = async () => {
        await fetch("/api/admin/access/logout", { method: "POST" });
        window.location.href = "/admin/login";
    };

    return (
        <div className="min-h-screen bg-[#f7f4ef] text-[#171411]">
            <header className="sticky top-0 z-20 bg-[#f7f4ef]/90 backdrop-blur-xl">
                <div className="mx-auto flex min-h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:min-h-16 sm:px-8">
                    <Link href="/admin/catalog" className="flex shrink-0 items-center">
                        <img
                            src="/kudattr.png"
                            alt="Kudat"
                            className="h-auto w-[112px] object-contain sm:w-[132px]"
                        />
                    </Link>

                    <nav className="flex min-w-0 items-center gap-0.5 overflow-x-auto rounded-full bg-white/70 p-1 shadow-sm ring-1 ring-black/5">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium transition sm:px-4 sm:py-2 sm:text-sm ${
                                        isActive
                                            ? "bg-black text-white"
                                            : "text-black/50 hover:text-black"
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                        <button
                            type="button"
                            onClick={logout}
                            className="shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium text-black/40 transition hover:text-black sm:px-4 sm:py-2 sm:text-sm"
                        >
                            Çıkış
                        </button>
                    </nav>
                </div>
            </header>

            <main className="mx-auto h-[calc(100vh-56px)] w-full max-w-7xl overflow-hidden px-4 py-3 sm:h-[calc(100vh-64px)] sm:px-8 sm:py-4">
                {children}
            </main>
        </div>
    );
}
