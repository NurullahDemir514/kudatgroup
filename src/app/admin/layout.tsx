"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";

const navItems = [
    { name: "Panel", path: "/admin", exact: true },
    { name: "Katalog", path: "/admin/catalog" },
    { name: "Ürünler", path: "/admin/products" },
    { name: "Ana Sayfa", path: "/admin/home" },
    { name: "Siparişler", path: "/admin/orders" },
    { name: "Ayarlar", path: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (pathname === "/admin/login") return <>{children}</>;

    const isActivePath = (item: (typeof navItems)[number]) =>
        item.exact ? pathname === item.path : pathname.startsWith(item.path);

    const activeItem =
        navItems.find((item) => isActivePath(item)) ?? navItems[0];
    const isCatalogAdmin = pathname.startsWith("/admin/catalog");

    const logout = async () => {
        await fetch("/api/admin/access/logout", { method: "POST" });
        window.location.href = "/admin/login";
    };

    return (
        <div className="min-h-screen bg-[#f7f4ef] text-[#171411]">
            <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-[#f7f4ef]/92 backdrop-blur-xl">
                <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
                    <div className="flex min-w-0 items-center justify-between gap-3">
                        <Link href="/admin/catalog" className="flex min-w-0 items-center gap-3">
                            <img
                                src="/kudattr.png"
                                alt="Kudat"
                                className="hidden h-auto w-[132px] shrink-0 object-contain sm:block"
                            />
                            <span className="flex min-w-0 flex-col sm:hidden">
                                <span className="text-[22px] font-semibold leading-none tracking-[0.08em] text-black">
                                    KUDAT
                                </span>
                                <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-black/36">
                                    Yönetim
                                </span>
                            </span>
                            <span className="hidden rounded-full border border-black/10 bg-white/55 px-2.5 py-1 text-[11px] font-semibold text-black/50 sm:inline-flex">
                                Yönetim
                            </span>
                        </Link>
                        <span className="h-8 w-px bg-black/10 sm:hidden" aria-hidden="true" />
                        <span className="truncate text-[15px] font-semibold tracking-[-0.02em] text-black/58 sm:hidden">
                            {activeItem.name}
                        </span>
                    </div>

                    <nav className="hidden min-w-0 items-center gap-1 rounded-full bg-white/70 p-1 shadow-sm ring-1 ring-black/5 sm:flex">
                        {navItems.map((item) => {
                            const isActive = isActivePath(item);

                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold transition sm:px-4 sm:text-sm ${
                                        isActive
                                            ? "bg-black text-white shadow-sm"
                                            : "bg-white/55 text-black/50 ring-1 ring-black/[0.04] hover:text-black sm:bg-transparent sm:ring-0"
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                        <button
                            type="button"
                            onClick={logout}
                            className="hidden shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-black/40 transition hover:text-black sm:inline-flex"
                        >
                            <FiLogOut className="h-4 w-4" aria-hidden="true" />
                            Çıkış
                        </button>
                    </nav>

                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="Yönetim menüsünü aç"
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/72 text-black/62 shadow-sm ring-1 ring-black/[0.06] transition active:scale-[0.98] sm:hidden"
                    >
                        <FiMenu className="h-[19px] w-[19px]" aria-hidden="true" />
                    </button>
                </div>
            </header>

            {isMenuOpen ? (
                <div className="fixed inset-0 z-30 sm:hidden">
                    <button
                        type="button"
                        aria-label="Yönetim menüsünü kapat"
                        className="absolute inset-0 bg-black/18 backdrop-blur-[2px]"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-[#fbfaf7] px-4 pb-5 pt-3 shadow-2xl ring-1 ring-black/[0.08]">
                        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/12" />
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/34">
                                    Kudat
                                </p>
                                <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]">
                                    Yönetim menüsü
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMenuOpen(false)}
                                aria-label="Menüyü kapat"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.04] text-black/58"
                            >
                                <FiX className="h-[19px] w-[19px]" aria-hidden="true" />
                            </button>
                        </div>

                        <nav className="space-y-1.5">
                            {navItems.map((item) => {
                                const isActive = isActivePath(item);

                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex h-[52px] items-center justify-between rounded-2xl px-4 text-[16px] font-semibold tracking-[-0.02em] transition ${
                                            isActive
                                                ? "bg-black text-white"
                                                : "bg-black/[0.035] text-black/68"
                                        }`}
                                    >
                                        {item.name}
                                        {isActive ? (
                                            <span className="text-[12px] font-semibold text-white/60">
                                                Aktif
                                            </span>
                                        ) : null}
                                    </Link>
                                );
                            })}
                        </nav>

                        <button
                            type="button"
                            onClick={logout}
                            className="mt-4 flex h-[52px] w-full items-center justify-between rounded-2xl bg-black/[0.035] px-4 text-[15px] font-semibold text-black/48"
                        >
                            Çıkış yap
                            <FiLogOut className="h-[18px] w-[18px]" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            ) : null}

            <main
                className={
                    isCatalogAdmin
                        ? "w-full"
                        : "mx-auto w-full max-w-7xl px-4 py-3 sm:px-8 sm:py-4"
                }
            >
                {children}
            </main>
        </div>
    );
}
