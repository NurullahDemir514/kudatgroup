"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";

export default function ToptanSatis() {
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data: any) => {
        try {
            setError("");
            const response = await fetch('/api/toptan-satis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                setSubmitted(true);
            } else {
                setError(result.error || 'Bilgileriniz gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } catch (error) {
            console.error("Formda hata:", error);
            setError("Bilgileriniz gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
        }
    };

    return (
        <>
            {/* Override body background for this page */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    body {
                        background-color: #ffffff !important;
                    }
                    html {
                        background-color: #ffffff !important;
                    }
                `
            }} />
            <main 
                className="min-h-screen flex flex-col relative" 
                style={{ 
                    backgroundColor: '#ffffff',
                    minHeight: '100vh',
                    position: 'relative',
                }}
            >
                {/* Animated SVG Background Pattern */}
                <div 
                    className="fixed inset-0 overflow-hidden pointer-events-none"
                    style={{ 
                        backgroundColor: '#ffffff',
                        zIndex: 0,
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                >
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0" style={{
                        background: 'linear-gradient(to bottom right, #fafafa 0%, #ffffff 50%, #fafafa 100%)',
                        zIndex: 1,
                    }} />
                    
                    {/* Minimal Jewelry-Inspired SVG Pattern */}
                    <svg 
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 1920 1080"
                        preserveAspectRatio="none"
                        style={{ 
                            opacity: 0.4,
                            zIndex: 2,
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <pattern id="dotPattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                                <circle cx="40" cy="40" r="1.5" fill="#d4d4d4" opacity="0.5" />
                            </pattern>
                            <pattern id="linePattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                                <line x1="0" y1="0" x2="200" y2="200" stroke="#d4d4d4" strokeWidth="0.8" opacity="0.4" />
                                <line x1="200" y1="0" x2="0" y2="200" stroke="#d4d4d4" strokeWidth="0.8" opacity="0.4" />
                            </pattern>
                        </defs>
                        
                        <rect width="100%" height="100%" fill="url(#dotPattern)" />
                        <rect width="100%" height="100%" fill="url(#linePattern)" />
                    </svg>
                </div>

                {/* iOS-style Header */}
                <header className="fixed w-full z-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-center md:justify-between h-24 px-6">
                            <Link href="/" className="flex items-center">
                                <Image 
                                    src="/icon.png" 
                                    alt="Kudat Group" 
                                    width={500} 
                                    height={166}
                                    className="h-40 md:h-44 w-auto object-contain"
                                    priority
                                />
                            </Link>

                            {/* Desktop Menu */}
                            <nav className="flex items-center absolute right-6">
                                <Link 
                                    href="/bulten-kayit" 
                                    className="px-6 py-2.5 bg-gray-900 text-white text-sm font-light rounded-full hover:bg-gray-800 transition-colors"
                                >
                                    Bülten
                                </Link>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 pt-32 pb-20 relative z-10">
                    <div className="max-w-2xl mx-auto px-6">
                        <div className="bg-white/90 backdrop-blur-md rounded-[2rem] p-8 md:p-10 shadow-xl border border-white/50">
                            <div className="text-center mb-8">
                                <div className="inline-flex justify-center items-center w-16 h-16 rounded-[1.2rem] bg-gradient-to-br from-gray-900 to-gray-700 mb-6 shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight" style={{ fontFamily: 'var(--font-playfair-display), serif' }}>
                                    Toptan Satış
                                </h1>
                                <p className="text-gray-600 max-w-md mx-auto leading-relaxed font-light">
                                    Toptan satış için özel fiyatlar ve avantajlı koşullar. İşletmeniz için en uygun çözümü sunuyoruz.
                                </p>
                            </div>

                            {/* Toptan Satış Platform Link Section */}
                            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex-1 text-center sm:text-left">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Toptan Satış Mağazamız
                                        </h3>
                                        <p className="text-sm text-gray-600 font-light">
                                            Toptan satış platformumuza erişmek ve ürünlerimizi incelemek için tıklayın.
                                        </p>
                                    </div>
                                    <a
                                        href="https://www.kudatsteeljewerly.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center whitespace-nowrap"
                                    >
                                        <span>Ziyaret Et</span>
                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {!submitted ? (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                                İşletme Adı <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                                placeholder="İşletmenizin adı"
                                                {...register("name", { required: "İşletme adı gereklidir" })}
                                            />
                                            {errors.name && (
                                                <span className="text-xs text-red-500 mt-1 block">{errors.name.message?.toString()}</span>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">
                                                İletişim Kişisi <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="contactPerson"
                                                type="text"
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                                placeholder="İsim ve soyisim"
                                                {...register("contactPerson", { required: "İletişim kişisi gereklidir" })}
                                            />
                                            {errors.contactPerson && (
                                                <span className="text-xs text-red-500 mt-1 block">{errors.contactPerson.message?.toString()}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                                E-posta <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
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
                                                <span className="text-xs text-red-500 mt-1 block">{errors.email.message?.toString()}</span>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                                Telefon <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="phone"
                                                type="tel"
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                                placeholder="05XX XXX XX XX"
                                                {...register("phone", { required: "Telefon numarası gereklidir" })}
                                            />
                                            {errors.phone && (
                                                <span className="text-xs text-red-500 mt-1 block">{errors.phone.message?.toString()}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                            Mesajınız (İsteğe bağlı)
                                        </label>
                                        <textarea
                                            id="message"
                                            rows={4}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
                                            placeholder="Ürün çeşitleri, sipariş hacimleri, özel istekleriniz veya sorularınız..."
                                            {...register("message")}
                                        ></textarea>
                                    </div>

                                    {error && (
                                        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="privacy"
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900"
                                                {...register("privacy", { required: "Gizlilik politikasını kabul etmelisiniz" })}
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="privacy" className="text-gray-600 font-light">
                                                <span>Gizlilik politikasını okudum ve kabul ediyorum</span>
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            {errors.privacy && (
                                                <span className="block text-xs text-red-500 mt-1">{errors.privacy.message?.toString()}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            className="w-full px-6 py-3 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center"
                                        >
                                            <span>İletişime Geç</span>
                                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="text-center">
                                    <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-100 text-gray-900 mb-6">
                                        <svg className="w-8 h-8" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                                        Teşekkürler!
                                    </h2>
                                    <p className="text-gray-600 mb-6 leading-relaxed font-light">
                                        Bilgileriniz başarıyla kaydedildi. En kısa sürede sizinle iletişime geçeceğiz.
                                    </p>
                                    <Link
                                        href="/"
                                        className="inline-block px-6 py-3 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
                                    >
                                        Ana Sayfaya Dön
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="py-20 relative z-10">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                            {/* Brand Section */}
                            <div className="md:col-span-5">
                                <h3 className="text-gray-900 text-2xl font-light mb-6 tracking-tight">Kudat Steel Jewelry</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
                                    Zarif çelik takı koleksiyonumuzla tarzınızı yansıtın.
                                </p>
                                <div className="flex flex-col gap-4">
                                    <a 
                                        href="mailto:kurumsal@kudatgroup.com" 
                                        className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-light"
                                    >
                                        kurumsal@kudatgroup.com
                                    </a>
                                    <a 
                                        href="tel:+905443576214" 
                                        className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-light"
                                    >
                                        +90 (544) 357 62 14
                                    </a>
                                </div>
                            </div>

                            {/* Navigation Links */}
                            <div className="md:col-span-3">
                                <nav className="flex flex-col gap-4">
                                    <Link href="/perakende-satis" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-light">
                                        Perakende Satış
                                    </Link>
                                    <Link href="/toptan-satis" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-light">
                                        Toptan Satış
                                    </Link>
                                    <Link href="/bulten-kayit" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-light">
                                        Bülten Kaydı
                                    </Link>
                                </nav>
                            </div>

                            {/* Legal Links */}
                            <div className="md:col-span-4">
                                <nav className="flex flex-col gap-4">
                                    <Link href="/privacy-policy" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-light">
                                        Gizlilik Politikası
                                    </Link>
                                    <Link href="/terms-of-service" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-light">
                                        Kullanım Koşulları
                                    </Link>
                                    <Link href="/data-deletion" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-light">
                                        Veri Silme Talebi
                                    </Link>
                                </nav>
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="pt-8">
                            <p className="text-gray-400 text-xs font-light">
                                © {new Date().getFullYear()} Kudat Group
                            </p>
                        </div>
                    </div>
                </footer>
            </main>
        </>
    );
}
