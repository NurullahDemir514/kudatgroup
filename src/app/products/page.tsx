"use client";

import { useState } from "react";
import Link from "next/link";
import ProductShowcase from "@/components/ProductShowcase";

export default function ProductsPage() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col">
            <header className="fixed w-full z-40 bg-transparent">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between py-4 px-4 md:px-6">
                        <Link href="/" className="relative z-10">
                            <h1 className="text-2xl font-bold">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600">Kudat Steel Jewelry</span>
                            </h1>
                        </Link>

                        {/* Mobil menü butonu */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="p-2 rounded-md border border-gray-200 bg-white text-gray-700"
                                aria-label="Ana menüyü aç"
                            >
                                {!menuOpen ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Masaüstü menü */}
                        <nav className="hidden md:flex items-center space-x-6">
                            <Link href="/" className="text-gray-800 hover:text-teal-600 transition-colors font-medium">
                                Ana Sayfa
                            </Link>
                            <Link href="/products" className="text-gray-800 hover:text-teal-600 transition-colors font-medium">
                                Ürünler
                            </Link>
                            <Link href="/perakende-satis" className="text-gray-800 hover:text-teal-600 transition-colors font-medium">
                                Perakende Satış
                            </Link>
                            <Link href="/toptan-satis" className="text-gray-800 hover:text-teal-600 transition-colors font-medium">
                                Toptan Satış
                            </Link>
                            <Link href="/bulten-kayit" className="text-gray-800 hover:text-teal-600 transition-colors font-medium">
                                Bülten
                            </Link>
                        </nav>
                    </div>

                    {/* Mobil menü dropdown */}
                    <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white ${menuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <nav className="flex flex-col px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                            <Link
                                href="/"
                                className="text-gray-800 hover:text-teal-600 transition-colors py-2 px-3 rounded-md hover:bg-gray-50"
                                onClick={() => setMenuOpen(false)}
                            >
                                Ana Sayfa
                            </Link>
                            <Link
                                href="/products"
                                className="text-gray-800 hover:text-teal-600 transition-colors py-2 px-3 rounded-md hover:bg-gray-50"
                                onClick={() => setMenuOpen(false)}
                            >
                                Ürünler
                            </Link>
                            <Link
                                href="/perakende-satis"
                                className="text-gray-800 hover:text-teal-600 transition-colors py-2 px-3 rounded-md hover:bg-gray-50"
                                onClick={() => setMenuOpen(false)}
                            >
                                Perakende Satış
                            </Link>
                            <Link
                                href="/toptan-satis"
                                className="text-gray-800 hover:text-teal-600 transition-colors py-2 px-3 rounded-md hover:bg-gray-50"
                                onClick={() => setMenuOpen(false)}
                            >
                                Toptan Satış
                            </Link>
                            <Link
                                href="/bulten-kayit"
                                className="text-gray-800 hover:text-teal-600 transition-colors py-2 px-3 rounded-md hover:bg-gray-50"
                                onClick={() => setMenuOpen(false)}
                            >
                                Bülten
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            <div className="flex-1 pt-24">
                <div className="container mx-auto">
                    <ProductShowcase />
                </div>
            </div>

            <footer className="bg-white border-t border-gray-200">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="text-sm mb-2">
                            <span className="text-teal-600 font-medium">Kudat Steel Jewelry</span>
                        </div>
                        <div className="text-gray-600 text-sm">
                            <p>info@kudatsteel.com | +90 (544) 357 62 14</p>
                            <p className="mt-2">© {new Date().getFullYear()} Tüm hakları saklıdır.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}