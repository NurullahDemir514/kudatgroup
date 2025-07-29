"use client";

import { useState, useEffect } from "react";
import { ICustomer } from "@/models/Customer";

// Form tipi tanımlaması
export type CustomerFormData = {
    name: string;
    email: string;
    phone: string;
    address: string;
    companyName?: string;
    taxNumber?: string;
};

// Form hata bildirim bileşeni
export const FormAlert = ({ message, type = "error" }: { message: string; type?: "error" | "success" | "warning" }) => {
    const bgColor = type === "error" ? "bg-red-50" : type === "success" ? "bg-green-50" : "bg-yellow-50";
    const textColor = type === "error" ? "text-red-600" : type === "success" ? "text-green-600" : "text-yellow-600";
    const borderColor = type === "error" ? "border-red-200" : type === "success" ? "border-green-200" : "border-yellow-200";
    const iconColor = type === "error" ? "text-red-500" : type === "success" ? "text-green-500" : "text-yellow-500";

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

// Form prop tiplerini tanımlama
interface CustomerFormProps {
    initialData?: ICustomer;
    formError: string | null;
    formSubmitting: boolean;
    onSubmit: (data: CustomerFormData) => void;
    onCancel: () => void;
}

export default function CustomerForm({
    initialData,
    formError,
    formSubmitting,
    onSubmit,
    onCancel
}: CustomerFormProps) {
    const [formData, setFormData] = useState<CustomerFormData>({
        name: initialData?.name || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        address: initialData?.address || "",
        companyName: initialData?.companyName || "",
        taxNumber: initialData?.taxNumber || ""
    });

    // Form değişikliklerini takip et
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Formu gönder
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div style={{ maxHeight: '85vh', overflowY: 'hidden' }} className="flex flex-col">
            {/* Başlık - Sabit */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0 z-10">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {initialData ? "Müşteri Bilgilerini Düzenle" : "Yeni Müşteri Ekle"}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* İçerik - Kaydırılabilir */}
            <div style={{ maxHeight: 'calc(85vh - 130px)' }} className="overflow-y-auto flex-grow p-4">
                {formError && (
                    <FormAlert message={formError} type="error" />
                )}

                <form id="customerForm" onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Temel Bilgiler
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                                    Müşteri Adı <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={`w-full rounded-md border ${!formData.name && formError ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} bg-white pl-10 px-3 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors`}
                                        placeholder="Müşterinin tam adı"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Kişi ya da şirket adı giriniz</p>
                            </div>

                            <div>
                                <label htmlFor="companyName" className="mb-1 block text-sm font-medium text-gray-700">
                                    Şirket Adı <span className="text-gray-500">(Opsiyonel)</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        id="companyName"
                                        name="companyName"
                                        value={formData.companyName || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border border-gray-300 bg-white pl-10 px-3 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
                                        placeholder="Şirket adı (varsa)"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Kurumsal müşteriler için şirket adı</p>
                            </div>

                            <div>
                                <label htmlFor="taxNumber" className="mb-1 block text-sm font-medium text-gray-700">
                                    Vergi Numarası <span className="text-gray-500">(Opsiyonel)</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        id="taxNumber"
                                        name="taxNumber"
                                        value={formData.taxNumber || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border border-gray-300 bg-white pl-10 px-3 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
                                        placeholder="Vergi numarası (varsa)"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Fatura için vergi/TC kimlik numarası</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            İletişim Bilgileri
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                                    E-posta <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full rounded-md border ${!formData.email && formError ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} bg-white pl-10 px-3 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors`}
                                        placeholder="ornek@firma.com"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">İletişim için geçerli e-posta adresi</p>
                            </div>

                            <div>
                                <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                                    Telefon <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={`w-full rounded-md border ${!formData.phone && formError ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} bg-white pl-10 px-3 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors`}
                                        placeholder="5XX XXX XX XX"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">10 haneli cep telefonu numarası</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Adres Bilgileri
                        </h3>

                        <div>
                            <label htmlFor="address" className="mb-1 block text-sm font-medium text-gray-700">
                                Adres <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                    className={`w-full rounded-md border ${!formData.address && formError ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} bg-white pl-10 px-3 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors`}
                                    placeholder="Müşterinin tam adresi"
                                ></textarea>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Teslimat ve fatura için açık adres bilgisi</p>
                        </div>
                    </div>
                </form>
            </div>

            {/* Alt Butonlar - Sabit */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                        <span className="text-red-500 mr-1">*</span>
                        <span className="italic">işaretli alanlar zorunludur</span>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
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
                            form="customerForm"
                            disabled={formSubmitting}
                            className="rounded-md bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-600 border border-blue-500 shadow-sm disabled:opacity-70"
                        >
                            {formSubmitting ? (
                                <div className="flex items-center space-x-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-r-2 border-white"></div>
                                    <span>{initialData ? "Güncelleniyor..." : "Ekleniyor..."}</span>
                                </div>
                            ) : (
                                <span className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {initialData ? "Müşteriyi Güncelle" : "Müşteriyi Ekle"}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 