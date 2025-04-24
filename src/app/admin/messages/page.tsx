"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

// Şablon tipi
type Template = {
    id: string;
    name: string;
    description: string;
    example: Record<string, string>;
};

// Form tipi
type FormData = {
    templateId: string;
    filters: {
        tags: string[];
        companyName: string;
    };
    params: Record<string, string>;
    testMode: boolean;
    testPhones: string[];
};

export default function MessagesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [sendResult, setSendResult] = useState<any>(null);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [subscriberCount, setSubscriberCount] = useState<number>(0);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        reset
    } = useForm<FormData>({
        defaultValues: {
            templateId: "",
            filters: {
                tags: [],
                companyName: ""
            },
            params: {},
            testMode: true,
            testPhones: []
        }
    });

    // İzlenen değerler
    const watchTemplateId = watch("templateId");
    const watchTestMode = watch("testMode");
    const watchFilters = watch("filters");

    // Sayfa yüklendiğinde verileri getir
    useEffect(() => {
        Promise.all([
            fetchTemplates(),
            fetchTags()
        ]);
    }, []);

    // Şablon değiştiğinde seçilen şablonu güncelle
    useEffect(() => {
        if (watchTemplateId && templates.length > 0) {
            const template = templates.find(t => t.id === watchTemplateId) || null;
            setSelectedTemplate(template);

            // Şablon değiştiğinde parametre alanlarını sıfırla
            if (template) {
                const newParams: Record<string, string> = {};
                Object.keys(template.example).forEach(key => {
                    newParams[key] = "";
                });
                setValue("params", newParams);
            }
        } else {
            setSelectedTemplate(null);
        }
    }, [watchTemplateId, templates, setValue]);

    // Filtreler değiştiğinde abone sayısını güncelle
    useEffect(() => {
        if (watchFilters) {
            fetchSubscriberCount(watchFilters);
        }
    }, [watchFilters]);

    // WhatsApp şablonlarını getir
    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/whatsapp/templates");
            const data = await response.json();

            if (data.success) {
                setTemplates(data.data);
            } else {
                setError(data.error || "Şablonlar yüklenirken bir hata oluştu");
            }
        } catch (err) {
            setError("Sunucu ile bağlantı hatası");
            console.error("Şablonlar yüklenirken hata:", err);
        } finally {
            setLoading(false);
        }
    };

    // Kullanılabilir etiketleri getir
    const fetchTags = async () => {
        try {
            const response = await fetch("/api/newsletters/tags");
            const data = await response.json();

            if (data.success) {
                setAvailableTags(data.data || []);
            }
        } catch (err) {
            console.error("Etiketler yüklenirken hata:", err);
        }
    };

    // Filtrelere göre abone sayısını getir
    const fetchSubscriberCount = async (filters: FormData["filters"]) => {
        try {
            const response = await fetch("/api/newsletters/count", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ filters }),
            });

            const data = await response.json();

            if (data.success) {
                setSubscriberCount(data.count);
            }
        } catch (err) {
            console.error("Abone sayısı alınırken hata:", err);
        }
    };

    // Formu gönder
    const onSubmit = async (data: FormData) => {
        setIsSending(true);
        setError(null);
        setSendResult(null);

        try {
            const response = await fetch("/api/whatsapp/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                setSendResult(result.data);
            } else {
                setError(result.error || "Mesaj gönderilirken bir hata oluştu");
            }
        } catch (err: any) {
            setError("Sunucu ile bağlantı hatası: " + err.message);
            console.error("Mesaj gönderme hatası:", err);
        } finally {
            setIsSending(false);
        }
    };

    // Formu temizle
    const handleReset = () => {
        reset();
        setSendResult(null);
        setError(null);
    };

    // Test numarası ekleme işlemi
    const handleAddTestPhone = () => {
        const phoneInput = document.getElementById("test-phone") as HTMLInputElement;
        const phone = phoneInput.value.trim();

        if (!phone) return;

        // Telefon numarası formatı kontrolü
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phone)) {
            setError("Geçerli bir telefon numarası giriniz (10-11 haneli)");
            return;
        }

        const currentPhones = watch("testPhones") || [];

        // Zaten eklenmiş mi kontrol et
        if (currentPhones.includes(phone)) {
            setError("Bu telefon numarası zaten eklenmiş");
            return;
        }

        setValue("testPhones", [...currentPhones, phone]);
        phoneInput.value = "";
        setError(null);
    };

    // Test numarası silme işlemi
    const handleRemoveTestPhone = (phone: string) => {
        const currentPhones = watch("testPhones") || [];
        setValue("testPhones", currentPhones.filter(p => p !== phone));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-400">
                    WhatsApp Mesajları
                </h1>
            </div>

            {/* Ana içerik */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sol kolon: Form */}
                <div className="lg:col-span-2">
                    <div className="rounded-lg border border-gray-800 bg-black bg-opacity-40 p-6 shadow-xl">
                        <h2 className="text-xl font-semibold text-silver mb-5">Toplu Mesaj Gönderimi</h2>

                        {error && (
                            <div className="mb-5 rounded-md bg-red-900 bg-opacity-20 p-4 text-sm text-red-200 border border-red-800">
                                {error}
                            </div>
                        )}

                        {sendResult && (
                            <div className="mb-5 rounded-md bg-emerald-900 bg-opacity-20 p-4 text-sm text-emerald-200 border border-emerald-800">
                                <h3 className="font-medium mb-1">Gönderim Sonucu</h3>
                                <p>Toplam Seçilen: {sendResult.totalSelected}</p>
                                <p>Başarılı: {sendResult.success}</p>
                                <p>Başarısız: {sendResult.failed}</p>
                                {sendResult.testMode && <p className="mt-1 font-medium">Test Modunda Gönderildi!</p>}

                                <div className="mt-3">
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="px-3 py-1 text-xs rounded-md border border-emerald-600 text-emerald-400 hover:bg-emerald-900 hover:bg-opacity-30"
                                    >
                                        Yeni Mesaj Oluştur
                                    </button>
                                </div>
                            </div>
                        )}

                        {!sendResult && (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                {/* Şablon seçimi */}
                                <div>
                                    <label className="block text-silver font-medium mb-2">
                                        Mesaj Şablonu <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        {...register("templateId", { required: "Şablon seçimi zorunludur" })}
                                        className="w-full rounded-md border border-gray-700 bg-black bg-opacity-60 px-3 py-2 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver"
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

                                {/* Şablon açıklaması */}
                                {selectedTemplate && (
                                    <div className="bg-zinc-900 bg-opacity-30 border border-gray-800 rounded-md p-3 text-sm">
                                        <p className="text-gray-300 mb-1">{selectedTemplate.description}</p>
                                        <div className="text-xs text-gray-400 mt-2">
                                            <span className="font-medium text-gray-400">Örnek Parametreler:</span>{" "}
                                            {Object.entries(selectedTemplate.example).map(([key, value], idx) => (
                                                <span key={key}>
                                                    {idx > 0 && ", "}
                                                    <code className="text-emerald-400">{key}</code>: {value}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Şablon parametreleri */}
                                {selectedTemplate && (
                                    <div className="border-t border-gray-800 pt-5 mt-5">
                                        <h3 className="font-medium text-silver mb-3">Şablon Parametreleri</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {Object.keys(selectedTemplate.example).map((param) => (
                                                <div key={param}>
                                                    <label className="block text-silver text-sm font-medium mb-1">
                                                        {param}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        {...register(`params.${param}`)}
                                                        placeholder={selectedTemplate.example[param]}
                                                        className="w-full rounded-md border border-gray-700 bg-black bg-opacity-60 px-3 py-2 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Filtreler */}
                                <div className="border-t border-gray-800 pt-5 mt-5">
                                    <h3 className="font-medium text-silver mb-3">Alıcı Filtreleri</h3>

                                    {/* Abone sayısı */}
                                    <div className="mb-4 p-3 bg-zinc-900 bg-opacity-20 rounded-md text-sm border border-gray-800">
                                        <span className="text-silver">Seçilen kriterlere uyan abone sayısı: </span>
                                        <span className="font-medium text-emerald-400">{subscriberCount}</span>
                                    </div>

                                    {/* Etiketler */}
                                    <div className="mb-4">
                                        <label className="block text-silver text-sm font-medium mb-1">
                                            Etiketlere Göre Filtrele
                                        </label>
                                        <select
                                            multiple
                                            {...register("filters.tags")}
                                            className="w-full rounded-md border border-gray-700 bg-black bg-opacity-60 px-3 py-2 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver"
                                            size={3}
                                        >
                                            {availableTags.map((tag) => (
                                                <option key={tag} value={tag}>
                                                    {tag}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Birden fazla etiket seçmek için CTRL tuşuna basılı tutun
                                        </p>
                                    </div>

                                    {/* Şirket adı */}
                                    <div className="mb-4">
                                        <label className="block text-silver text-sm font-medium mb-1">
                                            Şirket Adına Göre Filtrele
                                        </label>
                                        <input
                                            type="text"
                                            {...register("filters.companyName")}
                                            placeholder="Şirket adı içeren aboneler"
                                            className="w-full rounded-md border border-gray-700 bg-black bg-opacity-60 px-3 py-2 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver"
                                        />
                                    </div>
                                </div>

                                {/* Test modu */}
                                <div className="border-t border-gray-800 pt-5 mt-5">
                                    <div className="flex items-center mb-3">
                                        <input
                                            type="checkbox"
                                            id="testMode"
                                            {...register("testMode")}
                                            className="h-4 w-4 rounded border-gray-700 bg-black text-silver focus:ring-silver"
                                        />
                                        <label htmlFor="testMode" className="ml-2 block text-sm text-silver">
                                            Test Modu (Sadece belirli numaralara gönder)
                                        </label>
                                    </div>

                                    {watchTestMode && (
                                        <div className="mt-3 bg-zinc-900 bg-opacity-20 border border-gray-800 rounded-md p-4">
                                            <h4 className="text-silver text-sm font-medium mb-2">Test Telefon Numaraları</h4>

                                            {/* Test numarası ekleme */}
                                            <div className="flex space-x-2 mb-3">
                                                <input
                                                    type="text"
                                                    id="test-phone"
                                                    placeholder="5XXXXXXXXX"
                                                    className="flex-1 rounded-md border border-gray-700 bg-black bg-opacity-60 px-3 py-2 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddTestPhone}
                                                    className="px-3 py-2 rounded-md bg-zinc-800 text-silver border border-gray-700 hover:bg-zinc-700"
                                                >
                                                    Ekle
                                                </button>
                                            </div>

                                            {/* Test numaraları listesi */}
                                            <div className="space-y-2">
                                                {watch("testPhones")?.length === 0 ? (
                                                    <p className="text-sm text-gray-400">Henüz test numarası eklenmedi</p>
                                                ) : (
                                                    watch("testPhones")?.map((phone) => (
                                                        <div
                                                            key={phone}
                                                            className="flex justify-between items-center bg-black bg-opacity-40 px-3 py-2 rounded-md"
                                                        >
                                                            <span className="text-silver">{phone}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveTestPhone(phone)}
                                                                className="text-red-400 hover:text-red-300"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            {watch("testPhones")?.length === 0 && watchTestMode && (
                                                <p className="mt-2 text-sm text-amber-400">
                                                    Uyarı: Test modu açık ancak hiç test numarası eklenmedi
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Gönder butonu */}
                                <div className="pt-5">
                                    <button
                                        type="submit"
                                        disabled={isSending || loading}
                                        className="w-full px-6 py-3 rounded-md bg-gradient-to-r from-gray-700 to-gray-900 text-silver font-medium border border-gray-600 shadow-lg hover:from-gray-600 hover:to-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-silver focus:ring-opacity-50 disabled:opacity-70"
                                    >
                                        {isSending ? (
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
                                            "Mesajları Gönder"
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Sağ kolon: Bilgi kartları */}
                <div className="lg:col-span-1">
                    <div className="space-y-5">
                        {/* Bilgi kartı 1 */}
                        <div className="rounded-lg border border-gray-800 bg-black bg-opacity-40 p-5 shadow-xl">
                            <h3 className="text-lg font-semibold text-silver mb-3">WhatsApp Mesajları Hakkında</h3>
                            <p className="text-sm text-gray-300 mb-3">
                                WhatsApp Business API kullanarak abonelerinize toplu mesaj gönderebilirsiniz.
                                Mesajlar, onaylı şablonlar üzerinden gönderilmektedir.
                            </p>
                            <ul className="text-sm text-gray-300 list-disc pl-5 space-y-1">
                                <li>Şablonlar WhatsApp tarafından onaylanmış olmalıdır</li>
                                <li>Onaylı şablonlarda değişiklik sadece değişken alanlarında yapılabilir</li>
                                <li>WhatsApp'ın spam politikasına uygun mesajlar gönderilmelidir</li>
                            </ul>
                        </div>

                        {/* Bilgi kartı 2 */}
                        <div className="rounded-lg border border-gray-800 bg-black bg-opacity-40 p-5 shadow-xl">
                            <h3 className="text-lg font-semibold text-silver mb-3">Test Modu</h3>
                            <p className="text-sm text-gray-300 mb-3">
                                Test modunda mesajlar yalnızca belirttiğiniz telefon numaralarına gönderilir.
                                Bu mod, mesajların içeriğini ve formatını doğrulamak için kullanışlıdır.
                            </p>
                            <p className="text-sm text-gray-300 mb-2">
                                <span className="font-medium">Örnek telefon numarası formatı:</span> 5XXXXXXXXX
                            </p>
                            <div className="text-xs bg-zinc-900 p-2 rounded text-amber-300">
                                Not: Test modunu kapatmadan gerçek gönderim yapmayınız!
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 