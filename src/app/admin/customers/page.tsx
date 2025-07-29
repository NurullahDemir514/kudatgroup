"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ICustomer } from "@/models/Customer";
import CustomerForm, { CustomerFormData, FormAlert } from "@/components/customers/CustomerForm";
import CustomerList from "@/components/customers/CustomerList";

/**
 * Müşteriler Sayfası - SOLID Prensipleri ile uygulanmış
 * - Single Responsibility: Her bileşen tek bir sorumluluk alır
 * - Open/Closed: Bileşenler değişikliğe kapalı, genişletmeye açık
 * - Liskov Substitution: Alt bileşenler birbirleriyle tutarlı
 * - Interface Segregation: Bileşenlere sadece ihtiyaçları olan prop'lar geçilir
 * - Dependency Inversion: Bileşenler arası bağımlılık soyutlanmıştır
 * 
 * Açık tema tasarımı ile kullanıcı dostu arayüz oluşturulmuştur.
 */
export default function CustomersPage() {
    const router = useRouter();

    // Durum değişkenleri
    const [customers, setCustomers] = useState<ICustomer[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<ICustomer | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSubmitting, setFormSubmitting] = useState(false);

    // Müşterileri API'den getir
    useEffect(() => {
        fetchCustomers();
    }, []);

    // Müşterileri getirme işlevi
        const fetchCustomers = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/customers");
                const result = await response.json();

                if (result.success) {
                    setCustomers(result.data);
                } else {
                    setError(result.error || "Müşteriler yüklenirken bir hata oluştu");
                }
            } catch (err) {
                setError("Sunucu ile bağlantı kurulamadı");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

    // Yeni müşteri ekleme formunu göster
    const handleShowAddForm = () => {
        setEditingCustomer(null);
        setFormError(null);
        setShowForm(true);
    };

    // Düzenleme formunu göster
    const handleShowEditForm = (customer: ICustomer) => {
        setEditingCustomer(customer);
        setFormError(null);
        setShowForm(true);
    };

    // Formu kapat
    const handleCloseForm = () => {
        setShowForm(false);
        setEditingCustomer(null);
        setFormError(null);
    };

    // Formu gönder (ekle veya güncelle)
    const handleSubmitForm = async (formData: CustomerFormData) => {
        setFormError(null);
        setFormSubmitting(true);

        try {
            // Form validasyonu
            if (!formData.name || !formData.email || !formData.phone || !formData.address) {
                setFormError("Lütfen zorunlu alanları doldurun");
                setFormSubmitting(false);
                return;
            }

            const isEditing = editingCustomer !== null;
            const url = isEditing
                ? `/api/customers/${editingCustomer._id}`
                : "/api/customers";
            const method = isEditing ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                if (isEditing) {
                    // Müşteriyi güncelle
                    setCustomers((prev) =>
                        prev.map((c) =>
                            c._id === editingCustomer._id ? result.data : c
                        )
                    );
                } else {
                    // Yeni müşteri ekle
                    setCustomers((prev) => [...prev, result.data]);
                }
                handleCloseForm();
            } else {
                setFormError(result.error || "İşlem sırasında bir hata oluştu");
            }
        } catch (err) {
            setFormError("Sunucu ile bağlantı kurulamadı");
            console.error(err);
        } finally {
            setFormSubmitting(false);
        }
    };

    // Bir müşteriyi sil
    const handleDeleteCustomer = async (id: string) => {
        try {
            const response = await fetch(`/api/customers/${id}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (result.success) {
                // Müşteriyi UI'dan kaldır
                setCustomers((prev) => prev.filter((customer) => customer._id !== id));
            } else {
                alert(result.error || "Müşteri silinirken bir hata oluştu");
            }
        } catch (err) {
            alert("Sunucu ile bağlantı kurulamadı");
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Üst başlık ve ekle butonu */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        Müşteri Yönetimi
                    </h1>
                    <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">Müşteri bilgilerinizi takip edin ve yönetin</p>
                </div>

                <button
                    onClick={handleShowAddForm}
                    className="rounded-lg bg-blue-500 px-4 sm:px-5 py-2.5 sm:py-3 text-white text-sm sm:text-base transition-all hover:bg-blue-600 hover:shadow-lg border border-blue-500 shadow-md flex items-center justify-center"
                >
                    <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Yeni Müşteri Ekle</span>
                    </div>
                </button>
            </div>

            {/* Hata mesajı */}
            {error && (
                <FormAlert message={error} type="error" />
            )}

            {/* Yükleniyor göstergesi */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
                    <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-700">Müşteri verileri yükleniyor...</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">Bu işlem birkaç saniye sürebilir</p>
                </div>
            ) : (
                <>
                    {/* Müşteri ekleme/düzenleme formu */}
                    {showForm && (
                            <div className="fixed inset-0 z-10 overflow-hidden">
                                <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                                    <div className="fixed inset-0 bg-gray-100 bg-opacity-70 backdrop-blur-lg transition-opacity" onClick={handleCloseForm}></div>
                                    <div className="relative transform rounded-lg bg-white shadow-xl transition-all w-full max-w-2xl mx-auto h-auto my-8">
                                        <CustomerForm
                                            initialData={editingCustomer || undefined}
                                            formError={formError}
                                            formSubmitting={formSubmitting}
                                            onSubmit={handleSubmitForm}
                                            onCancel={handleCloseForm}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Müşteri listesi */}
                        <CustomerList
                            customers={customers}
                            onEdit={handleShowEditForm}
                            onDelete={handleDeleteCustomer}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                        />
                </>
            )}
        </div>
    );
} 