"use client";

import { useState, useEffect } from "react";
import { ICampaign } from "@/models/Campaign";
import Link from "next/link";

// WhatsApp template'i için interface
interface WhatsAppTemplate {
    _id: string;
    name: string;
    parameters?: string[];
    content?: string;
    language?: string;
    status?: string;
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "planned">("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSendForm, setShowSendForm] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<ICampaign | null>(null);
    const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [paramValues, setParamValues] = useState<Record<string, string>>({});
    const [selectedSubscriberIds, setSelectedSubscriberIds] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Yeni kampanya formu için state
    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    const [campaignFormData, setCampaignFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'planned'
    });

    // API'den kampanyaları çek
    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/campaigns');

            if (!response.ok) {
                throw new Error('Kampanya verileri alınamadı');
            }

            const result = await response.json();
            setCampaigns(result.data || []);
        } catch (err: any) {
            setError('Kampanya verileri yüklenirken bir hata oluştu: ' + err.message);
            console.error('Kampanya yükleme hatası:', err);
        } finally {
            setLoading(false);
        }
    };

    // Kampanya formunu açma
    const handleShowAddForm = () => {
        setCampaignFormData({
            name: '',
            description: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'planned'
        });
        setFormMode('add');
        setShowForm(true);
    };

    // Kampanya düzenleme formunu açma
    const handleShowEditForm = (campaign: ICampaign) => {
        setCampaignFormData({
            name: campaign.name,
            description: campaign.description,
            startDate: new Date(campaign.startDate).toISOString().split('T')[0],
            endDate: new Date(campaign.endDate).toISOString().split('T')[0],
            status: campaign.status
        });
        setSelectedCampaign(campaign);
        setFormMode('edit');
        setShowForm(true);
    };

    // Form alanlarının değişimini işle
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCampaignFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Kampanya form gönderimi
    const handleSubmitCampaignForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError(null);

        try {
            const url = formMode === 'add'
                ? '/api/campaigns'
                : `/api/campaigns/${selectedCampaign?._id}`;

            const method = formMode === 'add' ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(campaignFormData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "İşlem başarısız oldu");
            }

            fetchCampaigns();
            setShowForm(false);
            setSuccessMessage(
                formMode === 'add'
                    ? 'Kampanya başarıyla oluşturuldu'
                    : 'Kampanya başarıyla güncellendi'
            );

            // 3 saniye sonra başarı mesajını kaldır
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err: any) {
            setSubmitError('İşlem sırasında bir hata oluştu: ' + err.message);
            console.error('Kampanya form hatası:', err);
        } finally {
            setSubmitting(false);
        }
    };

    // Kampanya durumunu değiştir
    const handleChangeStatus = async (campaign: ICampaign, newStatus: 'active' | 'completed' | 'planned') => {
        if (campaign.status === newStatus) return;

        try {
            setLoading(true);

            const response = await fetch('/api/campaigns/status', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    campaignId: campaign._id,
                    status: newStatus
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Durum güncellenemedi');
            }

            // Başarılı olduğunda kampanya listesini yenile
            fetchCampaigns();
            setSuccessMessage(`Kampanya durumu "${newStatus}" olarak güncellendi`);

            // 3 saniye sonra başarı mesajını kaldır
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err: any) {
            console.error('Durum güncelleme hatası:', err);
            setError('Durum güncellenirken bir hata oluştu: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // WhatsApp şablonlarını getir
    const fetchTemplates = async () => {
        try {
            const response = await fetch('/api/whatsapp/templates');

            if (!response.ok) {
                throw new Error('Şablon verileri alınamadı');
            }

            const result = await response.json();
            setTemplates(result.data || []);
        } catch (err: any) {
            console.error('Şablon yükleme hatası:', err);
        }
    };

    // Aboneleri getir
    const fetchSubscribers = async () => {
        try {
            const response = await fetch('/api/whatsapp/subscribers');

            if (!response.ok) {
                throw new Error('Abone verileri alınamadı');
            }

            const result = await response.json();
            setSubscribers(result.data || []);
        } catch (err: any) {
            console.error('Abone yükleme hatası:', err);
        }
    };

    // Etiketleri getir
    const fetchTags = async () => {
        try {
            const response = await fetch('/api/whatsapp/tags');

            if (!response.ok) {
                throw new Error('Etiket verileri alınamadı');
            }

            const result = await response.json();
            setTags(result.data || []);
        } catch (err: any) {
            console.error('Etiket yükleme hatası:', err);
        }
    };

    // WhatsApp mesajını göndermek için formu aç
    const handleShowWhatsAppForm = async (campaign: ICampaign) => {
        setSelectedCampaign(campaign);
        setSelectedTemplateId("");
        setParamValues({});
        setSelectedSubscriberIds([]);
        setSelectedTags([]);

        // Şablonları, aboneleri ve etiketleri getir
        await Promise.all([
            fetchTemplates(),
            fetchSubscribers(),
            fetchTags()
        ]);

        setShowSendForm(true);
    };

    // Şablon seçildiğinde parametreleri sıfırla
    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTemplateId(e.target.value);
        setParamValues({});
    };

    // Parametre değeri değiştiğinde
    const handleParamChange = (param: string, value: string) => {
        setParamValues(prev => ({
            ...prev,
            [param]: value
        }));
    };

    // Etiket değiştiğinde aboneleri filtrele
    const handleTagChange = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(prev => prev.filter(t => t !== tag));
        } else {
            setSelectedTags(prev => [...prev, tag]);
        }
    };

    // Filtrelenmiş aboneleri getir
    const getFilteredSubscribers = () => {
        if (selectedTags.length === 0) {
            return subscribers;
        }

        return subscribers.filter(sub => {
            if (!sub.tags || !Array.isArray(sub.tags)) return false;
            return selectedTags.some(tag => sub.tags.includes(tag));
        });
    };

    // Mesaj gönderme işlemi
    const handleSendWhatsAppMessages = async (e: React.FormEvent) => {
        e.preventDefault();

        // Form doğrulama
        if (!selectedTemplateId) {
            setSubmitError("Lütfen bir mesaj şablonu seçin");
            return;
        }

        const filteredSubscribers = getFilteredSubscribers();
        if (filteredSubscribers.length === 0) {
            setSubmitError("Gönderilecek abone bulunamadı");
            return;
        }

        // Boş parametre kontrolü
        const selectedTemplate = templates.find(t => t._id === selectedTemplateId);
        if (selectedTemplate && selectedTemplate.parameters) {
            for (const param of selectedTemplate.parameters) {
                if (!paramValues[param] || paramValues[param].trim() === '') {
                    setSubmitError(`Lütfen '${param}' parametresi için bir değer girin`);
                    return;
                }
            }
        }

        try {
            setSubmitting(true);
            setSubmitError(null);

            // WhatsApp mesajı gönderme - yeni API endpoint
            const response = await fetch('/api/campaigns/send-whatsapp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    campaignId: selectedCampaign?._id,
                    templateId: selectedTemplateId,
                    parameters: paramValues,
                    tags: selectedTags
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Mesaj gönderimi başarısız oldu");
            }

            setSuccessMessage(`${result.data.recipientCount} alıcıya WhatsApp mesajı başarıyla gönderildi`);
            fetchCampaigns(); // Kampanya verilerini güncelle

            // 3 saniye sonra başarı mesajını kapat
            setTimeout(() => {
                setSuccessMessage(null);
                setShowSendForm(false);
            }, 3000);

        } catch (err: any) {
            setSubmitError("Mesaj gönderilirken bir hata oluştu: " + err.message);
            console.error("WhatsApp mesaj gönderme hatası:", err);
        } finally {
            setSubmitting(false);
        }
    };

    // Arama ve durum filtreleme
    const filteredCampaigns = campaigns.filter((campaign) => {
        const matchesSearch = searchTerm
            ? campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
            : true;

        const matchesStatus =
            statusFilter === "all" ? true :
                campaign.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // İptal butonuna tıklandığında
    const handleCancel = () => {
        setShowSendForm(false);
        setShowForm(false);
        setSubmitError(null);
        setSuccessMessage(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-300">Kampanya Yönetimi</h1>
                <button
                    onClick={handleShowAddForm}
                    className="rounded-md bg-gradient-to-r from-gray-700 to-gray-900 px-4 py-2 text-gray-200 transition-colors hover:from-gray-600 hover:to-gray-800 border border-gray-600 shadow-md"
                >
                    Yeni Kampanya Oluştur
                </button>
            </div>

            {successMessage && (
                <div className="rounded-md bg-emerald-900 bg-opacity-20 p-3 text-sm text-emerald-200 border border-emerald-800">
                    {successMessage}
                </div>
            )}

            {/* Arama ve filtreleme */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Kampanya adı veya açıklama ile ara..."
                        className="w-full rounded-md border border-gray-700 bg-gray-800 bg-opacity-50 px-4 py-2 pl-10 text-gray-200 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                </div>

                <div className="w-full md:w-64">
                    <select
                        className="w-full rounded-md border border-gray-700 bg-gray-800 bg-opacity-50 px-4 py-2 text-gray-200 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "completed" | "planned")}
                    >
                        <option value="all">Tüm Kampanyalar</option>
                        <option value="active">Aktif Kampanyalar</option>
                        <option value="completed">Tamamlanan Kampanyalar</option>
                        <option value="planned">Planlanan Kampanyalar</option>
                    </select>
                </div>
            </div>

            {/* Yükleme ve hata durumları */}
            {loading ? (
                <div className="text-center py-10">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-transparent"></div>
                    <p className="mt-2 text-gray-400">Kampanyalar yükleniyor...</p>
                </div>
            ) : error ? (
                <div className="bg-red-900 bg-opacity-20 border border-red-800 p-4 rounded-md">
                    <p className="text-red-200">{error}</p>
                    <button
                        onClick={fetchCampaigns}
                        className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
                    >
                        Yeniden dene
                    </button>
                </div>
            ) : campaigns.length === 0 ? (
                <div className="text-center py-10 border border-gray-700 rounded-md">
                    <p className="text-gray-400">Henüz kampanya bulunmuyor.</p>
                </div>
            ) : (
                <>
                    {/* Kampanya Kartları */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredCampaigns.map((campaign) => (
                            <div key={campaign._id} className="overflow-hidden rounded-lg border border-gray-700 bg-black bg-opacity-50 shadow-lg transition-transform hover:scale-[1.02] hover:shadow-xl">
                                <div className="px-6 py-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-gray-300">{campaign.name}</h3>
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-medium ${campaign.status === "active"
                                                ? "bg-gray-800 text-emerald-400 border border-emerald-500/30"
                                                : campaign.status === "completed"
                                                    ? "bg-gray-800 text-gray-300 border border-gray-500/30"
                                                    : "bg-gray-800 text-amber-400 border border-amber-500/30"
                                                }`}
                                        >
                                            {campaign.status === "active"
                                                ? "Aktif"
                                                : campaign.status === "completed"
                                                    ? "Tamamlandı"
                                                    : "Planlandı"}
                                        </span>
                                    </div>
                                    <p className="mb-4 text-sm text-gray-400">{campaign.description}</p>

                                    <div className="mb-4 grid grid-cols-2 gap-4 border-t border-b border-gray-700 py-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Başlangıç</p>
                                            <p className="text-sm font-medium text-gray-300">
                                                {new Date(campaign.startDate).toLocaleDateString("tr-TR")}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Bitiş</p>
                                            <p className="text-sm font-medium text-gray-300">
                                                {new Date(campaign.endDate).toLocaleDateString("tr-TR")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-4 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Gönderilen E-posta</p>
                                            <p className="text-sm font-medium text-gray-300">
                                                {campaign.sentEmails || 0}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Gönderilen WhatsApp</p>
                                            <p className="text-sm font-medium text-gray-300">
                                                {campaign.whatsappSent || 0}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => handleShowWhatsAppForm(campaign)}
                                            className="flex items-center rounded-md bg-gradient-to-r from-emerald-700 to-emerald-900 px-3 py-1.5 text-xs text-white transition-colors hover:from-emerald-600 hover:to-emerald-800"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            WhatsApp Gönder
                                        </button>
                                        <button
                                            onClick={() => handleShowEditForm(campaign)}
                                            className="flex items-center rounded-md bg-gradient-to-r from-blue-700 to-blue-900 px-3 py-1.5 text-xs text-white transition-colors hover:from-blue-600 hover:to-blue-800"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Düzenle
                                        </button>
                                        {campaign.status !== "active" && (
                                            <button
                                                onClick={() => handleChangeStatus(campaign, "active")}
                                                className="flex items-center rounded-md bg-gradient-to-r from-gray-600 to-gray-800 px-3 py-1.5 text-xs text-gray-200 transition-colors hover:from-gray-500 hover:to-gray-700"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Aktifleştir
                                            </button>
                                        )}
                                        {campaign.status !== "completed" && (
                                            <button
                                                onClick={() => handleChangeStatus(campaign, "completed")}
                                                className="flex items-center rounded-md bg-gradient-to-r from-gray-600 to-gray-800 px-3 py-1.5 text-xs text-gray-200 transition-colors hover:from-gray-500 hover:to-gray-700"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Tamamla
                                            </button>
                                        )}
                                        {campaign.status !== "planned" && (
                                            <button
                                                onClick={() => handleChangeStatus(campaign, "planned")}
                                                className="flex items-center rounded-md bg-gradient-to-r from-gray-600 to-gray-800 px-3 py-1.5 text-xs text-gray-200 transition-colors hover:from-gray-500 hover:to-gray-700"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Planla
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                                <p className="mt-4 text-sm text-gray-500">
                                    Toplam {campaigns.length} kampanya, {filteredCampaigns.length} sonuç gösteriliyor
                                </p>
                </>
            )}

            {/* Yeni / Edit Kampanya Formu */}
            {showForm && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="relative bg-gray-900 rounded-lg border border-gray-700 shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-200 mb-5">
                                {formMode === 'add' ? 'Yeni Kampanya Oluştur' : 'Kampanya Düzenle'}
                            </h3>

                        {submitError && (
                            <div className="mb-4 rounded-md bg-red-900 bg-opacity-20 p-3 text-sm text-red-200 border border-red-800">
                                {submitError}
                            </div>
                        )}

                        <form onSubmit={handleSubmitCampaignForm}>
                            <div className="space-y-4">
                                <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                                            Kampanya Adı <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                            required
                                        value={campaignFormData.name}
                                        onChange={handleFormChange}
                                            className="w-full rounded-md border border-gray-700 bg-gray-800 bg-opacity-50 px-4 py-2 text-gray-200 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                                    />
                                </div>

                                <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                                            Açıklama <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                            required
                                            rows={3}
                                        value={campaignFormData.description}
                                        onChange={handleFormChange}
                                            className="w-full rounded-md border border-gray-700 bg-gray-800 bg-opacity-50 px-4 py-2 text-gray-200 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                                        />
                                </div>

                                    <div className="grid grid-cols-2 gap-4">
                                    <div>
                                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">
                                                Başlangıç Tarihi <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="startDate"
                                            name="startDate"
                                                required
                                            value={campaignFormData.startDate}
                                            onChange={handleFormChange}
                                                className="w-full rounded-md border border-gray-700 bg-gray-800 bg-opacity-50 px-4 py-2 text-gray-200 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                                        />
                                        </div>
                                    <div>
                                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">
                                                Bitiş Tarihi <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="endDate"
                                            name="endDate"
                                                required
                                            value={campaignFormData.endDate}
                                            onChange={handleFormChange}
                                                className="w-full rounded-md border border-gray-700 bg-gray-800 bg-opacity-50 px-4 py-2 text-gray-200 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
                                            Durum <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                            required
                                        value={campaignFormData.status}
                                        onChange={handleFormChange}
                                            className="w-full rounded-md border border-gray-700 bg-gray-800 bg-opacity-50 px-4 py-2 text-gray-200 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                                    >
                                        <option value="planned">Planlandı</option>
                                        <option value="active">Aktif</option>
                                        <option value="completed">Tamamlandı</option>
                                    </select>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="rounded-md border border-gray-700 bg-transparent px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="rounded-md bg-gradient-to-r from-gray-700 to-gray-900 px-4 py-2 text-sm text-gray-200 transition-colors hover:from-gray-600 hover:to-gray-800 border border-gray-600 disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Kaydediliyor...
                                            </span>
                                        ) : (
                                                'Kaydet'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* WhatsApp Mesaj Gönderme Formu */}
            {showSendForm && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="relative bg-gray-900 rounded-lg border border-gray-700 shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-200 mb-3">
                                WhatsApp Mesajı Gönder
                            </h3>
                            <p className="text-sm text-gray-400 mb-5">
                                <span className="font-semibold text-gray-300">{selectedCampaign?.name}</span> kampanyası için WhatsApp mesajı gönder
                            </p>

                        {submitError && (
                            <div className="mb-4 rounded-md bg-red-900 bg-opacity-20 p-3 text-sm text-red-200 border border-red-800">
                                {submitError}
                            </div>
                        )}

                        <form onSubmit={handleSendWhatsAppMessages}>
                                <div className="space-y-4">
                                <div>
                                        <label htmlFor="templateId" className="block text-sm font-medium text-gray-300 mb-1">
                                            Mesaj Şablonu <span className="text-red-400">*</span>
                                        </label>
                                    <select
                                            id="templateId"
                                        value={selectedTemplateId}
                                        onChange={handleTemplateChange}
                                            className="w-full rounded-md border border-gray-700 bg-gray-800 bg-opacity-50 px-4 py-2 text-gray-200 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                                            required
                                    >
                                            <option value="">Şablon seçin</option>
                                            {templates.map((template) => (
                                            <option key={template._id} value={template._id}>
                                                {template.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                    {selectedTemplateId && (
                                        <div className="space-y-3">
                                            <p className="text-sm font-medium text-gray-300">Parametre Değerleri</p>
                                            {templates
                                                .find((t) => t._id === selectedTemplateId)
                                                ?.parameters?.map((param: string) => (
                                                <div key={param}>
                                                        <label htmlFor={`param-${param}`} className="block text-sm text-gray-400 mb-1">
                                                            {param}
                                                        </label>
                                                    <input
                                                        type="text"
                                                            id={`param-${param}`}
                                                        value={paramValues[param] || ''}
                                                        onChange={(e) => handleParamChange(param, e.target.value)}
                                                            className="w-full rounded-md border border-gray-700 bg-gray-800 bg-opacity-50 px-4 py-2 text-gray-200 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                                                            required
                                                    />
                                                </div>
                                                ))}
                                    </div>
                                )}

                                <div>
                                        <p className="text-sm font-medium text-gray-300 mb-2">
                                            Hedef Kitle
                                        </p>

                                        <div className="mb-3">
                                            <label className="text-sm text-gray-400">Etiketler</label>
                                            <div className="mt-1 flex flex-wrap gap-2">
                                                {tags.map((tag) => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => handleTagChange(tag)}
                                                        className={`rounded-full px-3 py-1 text-xs font-medium ${selectedTags.includes(tag)
                                                            ? 'bg-gray-700 text-white border border-gray-500'
                                                            : 'bg-black bg-opacity-40 text-gray-400 border border-gray-800 hover:bg-gray-800'
                                                    }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                            </div>
                                </div>

                                        <div className="rounded-md bg-black bg-opacity-30 p-3 border border-gray-800">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400">Seçilen aboneler:</span>
                                                <span className="text-sm font-semibold text-emerald-400">
                                                    {getFilteredSubscribers().length} kişi
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="rounded-md border border-gray-700 bg-transparent px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || getFilteredSubscribers().length === 0 || !selectedTemplateId}
                                        className="rounded-md bg-gradient-to-r from-emerald-700 to-emerald-900 px-4 py-2 text-sm text-white transition-colors hover:from-emerald-600 hover:to-emerald-800 disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Gönderiliyor...
                                            </span>
                                        ) : (
                                                'Mesajları Gönder'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 