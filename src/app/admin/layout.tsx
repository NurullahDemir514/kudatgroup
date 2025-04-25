"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { ReactNode, useState, useEffect } from "react";

// Sidebar menü öğeleri
const sidebarItems = [
    {
        name: "Ana Sayfa",
        path: "/admin",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
        exact: true
    },
    {
        name: "Ürünler",
        path: "/admin/products",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        ),
        exact: false
    },
    {
        name: "Satışlar",
        path: "/admin/sales",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        exact: false
    },
    {
        name: "Müşteriler",
        path: "/admin/customers",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
        exact: true
    },
    {
        name: "Kar Analizi",
        path: "/admin/profit-analysis",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        exact: true
    },
    {
        name: "E-Bülten",
        path: "/admin/newsletters",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        exact: true
    },
    {
        name: "Kampanyalar",
        path: "/admin/campaigns",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
        ),
        exact: true
    },
    {
        name: "WhatsApp Mesajları",
        path: "/admin/whatsapp-messages",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h8M8 11h8M8 15h5" />
            </svg>
        ),
        exact: false
    }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Ekran boyutunu dinleyen bir etki
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        // İlk yükleme kontrolü
        checkScreenSize();

        // Ekran boyutu değiştiğinde kontrol et
        window.addEventListener('resize', checkScreenSize);

        // Temizleme
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Ekran küçükse ve sayfa değişirse sidebar'ı kapat
    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    }, [pathname, isMobile]);

    // Giriş sayfası için normal sayfa gösterimi
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    // Oturum yükleniyorsa loading göster
    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900">
                <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-gray-300"></div>
            </div>
        );
    }

    // Aktif menüyü kontrol eden fonksiyon
    const isActive = (item: any) => {
        if (item.exact) {
            return pathname === item.path;
        }
        return pathname.startsWith(item.path);
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
            {/* Mobil Backdrop - Sadece sidebar açıkken görünür */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-10"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                ${isMobile ? 'fixed z-20' : 'relative'} 
                ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
                bg-black bg-opacity-40 border-r border-gray-800
                w-64 h-full transition-transform duration-300 ease-in-out
            `}>
                <div className="flex h-16 items-center justify-center border-b border-gray-800">
                    <h1 className="text-xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-400">
                        Kudat Steel Jewelry
                    </h1>
                </div>
                <nav className="px-4 py-6">
                    <div className="mb-6 px-4">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Yönetim</h2>
                    </div>
                    <ul className="space-y-2 overflow-y-auto max-h-[calc(100vh-15rem)]">
                        {sidebarItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    href={item.path}
                                    onClick={() => isMobile && setIsSidebarOpen(false)}
                                    className={`flex items-center px-4 py-3 rounded-md transition-colors ${isActive(item)
                                        ? "bg-gray-800 text-white"
                                        : "text-gray-400 hover:bg-gray-900 hover:text-white"
                                        }`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="absolute bottom-0 w-64 border-t border-gray-800 p-4 bg-black bg-opacity-40">
                    <div className="mb-4 flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-gray-600 to-gray-400 text-center text-gray-900 flex items-center justify-center font-medium">
                            {session?.user?.name?.[0] || "A"}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-200">{session?.user?.name}</p>
                            <p className="text-xs text-gray-500">{session?.user?.email || "Admin"}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/admin/login" })}
                        className="w-full flex items-center justify-center rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Çıkış Yap
                    </button>
                </div>
            </div>

            {/* Ana içerik alanı */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Üst çubuk */}
                <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-black bg-opacity-30 px-4 lg:px-6">
                    <div className="flex items-center">
                        {/* Mobil cihazlar için menü butonu */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="text-gray-400 hover:text-white mr-4 lg:hidden"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h2 className="text-lg font-medium text-gray-300 truncate">
                        {sidebarItems.find((item) => isActive(item))?.name || "Admin Paneli"}
                    </h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="text-gray-400 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                        <button className="text-gray-400 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* İçerik */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-900 bg-opacity-60">
                    {children}
                </main>
            </div>
        </div>
    );
} 