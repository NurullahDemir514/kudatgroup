"use client";

import { useState, useEffect } from "react";

interface INewsletter {
    _id?: string;
    name: string;
    phone: string;
    email?: string;
    companyName?: string;
    taxNumber?: string;
    active: boolean;
    subscriptionDate: Date;
    notes?: string;
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
        taxNumber: "",
        active: true,
        notes: "",
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [actionStatus, setActionStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

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
    const formatDate = (dateString: string | Date) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Abone detay modalını göster
    const handleShowDetails = (newsletter: INewsletter) => {
        setSelectedNewsletter(newsletter);
        setFormData({
            name: newsletter.name || "",
            phone: newsletter.phone || "",
            email: newsletter.email || "",
            companyName: newsletter.companyName || "",
            taxNumber: newsletter.taxNumber || "",
            active: newsletter.active,
            notes: newsletter.notes || "",
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
            if (!formData.email || !formData.name) {
                setFormError("Ad Soyad ve E-posta alanları zorunludur");
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
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-400">
                    Bülten Abonelikleri
                </h1>
            </div>

            {/* Arama alanı */}
            <div className="relative flex-1">
                <input
                    type="text"
                    placeholder="Abone ara... (Ad, email, şirket adı veya vergi no)"
                    className="w-full rounded-md border border-gray-600 bg-black bg-opacity-50 px-4 py-2 pl-10 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver placeholder-gray-400"
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

            {/* İşlem durumu mesajı */}
            {actionStatus && (
                <div className={`rounded-md p-4 text-sm ${actionStatus.type === "success"
                    ? "bg-emerald-900 bg-opacity-20 text-emerald-200 border border-emerald-800"
                    : "bg-red-900 bg-opacity-20 text-red-200 border border-red-800"
                    }`}>
                    {actionStatus.message}
                </div>
            )}

            {/* Hata mesajı */}
            {error && (
                <div className="rounded-md bg-red-900 bg-opacity-20 p-4 text-sm text-red-200 border border-red-800">
                    {error}
                </div>
            )}

            {/* Yükleniyor göstergesi */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-silver"></div>
                </div>
            ) : (
                <>
                    {/* Abonelikleri göster */}
                    {newsletters.length === 0 ? (
                        <div className="rounded-md bg-black bg-opacity-50 p-4 text-sm text-silver border border-gray-800">
                            Henüz kayıtlı bülten aboneliği bulunmuyor.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-gray-800 bg-black bg-opacity-40 shadow-xl">
                            <table className="min-w-full divide-y divide-gray-800">
                                <thead className="bg-gradient-to-r from-zinc-900 to-black">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-silver">
                                            Ad Soyad
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-silver">
                                            Telefon
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-silver">
                                            E-posta
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-silver">
                                            Şirket Bilgileri
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-silver">
                                            Kayıt Tarihi
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-silver">
                                            Durum
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-silver">
                                            İşlemler
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800 bg-black bg-opacity-60">
                                    {filteredNewsletters.map((newsletter) => (
                                        <tr key={newsletter._id} className="hover:bg-zinc-900 hover:bg-opacity-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-silver">{newsletter.name || "-"}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-300">
                                                    <a
                                                        href={`tel:${newsletter.phone}`}
                                                        className="hover:text-white hover:underline"
                                                    >
                                                        {newsletter.phone || "-"}
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-300">
                                                    {newsletter.email ? (
                                                        <a
                                                            href={`mailto:${newsletter.email}`}
                                                            className="hover:text-white hover:underline"
                                                        >
                                                            {newsletter.email}
                                                        </a>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-300">
                                                    {newsletter.companyName ? (
                                                        <div>
                                                            <div className="font-medium">{newsletter.companyName}</div>
                                                            {newsletter.taxNumber && (
                                                                <div className="text-xs text-gray-400 mt-1">
                                                                    Vergi No: {newsletter.taxNumber}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-300">
                                                    {newsletter.subscriptionDate ? (
                                                        <div>
                                                            <div>{formatDate(newsletter.subscriptionDate)}</div>
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                {newsletter.createdAt &&
                                                                    `Güncellenme: ${formatDate(newsletter.updatedAt || newsletter.createdAt)}`
                                                                }
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div
                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${newsletter.active
                                                        ? "bg-emerald-900 bg-opacity-30 text-emerald-300 border border-emerald-800"
                                                        : "bg-red-900 bg-opacity-30 text-red-300 border border-red-800"
                                                        }`}
                                                >
                                                    <span className={`h-2 w-2 rounded-full ${newsletter.active ? "bg-emerald-400" : "bg-red-400"
                                                        } mr-1.5`}></span>
                                                    {newsletter.active ? "Aktif" : "Pasif"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                <button
                                                    onClick={() => handleToggleStatus(newsletter)}
                                                    className={`mr-3 ${newsletter.active
                                                        ? "text-red-400 hover:text-red-300"
                                                        : "text-emerald-400 hover:text-emerald-300"
                                                        } transition-colors`}
                                                    title={newsletter.active ? "Pasif Yap" : "Aktif Yap"}
                                                >
                                                    {newsletter.active ? "Pasif Yap" : "Aktif Yap"}
                                                </button>
                                                <button
                                                    onClick={() => handleShowDetails(newsletter)}
                                                    className="mr-3 text-gray-400 hover:text-white transition-colors"
                                                    title="Detayları Göster"
                                                >
                                                    Detaylar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSubscriber(newsletter._id as string)}
                                                    className="text-gray-400 hover:text-red-300 transition-colors"
                                                    title="Aboneyi Sil"
                                                >
                                                    Sil
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="text-sm text-gray-400 mt-4">
                        Toplam {filteredNewsletters.length} abone gösteriliyor
                        {searchTerm && ` (filtrelendi: ${searchTerm})`}
                    </div>
                </>
            )}

            {/* Abone detay modali */}
            {showModal && selectedNewsletter && (
                <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-80">
                    <div className="w-full max-w-md rounded-lg border border-silver/30 bg-gradient-to-b from-zinc-900 to-black p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-silver">
                                Abone Detayları
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="rounded-full p-1 text-silver hover:bg-zinc-800 hover:text-white"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 rounded-md bg-red-900 bg-opacity-20 p-3 text-sm text-red-200 border border-red-800">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleSubmitForm}>
                            <div className="mb-4">
                                <label htmlFor="name" className="mb-1 block text-sm font-medium text-silver">
                                    Ad Soyad
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-700 bg-black bg-opacity-60 px-3 py-2 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="phone" className="mb-1 block text-sm font-medium text-silver">
                                    Telefon
                                </label>
                                <input
                                    type="text"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-700 bg-black bg-opacity-60 px-3 py-2 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="email" className="mb-1 block text-sm font-medium text-silver">
                                    E-posta
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-700 bg-black bg-opacity-60 px-3 py-2 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="companyName" className="mb-1 block text-sm font-medium text-silver">
                                    Şirket Adı
                                </label>
                                <input
                                    type="text"
                                    id="companyName"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-700 bg-black bg-opacity-60 px-3 py-2 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="taxNumber" className="mb-1 block text-sm font-medium text-silver">
                                    Vergi Numarası
                                </label>
                                <input
                                    type="text"
                                    id="taxNumber"
                                    name="taxNumber"
                                    value={formData.taxNumber}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-700 bg-black bg-opacity-60 px-3 py-2 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="notes" className="mb-1 block text-sm font-medium text-silver">
                                    Notlar
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full rounded-md border border-gray-700 bg-black bg-opacity-60 px-3 py-2 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver"
                                ></textarea>
                            </div>

                            <div className="mb-4 flex items-center">
                                <input
                                    type="checkbox"
                                    id="active"
                                    name="active"
                                    checked={formData.active}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 rounded border-gray-700 bg-black text-silver focus:ring-silver"
                                />
                                <label htmlFor="active" className="ml-2 block text-sm text-silver">
                                    Aktif
                                </label>
                            </div>

                            <div className="mb-4 p-3 bg-zinc-900 bg-opacity-60 rounded-md text-sm text-gray-400 border border-gray-800">
                                <div className="mb-1 font-medium text-silver">Sistem Bilgileri:</div>
                                <div>Abone Tarihi: {selectedNewsletter.subscriptionDate ? formatDate(selectedNewsletter.subscriptionDate) : "-"}</div>
                                <div>Oluşturulma: {selectedNewsletter.createdAt ? formatDate(selectedNewsletter.createdAt) : "-"}</div>
                                <div>Son Güncelleme: {selectedNewsletter.updatedAt ? formatDate(selectedNewsletter.updatedAt) : "-"}</div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="rounded-md border border-gray-700 bg-transparent px-4 py-2 text-silver transition-colors hover:bg-zinc-900"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={formSubmitting}
                                    className="rounded-md bg-gradient-to-r from-zinc-800 to-gray-900 px-4 py-2 text-silver transition-all hover:from-zinc-700 hover:to-gray-800 border border-silver/30 disabled:opacity-70"
                                >
                                    {formSubmitting ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-t-2 border-silver"></div>
                                            <span>İşleniyor...</span>
                                        </div>
                                    ) : (
                                        "Güncelle"
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
