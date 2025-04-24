"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";

export default function ToptanSatis() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data: any) => {
        try {
            // API bağlantısı kurulduğunda burada form gönderimi yapılacak
            console.log("Form data:", data);
            setSubmitted(true);
            setError("");
        } catch (error) {
            console.error("Formda hata:", error);
            setError("Bilgileriniz gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
        }
    };

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

            <div className="flex-1 pt-24 pb-16 flex items-center justify-center">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto bg-white rounded-xl overflow-hidden shadow-xl border border-gray-200">
                        <div className="relative p-6 md:p-8">
                            {/* Arkaplan efekti */}
                            <div className="absolute top-0 right-0 bg-gradient-to-l from-teal-100 to-transparent opacity-30 h-20 w-full"></div>

                            <div className="relative mb-6 text-center">
                                <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-teal-50 border border-teal-100 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                                    Toptan Satış Platformu
                                </h1>
                                <div className="flex justify-center items-center mb-3">
                                    <div className="px-3 py-1 rounded-full bg-teal-50 border border-teal-100">
                                        <div className="flex items-center space-x-2">
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-600"></span>
                                            </span>
                                            <span className="text-sm font-medium text-teal-600">Çok Yakında</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    Toptan satış platformumuz şu anda geliştirme aşamasındadır. Lansman tarihimiz yaklaştığında bilgilendirilmek için lütfen iletişim bilgilerinizi bırakın.
                                </p>
                            </div>

                            {!submitted ? (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                                İşletme Adı <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                                placeholder="İşletmenizin adı"
                                                {...register("name", { required: "İşletme adı gereklidir" })}
                                            />
                                            {errors.name && (
                                                <span className="text-xs text-red-500 mt-1">{errors.name.message?.toString()}</span>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
                                                İletişim Kişisi <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="contactPerson"
                                                type="text"
                                                className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                                placeholder="İsim ve soyisim"
                                                {...register("contactPerson", { required: "İletişim kişisi gereklidir" })}
                                            />
                                            {errors.contactPerson && (
                                                <span className="text-xs text-red-500 mt-1">{errors.contactPerson.message?.toString()}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                E-posta <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                                placeholder="iletisim@sirketiniz.com"
                                                {...register("email", {
                                                    required: "E-posta adresi gereklidir",
                                                    pattern: {
                                                        value: /\S+@\S+\.\S+/,
                                                        message: "Geçerli bir e-posta adresi giriniz"
                                                    }
                                                })}
                                            />
                                            {errors.email && (
                                                <span className="text-xs text-red-500 mt-1">{errors.email.message?.toString()}</span>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                                Telefon <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="phone"
                                                type="tel"
                                                className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                                placeholder="05XX XXX XX XX"
                                                {...register("phone", { required: "Telefon numarası gereklidir" })}
                                            />
                                            {errors.phone && (
                                                <span className="text-xs text-red-500 mt-1">{errors.phone.message?.toString()}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                            Notlar (İsteğe bağlı)
                                        </label>
                                        <textarea
                                            id="message"
                                            rows={3}
                                            className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                            placeholder="Ürün çeşitleri, sipariş hacimleri veya diğer sorularınız..."
                                            {...register("message")}
                                        ></textarea>
                                    </div>

                                    {error && (
                                        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-500 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="privacy"
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 bg-gray-50 text-teal-600 focus:ring-1 focus:ring-teal-500"
                                                    {...register("privacy", { required: "Gizlilik politikasını kabul etmelisiniz" })}
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="privacy" className="text-gray-600">
                                                    <span>Gizlilik politikasını okudum ve kabul ediyorum</span>
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                {errors.privacy && (
                                                    <span className="block text-xs text-red-500 mt-1">{errors.privacy.message?.toString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            className="w-full px-6 py-3 mt-2 rounded-md bg-gradient-to-r from-teal-500 to-blue-500 border border-teal-400 text-white font-medium hover:from-teal-600 hover:to-blue-600 transition-colors shadow-sm flex items-center justify-center"
                                        >
                                            <span>Bilgi Almak İstiyorum</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="bg-white rounded-lg p-6 text-center border border-gray-200 shadow-sm">
                                    <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-teal-50 text-teal-600 mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                                        Teşekkürler!
                                    </h2>
                                    <p className="text-gray-600 mb-4">
                                        Bilgileriniz başarıyla kaydedildi. Toptan satış platformumuz hazır olduğunda sizinle iletişime geçeceğiz.
                                    </p>
                                    <Link
                                        href="/"
                                        className="inline-block px-6 py-2 rounded-md bg-gradient-to-r from-teal-500 to-blue-500 border border-teal-400 text-white font-medium hover:from-teal-600 hover:to-blue-600 transition-colors shadow-sm"
                                    >
                                        Ana Sayfaya Dön
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <footer className="bg-white text-gray-600 border-t border-gray-200">
                <div className="container mx-auto px-4 py-6">
                    <div className="text-center">
                        <div className="text-sm mb-2">
                            <span className="text-teal-600 font-medium">Kudat Steel Jewelry</span> - Zarif çelik takı koleksiyonları
                        </div>
                        <div className="text-xs">
                            <p>info@kudatsteel.com | +90 (555) 123 4567</p>
                            <p className="mt-2">© {new Date().getFullYear()} Tüm hakları saklıdır.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
} 