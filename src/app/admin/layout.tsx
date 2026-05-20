"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const navItems = [
    { name: "Katalog", path: "/admin/catalog" },
    { name: "Ürünler", path: "/admin/products" },
    { name: "Siparişler", path: "/admin/orders" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    if (pathname === "/admin/login") return <>{children}</>;

    return (
        <div className="min-h-screen bg-[#f7f4ef] text-[#171411]">
            <header className="sticky top-0 z-20 border-b border-black/10 bg-[#f7f4ef]/90 backdrop-blur-xl">
                <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
                    <Link href="/admin/catalog" className="flex items-center">
                        <img
                            src="/kudattr.png"
                            alt="Kudat"
                            className="h-auto w-[156px] object-contain"
                        />
                    </Link>

                    <nav className="flex items-center gap-1 rounded-full bg-white/70 p-1 shadow-sm ring-1 ring-black/5">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-black text-white"
                                            : "text-black/50 hover:text-black"
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            <main className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 sm:py-8">
                {children}
            </main>
        </div>
    );
}
