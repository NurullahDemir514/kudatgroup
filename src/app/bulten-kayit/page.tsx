"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Image from "next/image";

type FormData = {
    name: string;
    phone: string;
    email?: string;
    companyName?: string;
    addressCity: string;       // İl (zorunlu)
    addressDistrict: string;   // İlçe (zorunlu)
    addressStreet: string;     // Sokak/Cadde (zorunlu)
    addressBuildingNo: string; // Bina no (zorunlu)
    taxNumber?: string;
    whatsappEnabled: boolean;
};

export default function BultenKayitPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        console.log("Form verileri:", data);
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
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-100 to-gray-200">
            <main className="flex-1 flex items-center justify-center px-3 sm:px-4 py-6">
                <div className="container mx-auto w-full max-w-3xl">
                    <div className="text-center mb-4 sm:mb-6">
                        <div className="flex flex-col items-center">
                            <h1 className="text-2xl sm:text-3xl md:text-3xl font-bold mb-3">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-700 via-gray-400 to-gray-700">Kudat Steel Jewelry</span>
                            </h1>
                        </div>
                        <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                            En güncel ürünlerimizden, tasarımlarımızdan ve kampanyalarımızdan haberdar olmak için bültenimize kayıt olun.
                        </p>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-200 rounded-xl blur-xl opacity-75"></div>
                        <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md">
                            {submitSuccess ? (
                                <div className="p-4 sm:p-6 md:p-8 text-center">
                                    <div className="flex justify-center mb-4">
                                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-teal-50 flex items-center justify-center border border-teal-200">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-7 w-7 sm:h-8 sm:w-8 text-teal-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-bold text-teal-600 mb-3">
                                        Kaydınız Başarıyla Alındı!
                                    </h2>
                                    <p className="text-sm sm:text-base text-gray-600 mb-6">
                                        Bülten aboneliğiniz başarıyla oluşturuldu. En güncel tasarımlar ve kampanyalar için teşekkür ederiz!
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                        <button
                                            onClick={() => setSubmitSuccess(false)}
                                            className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-50 transition-all btn-hover-effect text-sm sm:text-base"
                                        >
                                            Yeni Kayıt Oluştur
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 sm:p-6 md:p-8">

                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                                        {submitError && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 text-red-600 text-xs sm:text-sm">
                                                {submitError}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                            <div>
                                                <label
                                                    htmlFor="name"
                                                    className="block text-gray-700 font-medium mb-1 text-sm sm:text-base"
                                                >
                                                    Ad Soyad <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    id="name"
                                                    type="text"
                                                    placeholder="Ad Soyad"
                                                    {...register("name", { required: "Ad Soyad alanı zorunludur" })}
                                                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors text-sm sm:text-base"
                                                />
                                                {errors.name && (
                                                    <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.name.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="phone"
                                                    className="block text-gray-700 font-medium mb-1 text-sm sm:text-base"
                                                >
                                                    Telefon Numarası <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="Telefon numaranız (5XXXXXXXXX)"
                                                    {...register("phone", {
                                                        required: "Telefon numarası alanı zorunludur",
                                                        pattern: {
                                                            value: /^[0-9]{10,11}$/,
                                                            message: "Geçerli bir telefon numarası giriniz (10-11 haneli)",
                                                        },
                                                    })}
                                                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors text-sm sm:text-base"
                                                />
                                                {errors.phone && (
                                                    <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.phone.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="block text-gray-700 font-medium mb-1 text-sm sm:text-base"
                                            >
                                                E-posta Adresi <span className="text-gray-500">(İsteğe bağlı)</span>
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
                                                className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors text-sm sm:text-base"
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.email.message}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                            <div>
                                                <label
                                                    htmlFor="companyName"
                                                    className="block text-gray-700 font-medium mb-1 text-sm sm:text-base"
                                                >
                                                    Şirket Adı <span className="text-gray-500">(İsteğe bağlı)</span>
                                                </label>
                                                <input
                                                    id="companyName"
                                                    type="text"
                                                    placeholder="Şirket adı"
                                                    {...register("companyName")}
                                                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors text-sm sm:text-base"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="taxNumber"
                                                    className="block text-gray-700 font-medium mb-1 text-sm sm:text-base"
                                                >
                                                    Vergi Numarası <span className="text-gray-500">(İsteğe bağlı)</span>
                                                </label>
                                                <input
                                                    id="taxNumber"
                                                    type="text"
                                                    placeholder="Vergi numarası"
                                                    {...register("taxNumber")}
                                                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors text-sm sm:text-base"
                                                />
                                            </div>
                                        </div>



                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                                <div>
                                                    <label
                                                        htmlFor="addressCity"
                                                        className="block text-gray-700 font-medium mb-1 text-sm sm:text-base"
                                                    >
                                                        İl <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        id="addressCity"
                                                        type="text"
                                                        placeholder="İl"
                                                        {...register("addressCity", { required: "İl alanı zorunludur" })}
                                                        className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors text-sm sm:text-base"
                                                    />
                                                    {errors.addressCity && (
                                                        <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.addressCity.message}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="addressDistrict"
                                                        className="block text-gray-700 font-medium mb-1 text-sm sm:text-base"
                                                    >
                                                        İlçe <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        id="addressDistrict"
                                                        type="text"
                                                        placeholder="İlçe"
                                                        {...register("addressDistrict", { required: "İlçe alanı zorunludur" })}
                                                        className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors text-sm sm:text-base"
                                                    />
                                                    {errors.addressDistrict && (
                                                        <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.addressDistrict.message}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                                <div>
                                                    <label
                                                        htmlFor="addressStreet"
                                                        className="block text-gray-700 font-medium mb-1 text-sm sm:text-base"
                                                    >
                                                        Sokak/Cadde <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        id="addressStreet"
                                                        type="text"
                                                        placeholder="Sokak veya cadde bilgisi"
                                                        {...register("addressStreet", { required: "Sokak/Cadde alanı zorunludur" })}
                                                        className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors text-sm sm:text-base"
                                                    />
                                                    {errors.addressStreet && (
                                                        <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.addressStreet.message}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="addressBuildingNo"
                                                        className="block text-gray-700 font-medium mb-1 text-sm sm:text-base"
                                                    >
                                                        Bina No <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        id="addressBuildingNo"
                                                        type="text"
                                                        placeholder="Bina numarası"
                                                        {...register("addressBuildingNo", { required: "Bina numarası alanı zorunludur" })}
                                                        className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors text-sm sm:text-base"
                                                    />
                                                    {errors.addressBuildingNo && (
                                                        <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.addressBuildingNo.message}</p>
                                                    )}
                                                </div>
                                            </div>

                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="whatsappEnabled"
                                                    type="checkbox"
                                                    {...register("whatsappEnabled")}
                                                    className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 bg-white text-teal-600 focus:ring-teal-500 focus:ring-1"
                                                />
                                            </div>
                                            <label
                                                htmlFor="whatsappEnabled"
                                                className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-600"
                                            >
                                                WhatsApp üzerinden bilgilendirme mesajları almak istiyorum
                                            </label>
                                        </div>

                                        <div className="pt-2 sm:pt-3">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className={`w-full rounded-lg px-4 sm:px-5 py-2.5 sm:py-3 font-medium text-center transition-all text-sm sm:text-base ${isSubmitting
                                                    ? "bg-gray-200 text-gray-500 cursor-wait"
                                                    : "bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 text-white hover:shadow-md btn-hover-effect"
                                                    } border border-transparent`}
                                            >
                                                {isSubmitting ? (
                                                    <div className="flex items-center justify-center">
                                                        <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        İşleniyor...
                                                    </div>
                                                ) : (
                                                    <span>Bültene Abone Ol</span>
                                                )}
                                            </button>
                                        </div>

                                        <p className="text-2xs sm:text-xs text-gray-500 text-center pt-2 sm:pt-3">
                                            Kayıt olarak, gizlilik politikamızı kabul etmiş olursunuz. İletişim bilgileriniz sadece kampanya ve duyurular için kullanılacaktır.
                                        </p>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 