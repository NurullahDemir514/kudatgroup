"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
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

      <section className="flex-1 flex items-center justify-center pt-28 pb-16">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h1 className="mb-4 text-3xl sm:text-5xl font-bold text-gray-800 drop-shadow-sm">
              Kudat Steel Jewelry
            </h1>
            <p className="mx-auto max-w-lg text-base sm:text-lg text-gray-600">
              Güç ve zarafeti bir araya getiren eşsiz çelik takı koleksiyonumuzla tarzınızı yeniden tanımlayın.
              Dayanıklılık ve şıklığın mükemmel uyumunu keşfedin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Toptan Satış Kartı */}
            <Link
              href="/toptan-satis"
              className="relative overflow-hidden rounded-xl border border-gray-200 bg-white group hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-100 to-transparent opacity-40 h-16 w-full"></div>

              <div className="relative p-6 md:p-8 flex flex-col h-full">
                <div className="mb-4 flex items-center">
                  <div className="flex justify-center items-center w-12 h-12 rounded-full bg-teal-50 text-teal-600 border border-teal-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h2 className="ml-4 text-xl sm:text-2xl font-bold text-gray-800">Toptan Satış</h2>
                </div>

                <p className="text-gray-600 mb-6">
                  Mağazanız veya işletmeniz için özel fiyatlar ve toplu alım avantajlarıyla çelik takı koleksiyonumuza erişin.
                </p>

                <div className="mt-auto">
                  <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 flex items-center">
                    <div className="mr-4 flex-shrink-0">
                      <div className="animate-pulse flex justify-center items-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">Çok Yakında</h3>
                      <p className="text-sm text-gray-600">Toptan satış platformumuz hazırlanıyor. Lütfen takipte kalın.</p>
                    </div>
                  </div>

                  <div
                    className="mt-4 w-full px-4 py-3 rounded-lg bg-teal-600 text-white transition-all flex items-center justify-center space-x-2 hover:bg-teal-700"
                  >
                    <span>Detaylar için Tıklayın</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Perakende Satış Kartı */}
            <Link
              href="/perakende-satis"
              className="relative overflow-hidden rounded-xl border border-gray-200 bg-white group hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute top-0 right-0 bg-gradient-to-l from-teal-100 to-transparent opacity-40 h-16 w-full"></div>

              <div className="relative p-6 md:p-8 flex flex-col h-full">
                <div className="mb-4 flex items-center">
                  <div className="flex justify-center items-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h2 className="ml-4 text-xl sm:text-2xl font-bold text-gray-800">Perakende Satış</h2>
                </div>

                <p className="text-gray-600 mb-6">
                  Özenle tasarlanmış çelik takı koleksiyonumuzu keşfedin ve kişisel stilinizi tamamlayacak parçaları seçin.
                </p>

                <div className="mt-auto">
                  <div className="rounded-lg bg-teal-50 border border-teal-100 p-4 flex items-center">
                    <div className="mr-4 flex-shrink-0">
                      <div className="animate-pulse flex justify-center items-center w-12 h-12 rounded-full bg-teal-100 text-teal-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">Çok Yakında</h3>
                      <p className="text-sm text-gray-600">Perakende satış sitemiz hazırlanıyor. Lütfen takipte kalın.</p>
                    </div>
                  </div>

                  <div
                    className="mt-4 w-full px-4 py-3 rounded-lg bg-blue-600 text-white transition-all flex items-center justify-center space-x-2 hover:bg-blue-700"
                  >
                    <span>Detaylar için Tıklayın</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-sm mb-2">
              <span className="text-teal-600 font-medium">Kudat Steel Jewelry</span>
            </div>
            <div className="text-gray-600 text-sm">
              <p>info@kudatsteel.com | +90 (555) 123 4567</p>
              <p className="mt-2">© {new Date().getFullYear()} Tüm hakları saklıdır.</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
