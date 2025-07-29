"use client";

import { useState } from "react";
import { ICustomer } from "@/models/Customer";

// CustomerList prop tiplerini tanımlama
interface CustomerListProps {
    customers: ICustomer[];
    onEdit: (customer: ICustomer) => void;
    onDelete: (id: string) => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

interface CustomerItemProps {
    customer: ICustomer;
    onEdit: (customer: ICustomer) => void;
    onDelete: (id: string) => void;
}

// Tek bir müşteri satırı bileşeni - Daha iyi sorumluluk ayrımı için
const CustomerItem = ({ customer, onEdit, onDelete }: CustomerItemProps) => {
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                        {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-2 sm:ml-4">
                        <div className="text-xs sm:text-sm font-medium text-gray-800">{customer.name}</div>
                        {customer.companyName && (
                            <div className="text-xs text-gray-500 mt-0.5">
                                {customer.companyName}
                                {customer.taxNumber && <span className="ml-1">({customer.taxNumber})</span>}
                            </div>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a href={`mailto:${customer.email}`} className="hover:text-blue-600 hover:underline transition-colors truncate max-w-[120px] sm:max-w-full">
                            {customer.email}
                        </a>
                    </div>
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href={`tel:${customer.phone}`} className="hover:text-blue-600 hover:underline transition-colors">
                            {customer.phone}
                        </a>
                    </div>
                </div>
            </td>
            <td className="hidden md:table-cell px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="text-xs sm:text-sm text-gray-600 line-clamp-2">{customer.address}</div>
                </div>
            </td>
            <td className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4">
                <div className="text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                <div className="inline-flex items-center rounded-md shadow-sm">
                    <button
                        onClick={() => onEdit(customer)}
                        className="rounded-l-md border border-gray-300 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        title="Düzenle"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) {
                                onDelete(customer._id as string)
                            }
                        }}
                        className="rounded-r-md border border-gray-300 border-l-0 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                        title="Sil"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    );
};

// Boş durum bileşeni
const EmptyState = ({ onAddNew }: { onAddNew: () => void }) => {
    return (
        <div className="rounded-md bg-white p-8 sm:p-12 text-center text-gray-700 border border-gray-200 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Henüz kayıtlı müşteri bulunmuyor</p>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Müşteri ekleyerek satışlarınızı takip etmeye başlayabilirsiniz</p>
            <button
                onClick={onAddNew}
                className="mt-2 rounded-md bg-blue-500 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-white hover:bg-blue-600 transition-all inline-flex items-center space-x-2 border border-blue-500 shadow-md"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>İlk Müşteriyi Ekle</span>
            </button>
        </div>
    );
};

// Ana müşteri listesi bileşeni
export default function CustomerList({
    customers,
    onEdit,
    onDelete,
    searchTerm,
    onSearchChange
}: CustomerListProps) {
    // Arama filtreleme
    const filteredCustomers = searchTerm
        ? customers.filter(
            (customer) =>
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.phone.includes(searchTerm) ||
                customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (customer.companyName && customer.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (customer.taxNumber && customer.taxNumber.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : customers;

    return (
        <div>
            {/* İstatistikler ve Arama */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center space-x-4 shadow-sm">
                    <div className="p-2 sm:p-3 rounded-md bg-blue-50 border border-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-gray-500 text-xs sm:text-sm">Toplam Müşteri</div>
                        <div className="text-xl sm:text-2xl font-bold text-gray-800">{customers.length}</div>
                    </div>
                </div>

                <div className="sm:col-span-3 relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <input
                        type="text"
                        placeholder="İsim, email, telefon veya adres ile müşteri arayın..."
                        className="w-full h-full rounded-lg border border-gray-300 bg-white pl-10 sm:pl-12 px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder-gray-400 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />

                    {searchTerm && (
                        <button
                            onClick={() => onSearchChange("")}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 text-gray-400 hover:text-gray-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Müşteri tablosu */}
            {customers.length === 0 ? (
                <EmptyState onAddNew={() => { }} />
            ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Müşteri Bilgileri
                                    </th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        İletişim
                                    </th>
                                    <th scope="col" className="hidden md:table-cell px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Adres
                                    </th>
                                    <th scope="col" className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Kayıt Tarihi
                                    </th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                        İşlemler
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredCustomers.map((customer) => (
                                    <CustomerItem
                                        key={customer._id}
                                        customer={customer}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Gösterilen müşteri sayısı */}
            {customers.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 py-2 sm:py-3 mt-3 sm:mt-4 bg-gray-50 border border-gray-200 rounded-md">
                    <div className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-0">
                        <span className="font-medium text-gray-700">{filteredCustomers.length}</span> müşteri gösteriliyor
                        {searchTerm && <span className="ml-1">(filtrelendi: <span className="text-gray-700 font-medium">"{searchTerm}"</span>)</span>}
                    </div>
                    {searchTerm && (
                        <button
                            onClick={() => onSearchChange("")}
                            className="text-gray-500 hover:text-gray-700 transition-colors flex items-center space-x-1 bg-white px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md border border-gray-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Aramayı Temizle</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
} 