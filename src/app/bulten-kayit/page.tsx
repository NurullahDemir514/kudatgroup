"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Image from "next/image";
import { IProduct } from "@/models/Product";

type FormData = {
    name: string;
    phone: string;
    email?: string;
    companyName?: string;
    addressCity: string;
    addressDistrict: string;
    addressStreet: string;
    addressBuildingNo: string;
    taxNumber?: string;
    whatsappEnabled: boolean;
};

export default function BultenKayitPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [products, setProducts] = useState<IProduct[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>();

    // Ürünleri getir (arka plan için)
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products');
                const result = await response.json();
                if (result.success && Array.isArray(result.data)) {
                    const productsWithImages = result.data
                        .filter((product: IProduct) => product.image)
                        .slice(0, 10);
                    setProducts(productsWithImages);
                }
            } catch (err) {
                console.error('Ürünler yüklenirken hata:', err);
            }
        };

        fetchProducts();
    }, []);

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await fetch("/api/newsletters", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                setSubmitSuccess(true);
                reset();
            } else {
                setSubmitError(result.error || "Bir hata oluştu. Lütfen tekrar deneyin.");
            }
        } catch (error) {
            setSubmitError("Bağlantı hatası. Lütfen tekrar deneyin.");
            console.error("Bülten kayıt hatası:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col relative overflow-hidden">
            {/* Animated Background Product Images */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                {products.map((product, index) => {
                    if (!product.image) return null;
                    
                    const animations = [
                        { duration: '20s', delay: '0s', direction: 'normal' },
                        { duration: '25s', delay: '2s', direction: 'reverse' },
                        { duration: '30s', delay: '4s', direction: 'normal' },
                        { duration: '22s', delay: '1s', direction: 'reverse' },
                        { duration: '28s', delay: '3s', direction: 'normal' },
                        { duration: '24s', delay: '5s', direction: 'reverse' },
                        { duration: '26s', delay: '2.5s', direction: 'normal' },
                        { duration: '23s', delay: '1.5s', direction: 'reverse' },
                        { duration: '27s', delay: '3.5s', direction: 'normal' },
                        { duration: '29s', delay: '4.5s', direction: 'reverse' },
                    ];
                    
                    const anim = animations[index % animations.length];
                    const positions = [
                        { top: '10%', left: '5%' },
                        { top: '20%', right: '10%' },
                        { bottom: '15%', left: '8%' },
                        { top: '50%', right: '5%' },
                        { bottom: '30%', right: '15%' },
                        { top: '70%', left: '12%' },
                        { bottom: '50%', left: '3%' },
                        { top: '35%', right: '8%' },
                        { bottom: '70%', right: '20%' },
                        { top: '60%', left: '20%' },
                    ];
                    
                    const pos = positions[index % positions.length];
                    
                    return (
                        <div
                            key={product.id || product._id || index}
                            className="absolute opacity-[0.03]"
                            style={{
                                ...pos,
                                width: '200px',
                                height: '200px',
                                animation: `float${index} ${anim.duration} ${anim.delay} infinite ${anim.direction} ease-in-out`,
                            }}
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    );
                })}
            </div>

            {/* CSS Animations */}
            <style jsx>{`
                ${products.map((_, index) => {
                    const animations = [
                        { startY: '0%', endY: '-100px', startX: '0%', endX: '50px' },
                        { startY: '0%', endY: '100px', startX: '0%', endX: '-30px' },
                        { startY: '0%', endY: '-80px', startX: '0%', endX: '-40px' },
                        { startY: '0%', endY: '120px', startX: '0%', endX: '60px' },
                        { startY: '0%', endY: '-90px', startX: '0%', endX: '35px' },
                        { startY: '0%', endY: '100px', startX: '0%', endX: '-50px' },
                        { startY: '0%', endY: '-110px', startX: '0%', endX: '45px' },
                        { startY: '0%', endY: '95px', startX: '0%', endX: '-25px' },
                        { startY: '0%', endY: '-105px', startX: '0%', endX: '55px' },
                        { startY: '0%', endY: '85px', startX: '0%', endX: '-35px' },
                    ];
                    const anim = animations[index % animations.length];
                    return `
                        @keyframes float${index} {
                            0%, 100% {
                                transform: translate(${anim.startX}, ${anim.startY}) rotate(0deg);
                            }
                            25% {
                                transform: translate(${anim.endX}, ${anim.startY}) rotate(5deg);
                            }
                            50% {
                                transform: translate(${anim.endX}, ${anim.endY}) rotate(0deg);
                            }
                            75% {
                                transform: translate(${anim.startX}, ${anim.endY}) rotate(-5deg);
                            }
                        }
                    `;
                }).join('')}
            `}</style>

            {/* Header */}
            <header className="fixed w-full z-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center md:justify-between h-24 px-6">
                        <Link href="/" className="flex items-center">
                            <Image 
                                src="/icon.png" 
                                alt="Kudat Group" 
                                width={500} 
                                height={166}
                                className="h-32 w-auto object-contain"
                                priority
                            />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center pt-32 pb-16 px-6">
                <div className="max-w-2xl w-full">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-6xl font-light text-gray-900 tracking-tight mb-6">
                            Bülten Kaydı
                        </h1>
                        <p className="text-lg text-gray-500 font-light leading-relaxed max-w-xl mx-auto">
                            En güncel ürünlerimizden, tasarımlarımızdan ve kampanyalarımızdan haberdar olmak için bültenimize kayıt olun.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
                        {submitSuccess ? (
                            <div className="text-center py-8">
                                <div className="flex justify-center mb-6">
                                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                                        <svg
                                            className="w-8 h-8 text-gray-900"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-light text-gray-900 mb-4">
                                    Kaydınız Başarıyla Alındı
                                </h2>
                                <p className="text-gray-500 mb-8 font-light">
                                    Bülten aboneliğiniz başarıyla oluşturuldu. En güncel tasarımlar ve kampanyalar için teşekkür ederiz.
                                </p>
                                <button
                                    onClick={() => setSubmitSuccess(false)}
                                    className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-light"
                                >
                                    Yeni Kayıt Oluştur
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {submitError && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
                                        {submitError}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-gray-900 font-light mb-2 text-sm">
                                            Ad Soyad <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            placeholder="Ad Soyad"
                                            {...register("name", { required: "Ad Soyad alanı zorunludur" })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors text-sm font-light"
                                        />
                                        {errors.name && (
                                            <p className="mt-2 text-xs text-red-500">{errors.name.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-gray-900 font-light mb-2 text-sm">
                                            Telefon Numarası <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            placeholder="5XXXXXXXXX"
                                            {...register("phone", {
                                                required: "Telefon numarası alanı zorunludur",
                                                pattern: {
                                                    value: /^[0-9]{10,11}$/,
                                                    message: "Geçerli bir telefon numarası giriniz",
                                                },
                                            })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors text-sm font-light"
                                        />
                                        {errors.phone && (
                                            <p className="mt-2 text-xs text-red-500">{errors.phone.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-gray-900 font-light mb-2 text-sm">
                                        E-posta Adresi <span className="text-gray-400 text-xs">(İsteğe bağlı)</span>
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="E-posta adresiniz"
                                        {...register("email", {
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: "Geçerli bir e-posta adresi giriniz",
                                            },
                                        })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors text-sm font-light"
                                    />
                                    {errors.email && (
                                        <p className="mt-2 text-xs text-red-500">{errors.email.message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="companyName" className="block text-gray-900 font-light mb-2 text-sm">
                                            Şirket Adı <span className="text-gray-400 text-xs">(İsteğe bağlı)</span>
                                        </label>
                                        <input
                                            id="companyName"
                                            type="text"
                                            placeholder="Şirket adı"
                                            {...register("companyName")}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors text-sm font-light"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="taxNumber" className="block text-gray-900 font-light mb-2 text-sm">
                                            Vergi Numarası <span className="text-gray-400 text-xs">(İsteğe bağlı)</span>
                                        </label>
                                        <input
                                            id="taxNumber"
                                            type="text"
                                            placeholder="Vergi numarası"
                                            {...register("taxNumber")}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors text-sm font-light"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="addressCity" className="block text-gray-900 font-light mb-2 text-sm">
                                            İl <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="addressCity"
                                            type="text"
                                            placeholder="İl"
                                            {...register("addressCity", { required: "İl alanı zorunludur" })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors text-sm font-light"
                                        />
                                        {errors.addressCity && (
                                            <p className="mt-2 text-xs text-red-500">{errors.addressCity.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="addressDistrict" className="block text-gray-900 font-light mb-2 text-sm">
                                            İlçe <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="addressDistrict"
                                            type="text"
                                            placeholder="İlçe"
                                            {...register("addressDistrict", { required: "İlçe alanı zorunludur" })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors text-sm font-light"
                                        />
                                        {errors.addressDistrict && (
                                            <p className="mt-2 text-xs text-red-500">{errors.addressDistrict.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="addressStreet" className="block text-gray-900 font-light mb-2 text-sm">
                                            Sokak/Cadde <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="addressStreet"
                                            type="text"
                                            placeholder="Sokak veya cadde bilgisi"
                                            {...register("addressStreet", { required: "Sokak/Cadde alanı zorunludur" })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors text-sm font-light"
                                        />
                                        {errors.addressStreet && (
                                            <p className="mt-2 text-xs text-red-500">{errors.addressStreet.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="addressBuildingNo" className="block text-gray-900 font-light mb-2 text-sm">
                                            Bina No <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="addressBuildingNo"
                                            type="text"
                                            placeholder="Bina numarası"
                                            {...register("addressBuildingNo", { required: "Bina numarası alanı zorunludur" })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors text-sm font-light"
                                        />
                                        {errors.addressBuildingNo && (
                                            <p className="mt-2 text-xs text-red-500">{errors.addressBuildingNo.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="whatsappEnabled"
                                            type="checkbox"
                                            {...register("whatsappEnabled")}
                                            className="w-4 h-4 rounded border-gray-300 bg-white text-gray-900 focus:ring-gray-400"
                                        />
                                    </div>
                                    <label htmlFor="whatsappEnabled" className="ml-3 text-sm text-gray-600 font-light">
                                        WhatsApp üzerinden bilgilendirme mesajları almak istiyorum
                                    </label>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full rounded-full px-6 py-4 font-light text-sm transition-all ${
                                            isSubmitting
                                                ? "bg-gray-200 text-gray-500 cursor-wait"
                                                : "bg-gray-900 text-white hover:bg-gray-800"
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                İşleniyor...
                                            </div>
                                        ) : (
                                            "Bültene Abone Ol"
                                        )}
                                    </button>
                                </div>

                                <p className="text-xs text-gray-400 text-center pt-4 font-light">
                                    Kayıt olarak, gizlilik politikamızı kabul etmiş olursunuz. İletişim bilgileriniz sadece kampanya ve duyurular için kullanılacaktır.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
