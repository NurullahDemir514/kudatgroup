"use client";

import React, { useState, useEffect } from "react";
import { ISale } from "@/models/Sale";
import { IProduct } from "@/models/Product";
import { SalesForm } from "./SalesForm";

export default function SalesPage() {
    // State tanımlamaları
    const [sales, setSales] = useState<ISale[]>([]);
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingSale, setEditingSale] = useState<ISale | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedSale, setSelectedSale] = useState<ISale | null>(null);

    // Filtreleme ve arama state'leri
    const [customerFilter, setCustomerFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Form verileri
    const [formData, setFormData] = useState<{
        customerName: string;
        customerPhone: string;
        customerEmail: string;
        saleDate: string;
        paymentMethod: string;
        notes: string;
        items: Array<{
            product: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        }>;
    }>({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        saleDate: new Date().toISOString().split('T')[0],
        paymentMethod: "Nakit",
        notes: "",
        items: [
            {
                product: "",
                quantity: 1,
                unitPrice: 0,
                totalPrice: 0,
            },
        ],
    });

    // Tarih bazında filtreleme seçenekleri
    const dateFilterOptions = [
        { value: '', label: 'Tüm Tarihler' },
        { value: 'today', label: 'Bugün' },
        { value: 'yesterday', label: 'Dün' },
        { value: 'thisWeek', label: 'Bu Hafta' },
        { value: 'lastWeek', label: 'Geçen Hafta' },
        { value: 'thisMonth', label: 'Bu Ay' },
        { value: 'lastMonth', label: 'Geçen Ay' },
    ];

    // Satışları API'den getir
    useEffect(() => {
        const fetchSales = async () => {
            try {
                setLoading(true);

                let url = "/api/sales";
                const params = new URLSearchParams();

                if (customerFilter) {
                    params.append("customerName", customerFilter);
                }

                if (startDate) {
                    params.append("startDate", startDate);
                }

                if (endDate) {
                    params.append("endDate", endDate);
                }

                if (params.toString()) {
                    url += `?${params.toString()}`;
                }

                const response = await fetch(url);
                const result = await response.json();

                if (result.success) {
                    setSales(result.data);
                } else {
                    setError(result.error || "Satışlar yüklenirken bir hata oluştu");
                }
            } catch (err) {
                setError("Sunucu ile bağlantı kurulamadı");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSales();
    }, [customerFilter, startDate, endDate]);

    // Ürünleri getir
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("/api/products");
                const result = await response.json();

                if (result.success) {
                    setProducts(result.data);
                }
            } catch (err) {
                console.error("Ürünler yüklenirken hata:", err);
            }
        };

        fetchProducts();
    }, []);

    // Filtreleri uygula
    const applyFilters = () => {
        // useEffect içindeki fetchSales fonksiyonu filtreleme state'leri değiştiğinde çalışacak
    };

    // Filtreleri temizle
    const clearFilters = () => {
        setCustomerFilter("");
        setStartDate("");
        setEndDate("");
    };

    // Excel'e aktar
    const exportToExcel = () => {
        let url = "/api/sales/export";
        const params = new URLSearchParams();

        if (customerFilter) {
            params.append("customerName", customerFilter);
        }

        if (startDate) {
            params.append("startDate", startDate);
        }

        if (endDate) {
            params.append("endDate", endDate);
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        // Yeni sekmede aç
        window.open(url, "_blank");
    };

    // Form input değişikliklerini işle
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Ürün satırı input değişikliklerini işle
    const handleItemChange = (index: number, field: string, value: string | number) => {
        const updatedItems = [...formData.items];

        if (field === "product" && typeof value === "string") {
            const selectedProduct = products.find(p => p._id === value);
            if (selectedProduct) {
                updatedItems[index] = {
                    ...updatedItems[index],
                    [field]: value,
                    unitPrice: selectedProduct.salePrice || 0,
                    totalPrice: (selectedProduct.salePrice || 0) * updatedItems[index].quantity,
                };
            } else {
                updatedItems[index] = {
                    ...updatedItems[index],
                    [field]: value,
                };
            }
        } else if (field === "quantity" && typeof value === "number") {
            updatedItems[index] = {
                ...updatedItems[index],
                [field]: value,
                totalPrice: updatedItems[index].unitPrice * value,
            };
        } else {
            updatedItems[index] = {
                ...updatedItems[index],
                [field]: value,
            };
        }

        setFormData({
            ...formData,
            items: updatedItems,
        });
    };

    // Ürün satırı ekle
    const addItemRow = () => {
        setFormData({
            ...formData,
            items: [
                ...formData.items,
                {
                    product: "",
                    quantity: 1,
                    unitPrice: 0,
                    totalPrice: 0,
                },
            ],
        });
    };

    // Ürün satırı kaldır
    const removeItemRow = (index: number) => {
        if (formData.items.length <= 1) {
            setFormError("En az bir ürün satırı olmalıdır");
            return;
        }

        const updatedItems = [...formData.items];
        updatedItems.splice(index, 1);

        setFormData({
            ...formData,
            items: updatedItems,
        });
    };

    // Yeni satış ekleme formunu göster
    const handleShowAddForm = () => {
        setFormData({
            customerName: "",
            customerPhone: "",
            customerEmail: "",
            saleDate: new Date().toISOString().split('T')[0],
            paymentMethod: "Nakit",
            notes: "",
            items: [
                {
                    product: "",
                    quantity: 1,
                    unitPrice: 0,
                    totalPrice: 0,
                },
            ],
        });
        setEditingSale(null);
        setFormError(null);
        setShowForm(true);
    };

    // Formu kapat
    const handleCloseForm = () => {
        setShowForm(false);
        setEditingSale(null);
        setFormError(null);
    };

    // Toplam tutarı hesapla
    const calculateTotal = () => {
        return formData.items.reduce((total, item) => total + item.totalPrice, 0);
    };

    // Para formatı
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
        }).format(amount);
    };

    // Tarih formatı
    const formatDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Detay modalını göster
    const showSaleDetail = (sale: ISale) => {
        setSelectedSale(sale);
        setShowDetailModal(true);
    };

    // Detay modalını kapat
    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedSale(null);
    };

    // Formu gönder
    const handleSubmitForm = async (formData: any) => {
        setFormError(null);
        setFormSubmitting(true);
        console.log("Form gönderiliyor:", formData);

        try {
            // Formdan gelen verileri doğrula
            if (!formData.customerName || !formData.customerName.trim()) {
                setFormError("Müşteri adı zorunludur");
                setFormSubmitting(false);
                return;
            }

            if (!formData.items || formData.items.length === 0) {
                setFormError("En az bir ürün eklemelisiniz");
                setFormSubmitting(false);
                return;
            }

            for (const item of formData.items) {
                if (!item.product || item.quantity < 1 || isNaN(item.unitPrice) || isNaN(item.totalPrice)) {
                    setFormError("Tüm ürün satırları için ürün ve geçerli miktar belirtmelisiniz");
                    setFormSubmitting(false);
                    return;
                }
            }

            // Tarih formatını doğru şekilde hazırla
            let formattedData = { ...formData };

            // saleDate kontrolü
            if (formData.saleDate) {
                try {
                    // Eğer tarih bir string ise, tarih nesnesine çevirmeye çalış
                    if (typeof formData.saleDate === 'string') {
                        formattedData.saleDate = new Date(formData.saleDate);
                    }
                    // Her durumda ISO formatına çevir
                    formattedData.saleDate = new Date(formattedData.saleDate).toISOString();
                } catch (err) {
                    console.error("Satış tarihi formatı hatalı:", err);
                    formattedData.saleDate = new Date().toISOString();
                }
            } else {
                formattedData.saleDate = new Date().toISOString();
            }

            // Diğer tarihler için de aynı işlemi yap
            if (formData.deliveryDate) {
                try {
                    if (typeof formData.deliveryDate === 'string') {
                        formattedData.deliveryDate = new Date(formData.deliveryDate);
                    }
                    formattedData.deliveryDate = new Date(formattedData.deliveryDate).toISOString();
                } catch (err) {
                    console.error("Teslimat tarihi formatı hatalı:", err);
                    formattedData.deliveryDate = null;
                }
            }

            if (formData.dueDate) {
                try {
                    if (typeof formData.dueDate === 'string') {
                        formattedData.dueDate = new Date(formData.dueDate);
                    }
                    formattedData.dueDate = new Date(formattedData.dueDate).toISOString();
                } catch (err) {
                    console.error("Son ödeme tarihi formatı hatalı:", err);
                    formattedData.dueDate = null;
                }
            }

            const isEditing = editingSale !== null;
            const url = isEditing
                ? `/api/sales/${editingSale._id}`
                : "/api/sales";
            const method = isEditing ? "PUT" : "POST";

            console.log("API İsteği gönderiliyor:", {
                url,
                method,
                data: formattedData
            });

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formattedData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Yanıtı: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();
            console.log("API Yanıtı:", result);

            if (result.success) {
                // Satışlar listesini güncelle
                if (isEditing) {
                    setSales((prev) =>
                        prev.map((s) =>
                            s._id === editingSale._id ? result.data : s
                        )
                    );
                } else {
                    setSales((prev) => [result.data, ...prev]);
                }

                handleCloseForm();
            } else {
                setFormError(result.error || "İşlem sırasında bir hata oluştu");
            }
        } catch (err) {
            console.error("Hata detayı:", err);
            setFormError(`Sunucu ile bağlantı sırasında hata: ${(err as Error).message}`);
        } finally {
            setFormSubmitting(false);
        }
    };

    // Satışı sil
    const handleDeleteSale = async (id: string) => {
        if (!window.confirm("Bu satış kaydını silmek istediğinize emin misiniz?")) {
            return;
        }

        try {
            const response = await fetch(`/api/sales/${id}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (result.success) {
                // Satışlar listesinden kaldır
                setSales((prev) => prev.filter((sale) => sale._id !== id));
            } else {
                alert(result.error || "Satış silinirken bir hata oluştu");
            }
        } catch (err) {
            alert("Sunucu ile bağlantı kurulamadı");
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Satış Kayıtları</h1>
                <button
                    onClick={handleShowAddForm}
                    className="rounded-md px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-md border border-blue-400 shadow-sm flex items-center gap-1.5 group text-sm sm:text-base"
                >
                    <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-blue-400 rounded-full group-hover:bg-blue-300 transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </span>
                    <span className="font-medium">Yeni Satış</span>
                </button>
            </div>

            {/* Filtreleme ve Arama */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
                <div className="w-full md:w-1/3">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Müşteri Adı</label>
                    <input
                        type="text"
                        placeholder="Müşteri adı ile ara..."
                        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={customerFilter}
                        onChange={(e) => setCustomerFilter(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-1/4">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
                    <input
                        type="date"
                        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-1/4">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Bitiş Tarihi</label>
                    <input
                        type="date"
                        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={clearFilters}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-all hover:bg-gray-50"
                    >
                        Temizle
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="rounded-md bg-green-600 px-4 py-2 text-white transition-all hover:bg-green-700"
                    >
                        <div className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Excel</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Hata mesajı */}
            {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
                    {error}
                </div>
            )}

            {/* Yükleniyor göstergesi */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    {/* Satış tablosu */}
                    {sales.length === 0 ? (
                            <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-600 border border-gray-200">
                            Filtrelere uygun satış kaydı bulunamadı.
                        </div>
                    ) : (
                                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                    <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                                            Müşteri Bilgileri
                                        </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                                            Satış Tarihi
                                        </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                                            Toplam Tutar
                                        </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                                            Ödeme Yöntemi
                                        </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                                            İşlemler
                                        </th>
                                    </tr>
                                </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                    {sales.map((sale) => (
                                        <tr key={sale._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => showSaleDetail(sale)}>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <div className="text-sm font-medium text-gray-800">{sale.customerName}</div>
                                                    {sale.customerPhone && <div className="text-xs text-gray-600">{sale.customerPhone}</div>}
                                                    {sale.customerEmail && <div className="text-xs text-gray-600">{sale.customerEmail}</div>}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm text-gray-700">{formatDate(sale.saleDate)}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm font-medium text-gray-800">{formatCurrency(sale.totalAmount)}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className={`rounded-full ${sale.paymentMethod === 'Nakit' ? 'bg-gray-100' :
                                                    sale.paymentMethod === 'Kredi Kartı' ? 'bg-blue-100' :
                                                        sale.paymentMethod === 'Havale/EFT' ? 'bg-green-100' :
                                                            sale.paymentMethod === 'Çek' ? 'bg-yellow-100' :
                                                                sale.paymentMethod === 'Senet' ? 'bg-red-100' : 'bg-gray-100'} 
                                                           px-2 py-1 text-xs font-medium ${sale.paymentMethod === 'Nakit' ? 'text-gray-700' :
                                                        sale.paymentMethod === 'Kredi Kartı' ? 'text-blue-700' :
                                                            sale.paymentMethod === 'Havale/EFT' ? 'text-green-700' :
                                                                sale.paymentMethod === 'Çek' ? 'text-yellow-700' :
                                                                    sale.paymentMethod === 'Senet' ? 'text-red-700' : 'text-gray-700'} inline-block border border-gray-200`}>
                                                    {sale.paymentMethod || 'Nakit'}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Düzenleme işlevi henüz implement edilmedi
                                                        alert("Bu özellik henüz tamamlanmadı");
                                                    }}
                                                    className="mr-3 text-blue-600 hover:text-blue-800 transition-colors"
                                                >
                                                    Düzenle
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteSale(sale._id as string);
                                                    }}
                                                    className="text-gray-500 hover:text-red-600 transition-colors"
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

                    {/* Gösterilen satış sayısı */}
                        <div className="text-sm text-gray-600 mt-4">
                        Toplam {sales.length} satış gösteriliyor
                    </div>
                </>
            )}

            {/* Satış Detay Modalı */}
            {showDetailModal && selectedSale && (
                <div className="fixed inset-0 z-10 flex items-center justify-center bg-white bg-opacity-60 backdrop-filter backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Satış Detayı
                            </h2>
                            <button
                                onClick={closeDetailModal}
                                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Müşteri Bilgileri</h3>
                                <p className="text-gray-800">{selectedSale.customerName}</p>
                                {selectedSale.customerPhone && <p className="text-sm text-gray-600">{selectedSale.customerPhone}</p>}
                                {selectedSale.customerEmail && <p className="text-sm text-gray-600">{selectedSale.customerEmail}</p>}
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Satış Bilgileri</h3>
                                <p className="text-gray-800">Tarih: {formatDate(selectedSale.saleDate)}</p>
                                <p className="text-gray-800">Ödeme: {selectedSale.paymentMethod || 'Nakit'}</p>
                                <p className="text-gray-800">Toplam: {formatCurrency(selectedSale.totalAmount)}</p>
                                {selectedSale.paymentStatus && <p className="text-gray-800">Durum: {selectedSale.paymentStatus}</p>}
                            </div>
                        </div>

                        <h3 className="mb-2 text-md font-medium text-gray-800">Satılan Ürünler</h3>
                        <div className="mb-4 max-h-60 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                                            Ürün
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider text-gray-600">
                                            Miktar
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider text-gray-600">
                                            Birim Fiyat
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                                            Toplam
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {selectedSale.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2 text-sm text-gray-700">
                                                {item.productName}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-center text-gray-700">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-center text-gray-700">
                                                {formatCurrency(item.unitPrice)}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right text-gray-700">
                                                {formatCurrency(item.totalPrice)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                                            Genel Toplam:
                                        </td>
                                        <td className="px-4 py-2 text-right text-sm font-bold text-gray-700">
                                            {formatCurrency(selectedSale.totalAmount)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {selectedSale.notes && (
                            <div className="mb-4">
                                <h3 className="mb-1 text-sm font-medium text-gray-500">Notlar</h3>
                                <p className="rounded bg-gray-50 p-2 text-sm text-gray-700 border border-gray-200">
                                    {selectedSale.notes}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Satış Form Modalı - Basitleştirilmiş yapı */}
            {showForm && (
                <>
                    {/* Arka plan overlay */}
                    <div
                        className="fixed inset-0 bg-white bg-opacity-60 backdrop-filter backdrop-blur-sm z-40"
                        onClick={handleCloseForm}
                    ></div>

                    {/* Modal içeriği */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-4 px-2 sm:px-4">
                        <div className="bg-white w-full max-w-5xl rounded-lg shadow-xl relative mx-auto my-4 border border-gray-200">
                            {/* Modal header */}
                            <div className="flex justify-between items-center border-b border-gray-200 p-3 sm:p-4">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                                        {editingSale ? 'Satış Düzenle' : 'Yeni Satış Ekle'}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                        Müşteri bilgilerini ve satış detaylarını eksiksiz doldurun.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
                                    onClick={handleCloseForm}
                                >
                                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Hata mesajı */}
                            {formError && (
                                <div className="mx-3 sm:mx-4 mt-3 sm:mt-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-md text-xs sm:text-sm text-red-600">
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        {formError}
                                    </div>
                                </div>
                            )}

                            {/* Form içeriği */}
                            <div className="p-3 sm:p-4 max-h-[calc(100vh-180px)] overflow-y-auto">
                                <SalesForm
                                    products={products}
                                    onSubmit={handleSubmitForm}
                                    onCancel={handleCloseForm}
                                    editingSale={editingSale}
                                    formSubmitting={formSubmitting}
                                    formError={formError}
                                    initialData={editingSale || undefined}
                                />
                            </div>

                            {/* Yükleniyor göstergesi */}
                            {formSubmitting && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 rounded-lg">
                                    <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white rounded-lg shadow-xl flex items-center space-x-3 border border-gray-200">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                                        <p className="text-sm sm:text-base text-gray-700 font-medium">İşleminiz gerçekleştiriliyor...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
} 