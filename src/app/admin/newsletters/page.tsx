"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaTimes } from "react-icons/fa";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface INewsletter {
    _id?: string;
    name: string;
    phone: string;
    email?: string;
    companyName?: string;
    addressCity: string;       // İl
    addressDistrict?: string;  // İlçe
    addressStreet?: string;    // Sokak/Cadde
    addressBuildingNo?: string; // Bina no
    taxNumber?: string;
    active: boolean;
    subscriptionDate: Date;
    notes?: string;
    companyAddress?: string;   // İşyeri adresi
    createdAt: Date;
    updatedAt: Date;
}

export default function NewslettersPage() {
    const [newsletters, setNewsletters] = useState<INewsletter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedNewsletter, setSelectedNewsletter] = useState<INewsletter | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        companyName: "",
        addressCity: "",
        addressDistrict: "",
        addressStreet: "",
        addressBuildingNo: "",
        taxNumber: "",
        active: true,
        notes: "",
        companyAddress: "",
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [actionStatus, setActionStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Sayfa yüklendiğinde verileri getir
    useEffect(() => {
        fetchNewsletters();
    }, []);

    // Aksiyon durumunu 3 saniye sonra temizle
    useEffect(() => {
        if (actionStatus) {
            const timer = setTimeout(() => {
                setActionStatus(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [actionStatus]);

    // Bülten verilerini getir
    const fetchNewsletters = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/newsletters");
            const data = await response.json();

            if (data.success) {
                console.log("Admin sayfasına getirilen veriler:", data.data[0]); // İlk veriyi kontrol et
                console.log("Bu veride companyAddress var mı?", data.data[0]?.companyAddress ? "Evet" : "Hayır");
                setNewsletters(data.data);
            } else {
                setError(data.error || "Bülten abonelikleri yüklenirken bir hata oluştu");
            }
        } catch (err) {
            setError("Sunucu ile bağlantı hatası");
            console.error("Bülten verileri yüklenirken hata:", err);
        } finally {
            setLoading(false);
        }
    };

    // Filtreleme
    const filteredNewsletters = newsletters.filter((newsletter) => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();

        return (
            (newsletter.name && newsletter.name.toLowerCase().includes(searchLower)) ||
            newsletter.email?.toLowerCase().includes(searchLower) ||
            (newsletter.companyName && newsletter.companyName.toLowerCase().includes(searchLower)) ||
            (newsletter.taxNumber && newsletter.taxNumber.toLowerCase().includes(searchLower))
        );
    });

    // Tarih formatı
    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        try {
            return format(new Date(dateString), "dd MMMM yyyy HH:mm", { locale: tr });
        } catch (error) {
            return dateString;
        }
    };

    // Abone detay modalını göster
    const handleShowDetails = (newsletter: INewsletter) => {
        setSelectedNewsletter(newsletter);
        setFormData({
            name: newsletter.name || "",
            phone: newsletter.phone || "",
            email: newsletter.email || "",
            companyName: newsletter.companyName || "",
            addressCity: newsletter.addressCity || "",
            addressDistrict: newsletter.addressDistrict || "",
            addressStreet: newsletter.addressStreet || "",
            addressBuildingNo: newsletter.addressBuildingNo || "",
            taxNumber: newsletter.taxNumber || "",
            active: newsletter.active,
            notes: newsletter.notes || "",
            companyAddress: newsletter.companyAddress || "",
        });
        setFormError(null);
        setShowModal(true);
    };

    // Modalı kapat
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedNewsletter(null);
        setFormError(null);
    };

    // Form girişlerini güncelle
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        });
    };

    // Formu gönder (güncelle)
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setFormSubmitting(true);

        try {
            // Form doğrulama
            if (!formData.email || !formData.name || !formData.addressCity) {
                setFormError("Ad Soyad, E-posta ve İl bilgisi alanları zorunludur");
                setFormSubmitting(false);
                return;
            }

            // Email formatı kontrolü
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                setFormError("Geçerli bir e-posta adresi giriniz");
                setFormSubmitting(false);
                return;
            }

            if (!selectedNewsletter?._id) {
                setFormError("Abone bilgisi bulunamadı");
                setFormSubmitting(false);
                return;
            }

            // API isteği
            const response = await fetch(`/api/newsletters/${selectedNewsletter._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                // UI'da güncelle
                setNewsletters(newsletters.map(n =>
                    n._id === selectedNewsletter._id ? { ...n, ...formData } : n
                ));
                setActionStatus({
                    message: "Abone bilgileri başarıyla güncellendi",
                    type: "success"
                });
                handleCloseModal();
            } else {
                setFormError(result.error || "Abone güncellenirken bir hata oluştu");
            }
        } catch (err) {
            setFormError("Sunucu ile bağlantı hatası");
            console.error("Abone güncelleme hatası:", err);
        } finally {
            setFormSubmitting(false);
        }
    };

    // Aboneyi sil
    const handleDeleteSubscriber = async (id: string) => {
        if (!window.confirm("Bu abone kaydını silmek istediğinize emin misiniz?")) {
            return;
        }

        try {
            const response = await fetch(`/api/newsletters/${id}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (result.success) {
                // UI'dan sil
                setNewsletters(prevNewsletters =>
                    prevNewsletters.filter(n => n._id !== id)
                );
                setActionStatus({
                    message: "Abone başarıyla silindi",
                    type: "success"
                });
            } else {
                setActionStatus({
                    message: result.error || "Abone silinirken bir hata oluştu",
                    type: "error"
                });
            }
        } catch (err) {
            setActionStatus({
                message: "Sunucu ile bağlantı hatası",
                type: "error"
            });
            console.error("Abone silme hatası:", err);
        }
    };

    // Aboneyi aktif/pasif yap
    const handleToggleStatus = async (newsletter: INewsletter) => {
        if (!newsletter._id) return;

        try {
            const newStatus = !newsletter.active;

            const response = await fetch(`/api/newsletters/${newsletter._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ active: newStatus }),
            });

            const result = await response.json();

            if (result.success) {
                // UI'da güncelle
                setNewsletters(newsletters.map(n =>
                    n._id === newsletter._id ? { ...n, active: newStatus } : n
                ));
                setActionStatus({
                    message: `Abone ${newStatus ? 'aktif' : 'pasif'} olarak güncellendi`,
                    type: "success"
                });
            } else {
                setActionStatus({
                    message: result.error || "Durum güncellenirken bir hata oluştu",
                    type: "error"
                });
            }
        } catch (err) {
            setActionStatus({
                message: "Sunucu ile bağlantı hatası",
                type: "error"
            });
            console.error("Durum güncelleme hatası:", err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Başlık ve Kontrol Bölümü */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-0">
                        E-Bülten Aboneleri
                    </h1>
                </div>

                {/* Özet Bilgi Kartları */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">Toplam Abone</h3>
                                <p className="text-lg font-bold text-gray-800">
                                    {newsletters.length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">Aktif Aboneler</h3>
                                <p className="text-lg font-bold text-emerald-600">
                                    {newsletters.filter(n => n.active).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100 mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">Pasif Aboneler</h3>
                                <p className="text-lg font-bold text-red-600">
                                    {newsletters.filter(n => !n.active).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">Son 30 Gün</h3>
                                <p className="text-lg font-bold text-amber-600">
                                    {newsletters.filter(n => {
                                        const thirtyDaysAgo = new Date();
                                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                                        return new Date(n.subscriptionDate) >= thirtyDaysAgo;
                                    }).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Arama ve Filtreleme */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Abonelerde ara... (ad, email, şirket vb.)"
                            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <select
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 w-full sm:w-48 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onChange={(e) => {
                            if (e.target.value === "active") {
                                setNewsletters(newsletters.filter(n => n.active));
                            } else if (e.target.value === "inactive") {
                                setNewsletters(newsletters.filter(n => !n.active));
                            } else {
                                fetchNewsletters();
                            }
                        }}
                    >
                        <option value="all">Tüm Aboneler</option>
                        <option value="active">Aktif Aboneler</option>
                        <option value="inactive">Pasif Aboneler</option>
                    </select>
                </div>
            </div>

            {/* İşlem durumu mesajı */}
            {actionStatus && (
                <div className={`rounded-xl p-4 text-sm transition-all duration-300 transform scale-100 ${actionStatus.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                    }`}>
                    <div className="flex items-center">
                        {actionStatus.type === "success" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        {actionStatus.message}
                    </div>
                </div>
            )}

            {/* Hata mesajı */}
            {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-800 border border-red-200 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>{error}</p>
                </div>
            )}

            {/* Yükleniyor göstergesi */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
                    <p className="mt-4 text-sm text-gray-500">Aboneler yükleniyor...</p>
                </div>
            ) : (
                <>
                    {/* Abonelikleri göster */}
                        {filteredNewsletters.length === 0 ? (
                            <div className="rounded-xl bg-white p-8 text-center border border-gray-200 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <h3 className="mt-4 text-lg font-medium text-gray-700">Henüz kayıtlı bülten aboneliği bulunmuyor</h3>
                                <p className="mt-2 text-sm text-gray-500">Yeni aboneler ekleyerek e-bülten göndermeye başlayabilirsiniz.</p>
                            </div>
                        ) : (
                            <>
                                {/* Mobil Kart Görünümü */}
                                <div className="md:hidden space-y-3">
                                    {filteredNewsletters.map((newsletter) => (
                                        <div key={newsletter._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                            <div className="p-3 flex justify-between items-center border-b border-gray-100">
                                                <div className="flex items-center">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm mr-3 ${newsletter.name?.charAt(0).toLowerCase() === 'f' ? 'bg-purple-500' :
                                                        newsletter.name?.charAt(0).toLowerCase() === 's' ? 'bg-blue-500' :
                                                            newsletter.name?.charAt(0).toLowerCase() === 'n' ? 'bg-indigo-500' :
                                                                'bg-gradient-to-r from-blue-500 to-blue-600'
                                                        }`}>
                                                        {newsletter.name?.charAt(0).toUpperCase() || "?"}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-800">{newsletter.name || "-"}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {newsletter.email || "-"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${newsletter.active
                                                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                        : "bg-red-100 text-red-800 border border-red-200"
                                                        }`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${newsletter.active ? "bg-emerald-400" : "bg-red-400"} mr-1`}></span>
                                                        {newsletter.active ? "Aktif" : "Pasif"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
                                                {newsletter.phone && (
                                                    <a href={`tel:${newsletter.phone}`} className="p-2 flex items-center text-xs text-gray-600 hover:bg-gray-50">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                        </svg>
                                                        {newsletter.phone}
                                                    </a>
                                                )}
                                                {newsletter.addressCity && (
                                                    <div className="p-2 flex items-center text-xs text-gray-600">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {newsletter.addressCity}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 flex justify-between">
                                                <button
                                                    onClick={() => handleToggleStatus(newsletter)}
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    {newsletter.active ? "Pasif Yap" : "Aktif Yap"}
                                                </button>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleShowDetails(newsletter)}
                                                        className="p-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSubscriber(newsletter._id as string)}
                                                        className="p-1 rounded bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    </div>

                                    {/* Masaüstü Tablo Görünümü */}
                                    <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                            Ad Soyad
                                                        </th>
                                                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hidden sm:table-cell">
                                                            Telefon
                                                        </th>
                                                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                            E-posta
                                                        </th>
                                                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hidden md:table-cell">
                                                            Şirket Bilgileri
                                                        </th>
                                                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hidden md:table-cell">
                                                            Adres Bilgileri
                                                        </th>
                                                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hidden lg:table-cell">
                                                            Kayıt Tarihi
                                                        </th>
                                                        <th scope="col" className="px-3 sm:px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                                            Durum
                                                        </th>
                                                        <th scope="col" className="px-3 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                                            İşlemler
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {filteredNewsletters.map((newsletter, index) => (
                                                        <tr key={newsletter._id} className={`${index % 2 === 0 ? 'bg-gray-50' : ''} hover:bg-gray-100 transition-colors group`}>
                                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                                <div className="flex items-center">
                                                                    <div className={`h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center text-white text-xs mr-3 ${newsletter.name?.charAt(0).toLowerCase() === 'f' ? 'bg-purple-500' :
                                                                        newsletter.name?.charAt(0).toLowerCase() === 's' ? 'bg-blue-500' :
                                                                            newsletter.name?.charAt(0).toLowerCase() === 'n' ? 'bg-indigo-500' :
                                                                                'bg-gradient-to-r from-blue-500 to-blue-600'
                                                                        }`}>
                                                                        {newsletter.name?.charAt(0).toUpperCase() || "?"}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-medium text-gray-800">{newsletter.name || "-"}</div>
                                                                        <div className="text-xs text-gray-500 mt-1 sm:hidden">
                                                                            {newsletter.email || "-"}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                                                                <div className="text-sm text-gray-800">
                                                                    {newsletter.phone ? (
                                                                        <a
                                                                            href={`tel:${newsletter.phone}`}
                                                                            className="hover:text-gray-900 hover:underline flex items-center"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                            </svg>
                                                                            {newsletter.phone}
                                                                        </a>
                                                                    ) : (
                                                                        <span className="text-gray-500 italic">Belirtilmemiş</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                                                                <div className="text-sm text-gray-800">
                                                                    {newsletter.email ? (
                                                                        <a
                                                                            href={`mailto:${newsletter.email}`}
                                                                            className="hover:text-gray-900 hover:underline flex items-center"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                            </svg>
                                                                            {newsletter.email}
                                                                        </a>
                                                                    ) : (
                                                                        <span className="text-gray-500 italic">Belirtilmemiş</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                                                                <div className="text-sm text-gray-800">
                                                                    {newsletter.companyName ? (
                                                                        <div>
                                                                            <div className="font-medium">{newsletter.companyName}</div>
                                                                            {newsletter.taxNumber && (
                                                                                <div className="text-xs text-gray-500 mt-1">
                                                                                    <span className="text-gray-500">Vergi No:</span> {newsletter.taxNumber}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-500 italic">Belirtilmemiş</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                                                                <div className="text-sm text-gray-800">
                                                                    {newsletter.addressCity ? (
                                                                        <div>
                                                                            <div className="font-medium">{newsletter.addressCity}</div>
                                                                            <div className="text-xs text-gray-500 mt-1">
                                                                                {newsletter.addressDistrict && newsletter.addressDistrict}
                                                                                {newsletter.addressStreet && (newsletter.addressDistrict ? `, ${newsletter.addressStreet}` : newsletter.addressStreet)}
                                                                                {newsletter.addressBuildingNo && ` No: ${newsletter.addressBuildingNo}`}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-500 italic">Belirtilmemiş</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                                                                <div className="text-sm text-gray-800">
                                                                    {newsletter.subscriptionDate ? (
                                                                        <div>
                                                                            <div className="flex items-center">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                                </svg>
                                                                                {formatDate(newsletter.subscriptionDate instanceof Date ? newsletter.subscriptionDate.toISOString() : newsletter.subscriptionDate)}
                                                                            </div>
                                                                            {newsletter.createdAt && (
                                                                                <div className="text-xs text-gray-500 mt-1">
                                                                                    <span className="text-gray-500">Güncellenme:</span> {formatDate(newsletter.updatedAt instanceof Date ? newsletter.updatedAt.toISOString() : newsletter.updatedAt)}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-500 italic">Belirtilmemiş</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                                                                <button
                                                                    onClick={() => handleToggleStatus(newsletter)}
                                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${newsletter.active
                                                                        ? "bg-emerald-100 text-emerald-500 border border-emerald-200 hover:bg-emerald-200"
                                                                        : "bg-red-100 text-red-500 border border-red-200 hover:bg-red-200"
                                                                        }`}
                                                                >
                                                                    <span className={`h-1.5 w-1.5 rounded-full ${newsletter.active ? "bg-emerald-400" : "bg-red-400"} mr-1.5`}></span>
                                                                    {newsletter.active ? "Aktif" : "Pasif"}
                                                                </button>
                                                            </td>
                                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-sm whitespace-nowrap">
                                                                <div className="flex flex-row justify-end space-x-2 opacity-70 group-hover:opacity-100">
                                                                    <button
                                                                        onClick={() => handleShowDetails(newsletter)}
                                                                        className="p-1.5 rounded bg-gray-200 text-gray-500 hover:bg-gray-300 transition-colors"
                                                                        title="Detayları Göster"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteSubscriber(newsletter._id as string)}
                                                                        className="p-1.5 rounded bg-red-100 text-red-500 border border-red-200 hover:bg-red-200 transition-colors"
                                                                        title="Aboneyi Sil"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Bilgi footer */}
                                        <div className="border-t border-gray-200 bg-gray-50 p-3 flex items-center justify-between">
                                            <div className="text-xs text-gray-500">
                                                Toplam <span className="font-medium text-gray-800">{filteredNewsletters.length}</span> abone gösteriliyor
                                                {searchTerm && <span className="ml-1">(<span className="text-gray-800">"{searchTerm}"</span> için filtrelendi)</span>}
                                            </div>
                                            <div className="flex items-center">
                                                {searchTerm && (
                                                    <button
                                                        onClick={() => setSearchTerm("")}
                                                        className="text-xs text-gray-500 hover:text-gray-800 hover:underline flex items-center"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Filtreyi Temizle
                                                    </button>
                                                )}
                                            </div>
                                </div>
                            </div>
                                </>
                        )}
                </>
            )}

            {/* Abone Düzenleme Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto p-4 lg:p-6">
                    <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-md transition-opacity duration-300" onClick={handleCloseModal}></div>
                    <div className="relative mx-auto w-full max-w-3xl max-h-[85vh] overflow-y-auto transform rounded-xl bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 scale-100 opacity-100 border border-gray-100">
                        <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-3">
                            <h2 className="text-base font-bold text-gray-800">
                                Abone Detayları
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 border border-red-200">
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {formError}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmitForm} className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                                        Ad Soyad <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Ad Soyad"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                                        E-posta <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="E-posta adresi"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">
                                        Telefon
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Telefon numarası"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-0">
                                <div>
                                    <label htmlFor="companyName" className="block text-xs font-medium text-gray-700 mb-1">
                                        Firma Adı
                                    </label>
                                    <input
                                        type="text"
                                        id="companyName"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Firma adı"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="taxNumber" className="block text-xs font-medium text-gray-700 mb-1">
                                        Vergi Numarası
                                    </label>
                                    <input
                                        type="text"
                                        id="taxNumber"
                                        name="taxNumber"
                                        value={formData.taxNumber}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Vergi numarası"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-200 my-2 pt-2">
                                <h3 className="text-xs font-medium text-gray-700 mb-2">Adres Bilgileri</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label htmlFor="addressCity" className="block text-xs font-medium text-gray-700 mb-1">
                                            İl <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="addressCity"
                                            name="addressCity"
                                            value={formData.addressCity}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="İl"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="addressDistrict" className="block text-xs font-medium text-gray-700 mb-1">
                                            İlçe
                                        </label>
                                        <input
                                            type="text"
                                            id="addressDistrict"
                                            name="addressDistrict"
                                            value={formData.addressDistrict}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="İlçe"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="addressStreet" className="block text-xs font-medium text-gray-700 mb-1">
                                            Sokak/Cadde
                                        </label>
                                        <input
                                            type="text"
                                            id="addressStreet"
                                            name="addressStreet"
                                            value={formData.addressStreet}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="Sokak veya cadde"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="addressBuildingNo" className="block text-xs font-medium text-gray-700 mb-1">
                                            Bina No
                                        </label>
                                        <input
                                            type="text"
                                            id="addressBuildingNo"
                                            name="addressBuildingNo"
                                            value={formData.addressBuildingNo}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="Bina numarası"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="companyAddress" className="block text-xs font-medium text-gray-700 mb-1">
                                            İşyeri Adresi <span className="text-red-600">*</span>
                                        </label>
                                        <textarea
                                            id="companyAddress"
                                            name="companyAddress"
                                            value={formData.companyAddress}
                                            onChange={handleInputChange}
                                            placeholder="İşyeri adresi"
                                            rows={1}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="notes" className="block text-xs font-medium text-gray-700 mb-1">
                                    Notlar
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Abone hakkında ekstra bilgiler"
                                    rows={1}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                ></textarea>
                            </div>

                            <div className="mb-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="active-new"
                                        name="active"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label
                                        htmlFor="active-new"
                                        className="ml-2 block text-xs text-gray-700"
                                    >
                                        Bu abone aktif olarak e-bülten almaya devam etsin
                                    </label>
                                </div>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                                <h3 className="mb-2 text-xs font-medium text-gray-700">
                                    Sistem Bilgileri
                                </h3>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-2">
                                        <span className="font-medium text-gray-700">Abonelik Tarihi:</span>
                                        <div className="mt-0.5 text-gray-600 text-xs">
                                            {selectedNewsletter?.subscriptionDate
                                                ? formatDate(selectedNewsletter?.subscriptionDate instanceof Date ? selectedNewsletter?.subscriptionDate.toISOString() : selectedNewsletter?.subscriptionDate)
                                                : "-"}
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-2">
                                        <span className="font-medium text-gray-700">Oluşturulma Tarihi:</span>
                                        <div className="mt-0.5 text-gray-600 text-xs">
                                            {selectedNewsletter?.createdAt
                                                ? formatDate(selectedNewsletter?.createdAt instanceof Date ? selectedNewsletter?.createdAt.toISOString() : selectedNewsletter?.createdAt)
                                                : "-"}
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-2">
                                        <span className="font-medium text-gray-700">Son Güncelleme:</span>
                                        <div className="mt-0.5 text-gray-600 text-xs">
                                            {selectedNewsletter?.updatedAt
                                                ? formatDate(selectedNewsletter?.updatedAt instanceof Date ? selectedNewsletter?.updatedAt.toISOString() : selectedNewsletter?.updatedAt)
                                                : "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row justify-between pt-3 border-t border-gray-200 gap-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    type="submit"
                                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                    disabled={formSubmitting}
                                >
                                    {formSubmitting ? (
                                        <>
                                            <FaSpinner className="mr-1.5 h-3 w-3 animate-spin" />
                                            Kaydediliyor...
                                        </>
                                    ) : (
                                        <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Değişiklikleri Kaydet
                                            </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 
