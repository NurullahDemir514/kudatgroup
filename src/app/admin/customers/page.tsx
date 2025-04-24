"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ICustomer } from "@/models/Customer";

// FormData tipini güncelliyorum
type FormData = {
    name: string;
    email: string;
    phone: string;
    address: string;
    companyName?: string;
    taxNumber?: string;
};

// Form için Bildirim Bileşeni - daha estetik ve kullanıcı dostu hata bildirimi
const FormAlert = ({ message, type = "error" }: { message: string; type?: "error" | "success" | "warning" }) => {
    const bgColor = type === "error" ? "bg-red-950" : type === "success" ? "bg-green-950" : "bg-yellow-950";
    const textColor = type === "error" ? "text-red-300" : type === "success" ? "text-green-300" : "text-yellow-300";
    const borderColor = type === "error" ? "border-red-800" : type === "success" ? "border-green-800" : "border-yellow-800";
    const iconColor = type === "error" ? "text-red-400" : type === "success" ? "text-green-400" : "text-yellow-400";

    return (
        <div className={`rounded-md ${bgColor} border ${borderColor} p-4 mb-6`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    {type === "error" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    )}
                    {type === "success" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    )}
                    {type === "warning" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
                <div className="ml-3">
                    <p className={`text-sm ${textColor}`}>{message}</p>
                </div>
            </div>
        </div>
    );
};

export default function CustomersPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<ICustomer[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<ICustomer | null>(null);
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        phone: "",
        address: "",
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [formSubmitting, setFormSubmitting] = useState(false);

    // Müşterileri API'den getir
    useEffect(() => {
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

        fetchCustomers();
    }, []);

    // HandleInputChange fonksiyonunu güncelliyorum
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Yeni müşteri ekleme formunu göster
    const handleShowAddForm = () => {
        setFormData({
            name: "",
            email: "",
            phone: "",
            address: "",
            companyName: "",
            taxNumber: ""
        });
        setEditingCustomer(null);
        setFormError(null);
        setShowForm(true);
    };

    // Düzenleme formunu göster
    const handleShowEditForm = (customer: ICustomer) => {
        setFormData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            companyName: customer.companyName || "",
            taxNumber: customer.taxNumber || ""
        });
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
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setFormSubmitting(true);

        try {
            // Form validasyonu
            if (!formData.name || !formData.email || !formData.phone || !formData.address) {
                setFormError("Tüm alanları doldurun");
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
        if (!window.confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) {
            return;
        }

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

    // Arama filtreleme
    const filteredCustomers = searchTerm
        ? customers.filter(
            (customer) =>
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.phone.includes(searchTerm) ||
                customer.address.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : customers;

    return (
        <div className="space-y-6">
            {/* Üst başlık ve ekle butonu */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-400">
                        Müşteri Yönetimi
                    </h1>
                    <p className="text-gray-400 mt-2">Müşteri bilgilerinizi takip edin ve yönetin</p>
                </div>

                <button
                    onClick={handleShowAddForm}
                    className="rounded-lg bg-gradient-to-r from-gray-700 to-gray-900 px-5 py-3 text-silver transition-all hover:from-gray-600 hover:to-gray-800 hover:shadow-lg border border-gray-600 shadow-md flex items-center justify-center"
                >
                    <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Yeni Müşteri Ekle</span>
                    </div>
                </button>
            </div>

            {/* İstatistikler ve Arama */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-black bg-opacity-40 rounded-lg border border-gray-800 p-4 flex items-center space-x-4 shadow-md">
                    <div className="p-3 rounded-md bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-silver" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-gray-400 text-sm">Toplam Müşteri</div>
                        <div className="text-2xl font-bold text-silver">{customers.length}</div>
                    </div>
                </div>

                <div className="md:col-span-3 relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <input
                        type="text"
                        placeholder="İsim, email, telefon veya adres ile müşteri arayın..."
                        className="w-full h-full rounded-lg border border-gray-700 bg-black bg-opacity-60 pl-12 px-4 py-4 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver placeholder-gray-500 transition-all shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-silver"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Hata mesajı */}
            {error && (
                <FormAlert message={error} type="error" />
            )}

            {/* Yükleniyor göstergesi */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-silver"></div>
                    <p className="mt-6 text-lg text-silver">Müşteri verileri yükleniyor...</p>
                    <p className="text-gray-400 mt-2">Bu işlem birkaç saniye sürebilir</p>
                </div>
            ) : (
                <>
                    {/* Müşteri ekleme/düzenleme formu */}
                    {showForm && (
                        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
                            <div className="w-full max-w-2xl rounded-lg border border-silver/30 bg-gradient-to-b from-zinc-900 to-black p-8 shadow-xl">
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-400">
                                        {editingCustomer ? "Müşteri Bilgilerini Düzenle" : "Yeni Müşteri Ekle"}
                                    </h2>
                                    <button
                                        onClick={handleCloseForm}
                                        className="rounded-full p-1.5 text-silver hover:bg-zinc-800 hover:text-white transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="bg-gradient-to-b from-black to-zinc-900 border border-gray-800 rounded-lg p-6 mb-6">
                                    {formError && (
                                        <div className="mb-6 rounded-md bg-red-900 bg-opacity-20 p-4 text-sm text-red-200 border border-red-800 flex items-start">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{formError}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmitForm}>
                                        <div className="bg-gradient-to-b from-black to-zinc-900 border border-gray-800 rounded-lg p-6 mb-6">
                                            <h3 className="text-lg font-medium text-silver mb-4 border-b border-gray-800 pb-2 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Temel Bilgiler
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label htmlFor="name" className="mb-1 block text-sm font-medium text-silver">
                                                        Müşteri Adı <span className="text-red-400">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            id="name"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                            className={`w-full rounded-md border ${!formData.name && formError ? 'border-red-600 ring-1 ring-red-600' : 'border-gray-700'} bg-black bg-opacity-60 pl-10 px-3 py-2.5 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver transition-colors`}
                                                            placeholder="Müşterinin tam adı"
                                                        />
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-400">Kişi ya da şirket adı giriniz</p>
                                                </div>

                                                <div>
                                                    <label htmlFor="companyName" className="mb-1 block text-sm font-medium text-silver">
                                                        Şirket Adı <span className="text-gray-400">(Opsiyonel)</span>
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            id="companyName"
                                                            name="companyName"
                                                            value={formData.companyName || ''}
                                                            onChange={handleInputChange}
                                                            className="w-full rounded-md border border-gray-700 bg-black bg-opacity-60 pl-10 px-3 py-2.5 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver transition-colors"
                                                            placeholder="Şirket adı (varsa)"
                                                        />
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-400">Kurumsal müşteriler için şirket adı</p>
                                                </div>

                                                <div>
                                                    <label htmlFor="taxNumber" className="mb-1 block text-sm font-medium text-silver">
                                                        Vergi Numarası <span className="text-gray-400">(Opsiyonel)</span>
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            id="taxNumber"
                                                            name="taxNumber"
                                                            value={formData.taxNumber || ''}
                                                            onChange={handleInputChange}
                                                            className="w-full rounded-md border border-gray-700 bg-black bg-opacity-60 pl-10 px-3 py-2.5 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver transition-colors"
                                                            placeholder="Vergi numarası (varsa)"
                                                        />
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-400">Fatura için vergi/TC kimlik numarası</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-b from-black to-zinc-900 border border-gray-800 rounded-lg p-6 mb-6">
                                            <h3 className="text-lg font-medium text-silver mb-4 border-b border-gray-800 pb-2 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                </svg>
                                                İletişim Bilgileri
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-silver">
                                                        E-posta <span className="text-gray-400">(Opsiyonel)</span>
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <input
                                                            type="email"
                                                            id="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            className="w-full rounded-md border border-gray-700 bg-black bg-opacity-60 pl-10 px-3 py-2.5 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver transition-colors"
                                                            placeholder="ornek@firma.com"
                                                        />
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-400">İletişim için geçerli e-posta adresi</p>
                                                </div>

                                                <div>
                                                    <label htmlFor="phone" className="mb-1 block text-sm font-medium text-silver">
                                                        Telefon <span className="text-red-400">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                            </svg>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            id="phone"
                                                            name="phone"
                                                            value={formData.phone}
                                                            onChange={handleInputChange}
                                                            className={`w-full rounded-md border ${!formData.phone && formError ? 'border-red-600 ring-1 ring-red-600' : 'border-gray-700'} bg-black bg-opacity-60 pl-10 px-3 py-2.5 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver transition-colors`}
                                                            placeholder="5XX XXX XX XX"
                                                        />
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-400">10 haneli cep telefonu numarası</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-b from-black to-zinc-900 border border-gray-800 rounded-lg p-6 mb-6">
                                            <h3 className="text-lg font-medium text-silver mb-4 border-b border-gray-800 pb-2 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Adres Bilgileri
                                            </h3>

                                            <div>
                                                <label htmlFor="address" className="mb-1 block text-sm font-medium text-silver">
                                                    Adres <span className="text-red-400">*</span>
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    </div>
                                                    <textarea
                                                        id="address"
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleInputChange}
                                                        rows={3}
                                                        className={`w-full rounded-md border ${!formData.address && formError ? 'border-red-600 ring-1 ring-red-600' : 'border-gray-700'} bg-black bg-opacity-60 pl-10 px-3 py-2.5 text-silver focus:border-silver focus:outline-none focus:ring-1 focus:ring-silver transition-colors`}
                                                        placeholder="Müşterinin tam adresi"
                                                    ></textarea>
                                                </div>
                                                <p className="mt-1 text-xs text-gray-400">Teslimat ve fatura için açık adres bilgisi</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-gradient-to-r from-zinc-900 to-black p-4 rounded-lg border border-gray-800">
                                            <div className="text-xs text-gray-400">
                                                <span className="text-red-400 mr-1">*</span>
                                                <span className="italic">işaretli alanlar zorunludur</span>
                                            </div>
                                            <div className="flex justify-end space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={handleCloseForm}
                                                    className="rounded-md border border-gray-700 bg-black bg-opacity-60 px-5 py-2.5 text-sm font-medium text-silver transition-colors hover:bg-zinc-900"
                                                    disabled={formSubmitting}
                                                >
                                                    <span className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        İptal
                                                    </span>
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={formSubmitting}
                                                    className="rounded-md bg-gradient-to-r from-zinc-800 to-gray-900 px-5 py-2.5 text-sm font-medium text-silver transition-all hover:from-zinc-700 hover:to-gray-800 border border-silver/30 shadow-xl disabled:opacity-70"
                                                >
                                                    {formSubmitting ? (
                                                        <div className="flex items-center space-x-2">
                                                            <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-r-2 border-silver"></div>
                                                            <span>{editingCustomer ? "Güncelleniyor..." : "Ekleniyor..."}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            {editingCustomer ? "Müşteriyi Güncelle" : "Müşteriyi Ekle"}
                                                        </span>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Müşteri tablosu */}
                    {customers.length === 0 ? (
                        <div className="rounded-md bg-gradient-to-b from-zinc-900 to-black p-12 text-center text-gray-300 border border-gray-800 shadow-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-xl font-semibold mb-3">Henüz kayıtlı müşteri bulunmuyor</p>
                            <p className="text-gray-400 mb-6">Müşteri ekleyerek satışlarınızı takip etmeye başlayabilirsiniz</p>
                            <button
                                onClick={handleShowAddForm}
                                className="mt-2 rounded-md bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-3 text-silver hover:from-gray-600 hover:to-gray-800 transition-all inline-flex items-center space-x-2 border border-gray-700 shadow-lg"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>İlk Müşteriyi Ekle</span>
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-gray-800 bg-black bg-opacity-40 shadow-xl backdrop-blur-sm">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-800">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-zinc-900 to-black">
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-silver">
                                                Müşteri Bilgileri
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-silver">
                                                İletişim
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-silver">
                                                Adres
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-silver">
                                                Kayıt Tarihi
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-silver">
                                                İşlemler
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800 bg-black bg-opacity-60">
                                        {filteredCustomers.map((customer, index) => (
                                            <tr key={customer._id} className={`${index % 2 === 0 ? 'bg-gray-900 bg-opacity-30' : ''} hover:bg-zinc-800 hover:bg-opacity-50 transition-colors`}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center text-white font-medium">
                                                            {customer.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-silver">{customer.name}</div>
                                                            {customer.companyName && (
                                                                <div className="text-xs text-gray-400 mt-1">
                                                                    {customer.companyName}
                                                                    {customer.taxNumber && <span className="ml-1">({customer.taxNumber})</span>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-300 space-y-1">
                                                        <div className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            <a href={`mailto:${customer.email}`} className="hover:text-white hover:underline transition-colors">
                                                                {customer.email}
                                                            </a>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                            </svg>
                                                            <a href={`tel:${customer.phone}`} className="hover:text-white hover:underline transition-colors">
                                                                {customer.phone}
                                                            </a>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-start">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <div className="text-sm text-gray-300">{customer.address}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-300">
                                                        <div className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            {new Date(customer.createdAt).toLocaleDateString("tr-TR", {
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "numeric"
                                                            })}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-flex items-center rounded-md border border-gray-800 bg-black bg-opacity-40 shadow">
                                                        <button
                                                            onClick={() => handleShowEditForm(customer)}
                                                            className="px-3 py-2 text-sm text-silver hover:text-white transition-colors border-r border-gray-800"
                                                            title="Düzenle"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCustomer(customer._id as string)}
                                                            className="px-3 py-2 text-gray-400 hover:text-red-300 transition-colors"
                                                            title="Sil"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Gösterilen müşteri sayısı */}
                    {customers.length > 0 && (
                        <div className="flex items-center justify-between px-2 py-3 mt-4 bg-black bg-opacity-30 border border-gray-800 rounded-md">
                            <div className="text-sm text-gray-400">
                                <span className="font-medium text-silver">{filteredCustomers.length}</span> müşteri gösteriliyor
                                {searchTerm && <span className="ml-1">(filtrelendi: <span className="text-silver font-medium">"{searchTerm}"</span>)</span>}
                            </div>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="text-gray-400 hover:text-silver transition-colors flex items-center space-x-1 bg-black bg-opacity-40 px-3 py-1.5 rounded-md border border-gray-800"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span>Aramayı Temizle</span>
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
} 