"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

// Form tipi
type FormData = {
    phoneNumber: string;
    templateId: string;
};

// Şablonlar
const templates = [
    { id: "welcome_message", name: "Hoş Geldiniz Mesajı" },
    { id: "promotion_offer", name: "Promosyon Duyurusu" },
    { id: "payment_reminder", name: "Ödeme Hatırlatıcı" },
    { id: "event_invitation", name: "Etkinlik Daveti" },
];

export default function WhatsAppTestPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch("/api/whatsapp/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                setResult(result);
            } else {
                setError(result.error || "Bir hata oluştu.");

                // Eğer eksik yapılandırma bilgileri varsa
                if (result.missingConfigs) {
                    let configError = "Eksik WhatsApp Yapılandırması: ";
                    if (result.missingConfigs.apiKey) {
                        configError += "API Key, ";
                    }
                    if (result.missingConfigs.businessPhoneNumberId) {
                        configError += "Telefon Numarası ID, ";
                    }
                    setError(configError.slice(0, -2)); // Son virgül ve boşluğu kaldır
                }
            }
        } catch (err: any) {
            setError("Bağlantı hatası: " + (err.message || "Bilinmeyen hata"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-400">
                    WhatsApp API Test
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sol kolon: Form */}
                <div className="lg:col-span-2">
                    <div className="rounded-lg border border-gray-800 bg-black bg-opacity-40 p-6 shadow-xl">
                        <h2 className="text-xl font-semibold text-silver mb-5">Test Mesajı Gönderimi</h2>

                        {error && (
                            <div className="mb-5 rounded-md bg-red-900 bg-opacity-20 p-4 text-sm text-red-200 border border-red-800">
                                {error}
                            </div>
                        )}

                        {result && (
                            <div className="mb-5 rounded-md bg-emerald-900 bg-opacity-20 p-4 text-sm text-emerald-200 border border-emerald-800">
                                <h3 className="font-medium mb-1">Mesaj Gönderildi!</h3>
                                <p>Şablon: {result.details.template}</p>
                                <p>Telefon: {result.details.phone}</p>
                                <button
                                    onClick={() => setResult(null)}
                                    className="mt-3 px-3 py-1 rounded-md bg-black bg-opacity-30 border border-emerald-600 text-emerald-400 hover:bg-emerald-900 hover:bg-opacity-30 text-xs"
                                >
                                    Yeni Test
                                </button>
                            </div>
                        )}

                        {!result && (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                {/* Telefon numarası */}
                                <div>
                                    <label className="block text-silver font-medium mb-2">
                                        Test Edilecek Telefon Numarası <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="5XXXXXXXXX"
                                        {...register("phoneNumber", {
                                            required: "Telefon numarası zorunludur",
                                            pattern: {
                                                value: /^[0-9]{10,11}$/,
                                                message: "Geçerli bir telefon numarası giriniz (10-11 haneli)",
                                            },
                                        })}
                                        className="w-full px-4 py-3 rounded-md border border-gray-700 bg-black bg-opacity-60 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver"
                                    />
                                    {errors.phoneNumber && (
                                        <p className="mt-1 text-sm text-red-400">{errors.phoneNumber.message}</p>
                                    )}
                                </div>

                                {/* Şablon seçimi */}
                                <div>
                                    <label className="block text-silver font-medium mb-2">
                                        Test Edilecek Şablon <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        {...register("templateId", { required: "Şablon seçimi zorunludur" })}
                                        className="w-full px-4 py-3 rounded-md border border-gray-700 bg-black bg-opacity-60 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver"
                                    >
                                        <option value="">Şablon Seçiniz</option>
                                        {templates.map((template) => (
                                            <option key={template.id} value={template.id}>
                                                {template.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.templateId && (
                                        <p className="mt-1 text-sm text-red-400">{errors.templateId.message}</p>
                                    )}
                                </div>

                                {/* Gönder butonu */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full px-6 py-3 rounded-md bg-gradient-to-r from-gray-700 to-gray-900 text-silver font-medium border border-gray-600 shadow-lg hover:from-gray-600 hover:to-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-silver focus:ring-opacity-50 disabled:opacity-70"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center">
                                                <svg
                                                    className="animate-spin h-5 w-5 mr-2 text-silver"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Gönderiliyor...
                                            </div>
                                        ) : (
                                            "Test Mesajı Gönder"
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Sağ kolon: Bilgi kartı */}
                <div className="lg:col-span-1">
                    <div className="space-y-5">
                        <div className="rounded-lg border border-gray-800 bg-black bg-opacity-40 p-5 shadow-xl">
                            <h3 className="text-lg font-semibold text-silver mb-3">WhatsApp API Hakkında</h3>
                            <p className="text-sm text-gray-300 mb-3">
                                Bu sayfa WhatsApp API entegrasyonunuzu test etmek için tasarlanmıştır. Test mesajlarını sadece doğrulanmış telefon numaralarına gönderebilirsiniz.
                            </p>
                            <ul className="text-sm text-gray-300 list-disc pl-5 space-y-1">
                                <li>Geçerli API anahtarına sahip olduğunuzdan emin olun</li>
                                <li>Telefon numaranızın Meta Business hesabında doğrulanmış olduğunu kontrol edin</li>
                                <li>Kullandığınız şablonların Meta tarafından onaylanmış olduğundan emin olun</li>
                            </ul>
                        </div>

                        <div className="rounded-lg border border-gray-800 bg-black bg-opacity-40 p-5 shadow-xl">
                            <h3 className="text-lg font-semibold text-silver mb-3">Yapılandırma Adımları</h3>
                            <ol className="text-sm text-gray-300 list-decimal pl-5 space-y-2">
                                <li>Meta Developer hesabı oluşturun</li>
                                <li>WhatsApp Business API erişimi alın</li>
                                <li>WhatsApp şablonlarını oluşturun ve onaylatın</li>
                                <li>.env.local dosyasında API anahtarınızı ve telefon numarası ID'nizi tanımlayın</li>
                            </ol>
                            <div className="mt-3 p-2 bg-zinc-900 rounded text-xs text-amber-300">
                                Not: Test aşamasında sadece doğrulanmış numaralara mesaj gönderebilirsiniz.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 