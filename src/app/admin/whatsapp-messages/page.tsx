"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

// Form veri tipi
type FormData = {
    templateId: string;
    filterType: string;
    tags: string[];
    testMode: boolean;
    testPhones: string;
    params: {
        param1: string;
        param2: string;
        param3: string;
        param4: string;
    };
};

// Şablon tipi
type Template = {
    id: string;
    name: string;
    paramCount: number;
    status: string;
    category: string;
    language: string;
};

export default function WhatsAppMessagesPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [templatesLoading, setTemplatesLoading] = useState(true);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            templateId: "",
            filterType: "all",
            tags: [],
            testMode: true,
            testPhones: "",
            params: {
                param1: "",
                param2: "",
                param3: "",
                param4: "",
            },
        },
    });

    // Izlenen form değerleri
    const watchTemplateId = watch("templateId");
    const watchFilterType = watch("filterType");
    const watchTestMode = watch("testMode");

    // WhatsApp API'den onaylanmış şablonları yükle
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setTemplatesLoading(true);
                const response = await fetch("/api/whatsapp/templates");
                const data = await response.json();

                if (data.success) {
                    setTemplates(data.templates || []);
                } else {
                    console.error("Şablonlar yüklenemedi:", data.error);
                    setError(`WhatsApp şablonları yüklenemedi: ${data.error}`);
                }
            } catch (error) {
                console.error("Şablonlar yüklenirken hata:", error);
                setError("Şablonlar yüklenirken bir hata oluştu.");
            } finally {
                setTemplatesLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    // Şablon değiştiğinde
    useEffect(() => {
        if (watchTemplateId && templates.length > 0) {
            const template = templates.find((t) => t.id === watchTemplateId);
            setSelectedTemplate(template || null);
        } else {
            setSelectedTemplate(null);
        }
    }, [watchTemplateId, templates]);

    // Etiketleri yükle
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch("/api/whatsapp/tags");
                const data = await response.json();

                if (data.success) {
                    setTags(data.tags);
                }
            } catch (error) {
                console.error("Etiketler yüklenirken hata:", error);
            }
        };

        fetchTags();
    }, []);

    // Form gönderimi
    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Parametreleri hazırla
            const params: Record<string, string> = {};

            if (selectedTemplate && selectedTemplate.paramCount > 0) {
                for (let i = 1; i <= selectedTemplate.paramCount; i++) {
                    const paramValue = data.params[`param${i}` as keyof typeof data.params];
                    if (paramValue) {
                        params[`param${i}`] = paramValue;
                    }
                }
            }

            // Filtre hazırla
            const filters: any = {};

            if (data.filterType === "tags" && data.tags.length > 0) {
                filters.tags = data.tags;
            }

            // API isteği
            const payload = {
                templateId: data.templateId,
                filters,
                testMode: data.testMode,
                testPhones: data.testMode ? data.testPhones.split(",").map(p => p.trim()) : undefined,
                params
            };

            const response = await fetch("/api/whatsapp/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.success) {
                setResult(result.data);
            } else {
                setError(result.error || "Bir hata oluştu.");
            }
        } catch (err: any) {
            setError("Bağlantı hatası: " + (err.message || "Bilinmeyen hata"));
        } finally {
            setLoading(false);
        }
    };

    // Hata durumunda varsayılan şablonları göster
    // Sadece aktif olduğunu bildiğimiz hello_world şablonunu burada göster
    useEffect(() => {
        setTemplates([
            {
                id: "hello_world",
                name: "Hello World",
                status: "APPROVED",
                category: "UTILITY",
                language: "en_US",
                paramCount: 0 // Parametre yok
            }
        ]);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-400">
                    WhatsApp Toplu Mesaj Gönderimi
                </h1>
            </div>

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

                        {result && (
                            <div className="mb-5 rounded-md bg-emerald-900 bg-opacity-20 p-4 text-sm text-emerald-200 border border-emerald-800">
                                <h3 className="font-medium mb-1">Mesaj Gönderimi Tamamlandı!</h3>
                                <p>Toplam Alıcı Sayısı: {result.totalSelected}</p>
                                <p>Başarılı: {result.success}</p>
                                <p>Başarısız: {result.failed}</p>
                                <button
                                    onClick={() => setResult(null)}
                                    className="mt-3 px-3 py-1 rounded-md bg-black bg-opacity-30 border border-emerald-600 text-emerald-400 hover:bg-emerald-900 hover:bg-opacity-30 text-xs"
                                >
                                    Yeni İleti
                                </button>
                            </div>
                        )}

                        {!result && (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                {/* Şablon seçimi */}
                                <div>
                                    <label className="block text-silver font-medium mb-2">
                                        Mesaj Şablonu <span className="text-red-400">*</span>
                                    </label>
                                    {templatesLoading ? (
                                        <div className="w-full rounded-md border border-gray-700 bg-black bg-opacity-60 p-3 text-gray-400 text-sm">
                                            <div className="flex items-center">
                                                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                WhatsApp şablonları yükleniyor...
                                            </div>
                                        </div>
                                    ) : templates.length === 0 ? (
                                        <div className="w-full rounded-md border border-yellow-700 bg-yellow-900 bg-opacity-20 p-3 text-yellow-200 text-sm">
                                            Onaylanmış WhatsApp şablonu bulunamadı. Lütfen Meta Business platformundan şablonlar oluşturun ve onaylatın.
                                        </div>
                                    ) : (
                                        <select
                                            {...register("templateId", { required: "Şablon seçimi zorunludur" })}
                                            className="w-full px-4 py-3 rounded-md border border-gray-700 bg-black bg-opacity-60 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver"
                                        >
                                            <option value="">Şablon Seçiniz</option>
                                            {templates.map((template) => (
                                                <option key={template.id} value={template.id}>
                                                    {template.name} ({template.language})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {errors.templateId && (
                                        <p className="mt-1 text-sm text-red-400">{errors.templateId.message}</p>
                                    )}
                                </div>

                                {/* Şablon detayları */}
                                {selectedTemplate && (
                                    <div className="rounded-md border border-gray-700 bg-black bg-opacity-20 p-3">
                                        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                            <div>
                                                <span className="text-gray-400">Kategori:</span>{" "}
                                                <span className="text-silver">{selectedTemplate.category}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Dil:</span>{" "}
                                                <span className="text-silver">{selectedTemplate.language}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                            <div>
                                                <span className="text-gray-400">Durum:</span>{" "}
                                                <span className={`${selectedTemplate.status === 'APPROVED' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                                    {selectedTemplate.status === 'APPROVED' ? 'Onaylandı' : selectedTemplate.status}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Parametreler:</span>{" "}
                                                <span className="text-silver">
                                                    {selectedTemplate.paramCount > 0 ? `${selectedTemplate.paramCount} adet` : 'Yok'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Şablon parametreleri */}
                                {selectedTemplate && (
                                    <div className="p-4 bg-gray-800 bg-opacity-40 rounded-md border border-gray-700">
                                        <h3 className="text-md font-medium text-silver mb-3">Şablon Parametreleri</h3>
                                        {selectedTemplate.paramCount > 0 ? (
                                            <div className="space-y-3">
                                                {Array.from({ length: selectedTemplate.paramCount }).map((_, index) => (
                                                    <div key={`param${index + 1}`}>
                                                        <label className="block text-gray-300 text-sm font-medium mb-1">
                                                            Parametre {index + 1}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            {...register(`params.param${index + 1}` as any)}
                                                            className="w-full px-3 py-2 rounded-md border border-gray-700 bg-black bg-opacity-50 text-silver text-sm focus:border-silver focus:outline-none"
                                                            placeholder={`Parametre ${index + 1} değeri`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-gray-900 bg-opacity-50 rounded-md text-gray-300 text-sm">
                                                Bu şablon herhangi bir parametre gerektirmiyor. Bu şablon sabit bir metin içerir ve özelleştirilebilir alanlar bulunmamaktadır.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Filtre tipi */}
                                <div>
                                    <label className="block text-silver font-medium mb-2">
                                        Alıcıları Filtrele
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <label className="flex items-center space-x-2 p-3 rounded-md border border-gray-700 bg-black bg-opacity-30 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="all"
                                                {...register("filterType")}
                                                className="h-4 w-4 text-blue-600"
                                            />
                                            <span className="text-silver">Tüm Aboneler</span>
                                        </label>
                                        <label className="flex items-center space-x-2 p-3 rounded-md border border-gray-700 bg-black bg-opacity-30 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="tags"
                                                {...register("filterType")}
                                                className="h-4 w-4 text-blue-600"
                                            />
                                            <span className="text-silver">Etiketlere Göre</span>
                                        </label>
                                        <label className="flex items-center space-x-2 p-3 rounded-md border border-gray-700 bg-black bg-opacity-30 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="manual"
                                                {...register("filterType")}
                                                className="h-4 w-4 text-blue-600"
                                            />
                                            <span className="text-silver">Manuel Liste</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Etiket seçimi */}
                                {watchFilterType === "tags" && (
                                    <div>
                                        <label className="block text-silver font-medium mb-2">
                                            Etiketler
                                        </label>
                                        <div className="h-32 overflow-y-auto p-3 rounded-md border border-gray-700 bg-black bg-opacity-30">
                                            {tags.length === 0 ? (
                                                <p className="text-gray-500 text-sm">Etiket bulunamadı</p>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2">
                                                    {tags.map((tag) => (
                                                        <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                value={tag}
                                                                {...register("tags")}
                                                                className="h-4 w-4 text-blue-600"
                                                            />
                                                            <span className="text-silver text-sm">{tag}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Test modu */}
                                <div className="pt-2">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            {...register("testMode")}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <span className="text-silver font-medium">Test Modu (Sadece belirli numaralara gönder)</span>
                                    </label>
                                </div>

                                {/* Test telefon numaraları */}
                                {watchTestMode && (
                                    <div>
                                        <label className="block text-silver font-medium mb-2">
                                            Test Telefon Numaraları <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            {...register("testPhones", {
                                                required: "Test numaraları zorunludur",
                                            })}
                                            className="w-full px-4 py-3 rounded-md border border-gray-700 bg-black bg-opacity-60 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver"
                                            placeholder="5XXXXXXXXX, 5XXXXXXXXX (virgülle ayırın)"
                                        />
                                        {errors.testPhones && (
                                            <p className="mt-1 text-sm text-red-400">{errors.testPhones.message}</p>
                                        )}
                                    </div>
                                )}

                                {/* Gönder butonu */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading || templatesLoading || templates.length === 0}
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
                        <div className="rounded-lg border border-gray-800 bg-black bg-opacity-40 p-5 shadow-xl">
                            <h3 className="text-lg font-semibold text-silver mb-3">Toplu Mesaj Gönderimi</h3>
                            <p className="text-sm text-gray-300 mb-3">
                                Bu sayfadan tüm abonelerinize veya filtrelediğiniz abonelere toplu WhatsApp mesajları gönderebilirsiniz.
                            </p>
                            <ul className="text-sm text-gray-300 list-disc pl-5 space-y-1">
                                <li>Mesaj göndermek için onaylanmış bir şablon seçin</li>
                                <li>Şablonda kullanılan değişkenleri doldurun</li>
                                <li>Alıcıları filtrelemek için seçenekleri kullanın</li>
                                <li>Test modunda sadece belirlediğiniz numaralara mesaj gönderilir</li>
                            </ul>
                        </div>

                        <div className="rounded-lg border border-gray-800 bg-black bg-opacity-40 p-5 shadow-xl">
                            <h3 className="text-lg font-semibold text-silver mb-3">WhatsApp API Limitleri</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-300">24 Saat Mesaj Limiti</span>
                                    <span className="text-sm text-gray-300">500</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-300">Dakikalık Gönderim Limiti</span>
                                    <span className="text-sm text-gray-300">50</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-300">Şablon Onay Durumu</span>
                                    <span className="text-sm text-emerald-400">
                                        {templates.length > 0 ? `${templates.length} şablon` : "Şablon yok"}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-3 p-2 bg-zinc-900 rounded text-xs text-amber-300">
                                Not: WhatsApp API limitlerini aşmanız durumunda hesabınız geçici olarak kısıtlanabilir.
                            </div>
                        </div>

                        {templates.length > 0 && (
                            <div className="rounded-lg border border-gray-800 bg-black bg-opacity-40 p-5 shadow-xl">
                                <h3 className="text-lg font-semibold text-silver mb-3">Onaylı Şablonlar</h3>
                                <div className="space-y-2 max-h-72 overflow-y-auto">
                                    {templates.map((template) => (
                                        <div key={template.id} className="p-2 border border-gray-700 rounded-md bg-black bg-opacity-40">
                                            <div className="font-medium text-silver">{template.name}</div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-400">{template.language}</span>
                                                <span className="text-gray-400">{template.category}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 