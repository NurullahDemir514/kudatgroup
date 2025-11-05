"use client";

import { useState, useEffect, useRef } from "react";
import { IProduct } from "@/models/Product";

// Scrollbar gizleme CSS'i
const scrollbarHideStyles = `
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;  /* IE ve Edge */
    scrollbar-width: none;  /* Firefox */
}
`;

export default function ProductsPage() {
    // State tanımlamaları
    const [products, setProducts] = useState<IProduct[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        wholesalePrice: "",
        salePrice: "",
        stock: "",
        category: "",
        image: "",
        supplier: "",
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageUploading, setImageUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Ürünleri API'den getir
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/products");
                const result = await response.json();

                if (result.success) {
                    setProducts(result.data);
                } else {
                    setError(result.error || "Ürünler yüklenirken bir hata oluştu");
                }
            } catch (err) {
                setError("Sunucu ile bağlantı kurulamadı");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Kategorileri getir
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("/api/products/categories");
                const result = await response.json();

                if (result.success) {
                    setCategories(result.data);
                }
            } catch (err) {
                console.error("Kategoriler yüklenirken hata:", err);
            }
        };

        fetchCategories();
    }, [products]);

    // Form verilerini güncelle
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Yeni kategori adını güncelle
    const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCategoryName(e.target.value);
    };

    // Yeni ürün ekleme formunu göster
    const handleShowAddForm = () => {
        setFormData({
            name: "",
            description: "",
            wholesalePrice: "",
            salePrice: "",
            stock: "",
            category: "",
            image: "",
            supplier: "",
        });
        setNewCategoryName("");
        setEditingProduct(null);
        setFormError(null);
        setShowForm(true);
        setImagePreview(null);
    };

    // Düzenleme formunu göster
    const handleShowEditForm = (product: IProduct) => {
        setFormData({
            name: product.name,
            description: product.description || "",
            wholesalePrice: product.wholesalePrice?.toString() || "",
            salePrice: product.salePrice.toString(),
            stock: product.stock.toString(),
            category: product.category,
            image: product.image || "",
            supplier: product.supplier || "",
        });
        setEditingProduct(product);
        setFormError(null);
        setShowForm(true);
        setImagePreview(product.image || null);
    };

    // Formu kapat
    const handleCloseForm = () => {
        setShowForm(false);
        setEditingProduct(null);
        setFormError(null);
    };

    // Resim yükleme işlemi
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Sadece resim dosyalarını kabul et
        if (!file.type.startsWith('image/')) {
            setFormError('Lütfen geçerli bir resim dosyası seçin');
            return;
        }

        // Maksimum dosya boyutu kontrolü (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setFormError('Maksimum dosya boyutu 10MB olmalıdır');
            return;
        }

        setImageUploading(true);
        try {
            // Önizleme için görüntüyü ayarla
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };

            // Firebase Storage'a yükle
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'products');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    image: data.url // Firebase Storage URL'i
                }));
                setFormError(null);
            } else {
                setFormError('Resim yüklenirken bir hata oluştu: ' + (data.error || 'Bilinmeyen hata'));
                setImagePreview(null);
            }
        } catch (err) {
            console.error('Resim yükleme hatası:', err);
            setFormError('Resim yüklenirken bir hata oluştu');
            setImagePreview(null);
        } finally {
            setImageUploading(false);
        }
    };

    // Resim kaldırma işlemi
    const handleRemoveImage = () => {
        setImagePreview(null);
        setFormData(prev => ({
            ...prev,
            image: ""
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Formu gönder (ekle veya güncelle)
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setFormSubmitting(true);

        try {
            // Yeni kategori seçilmiş ise kategori adını güncelle
            let finalFormData = { ...formData };
            if (formData.category === "new" && newCategoryName) {
                finalFormData = {
                    ...formData,
                    category: newCategoryName
                };
            }

            // Açıklama alanı boş ise varsayılan bir değer ata
            if (!finalFormData.description) {
                finalFormData.description = '';
            }

            // Form validasyonu
            if (!finalFormData.name || !finalFormData.salePrice || !finalFormData.category) {
                setFormError("Ürün adı, satış fiyatı ve kategori alanları zorunludur");
                setFormSubmitting(false);
                return;
            }

            // 'new' değeri kategori olarak kullanılamaz
            if (finalFormData.category === "new") {
                setFormError("Lütfen yeni kategori adını girin veya mevcut bir kategori seçin");
                setFormSubmitting(false);
                return;
            }

            // Fiyat değerleri ve stok sayısal değer olmalı
            if ((finalFormData.wholesalePrice && isNaN(Number(finalFormData.wholesalePrice))) ||
                isNaN(Number(finalFormData.salePrice)) ||
                (finalFormData.stock && isNaN(Number(finalFormData.stock)))) {
                setFormError("Fiyat ve stok değerleri sayısal olmalıdır");
                setFormSubmitting(false);
                return;
            }

            const isEditing = editingProduct !== null;
            const url = isEditing
                ? `/api/products/${editingProduct._id}`
                : "/api/products";
            const method = isEditing ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(finalFormData),
            });

            const result = await response.json();

            if (result.success) {
                if (isEditing) {
                    // Ürünü güncelle
                    setProducts((prev) =>
                        prev.map((p) =>
                            p._id === editingProduct._id ? result.data : p
                        )
                    );
                } else {
                    // Yeni ürün ekle
                    setProducts((prev) => [...prev, result.data]);
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

    // Bir ürünü sil
    const handleDeleteProduct = async (id: string) => {
        if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
            return;
        }

        try {
            const response = await fetch(`/api/products/${id}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (result.success) {
                // Ürünü UI'dan kaldır
                setProducts((prev) => prev.filter((product) => (product.id || product._id) !== id));
            } else {
                alert(result.error || "Ürün silinirken bir hata oluştu");
            }
        } catch (err) {
            alert("Sunucu ile bağlantı kurulamadı");
            console.error(err);
        }
    };

    // Arama ve kategori filtreleme
    const filteredProducts = products.filter((product) => {
        const matchesSearch = searchTerm
            ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description ? product.description.toLowerCase().includes(searchTerm.toLowerCase()) : false)
            : true;

        const matchesCategory = selectedCategory
            ? product.category === selectedCategory
            : true;

        return matchesSearch && matchesCategory;
    });

    // Para formatı
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
        }).format(amount);
    };

    // Resmi büyütmek için modal aç
    const openImageModal = (imageUrl: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setSelectedImage(imageUrl);
        setShowImageModal(true);
    };

    // Modal kapat
    const closeImageModal = () => {
        setShowImageModal(false);
        setSelectedImage(null);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Global CSS style tag */}
            <style jsx global>{scrollbarHideStyles}</style>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Ürün Listesi</h1>
                <button
                    onClick={handleShowAddForm}
                    className="rounded-md bg-gradient-to-r from-blue-600 to-blue-700 px-3 sm:px-4 py-1.5 sm:py-2 text-sm text-white transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg shadow-sm"
                >
                    <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Yeni Ürün Ekle</span>
                    </div>
                </button>
            </div>

            {/* Arama ve filtreleme */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Ürün adı veya açıklama ile ara..."
                        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 pl-10 text-sm sm:text-base text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 sm:h-5 sm:w-5"
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

                <div className="w-full sm:w-64">
                    <select
                        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm sm:text-base text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={selectedCategory || ""}
                        onChange={(e) => setSelectedCategory(e.target.value || null)}
                    >
                        <option value="">Tüm Kategoriler</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Ürün ekleme/düzenleme formu */}
            {showForm && (
                <div className="fixed inset-0 z-10 flex items-center justify-center backdrop-blur-md bg-white/80 p-4">
                    <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white/95 p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                {editingProduct ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
                            </h2>
                            <button
                                onClick={handleCloseForm}
                                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 rounded-md bg-red-50 p-3 text-xs sm:text-sm text-red-700 border border-red-200">
                                {formError}
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto scrollbar-hide pr-2">
                            <form onSubmit={handleSubmitForm}>
                                <div className="mb-4">
                                    <label htmlFor="name" className="mb-1 block text-xs sm:text-sm font-medium text-gray-700">
                                        Ürün Adı
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Ürün adı"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="description" className="mb-1 block text-xs sm:text-sm font-medium text-gray-700">
                                        Açıklama <span className="text-xs text-gray-500">(Opsiyonel)</span>
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Ürün açıklaması"
                                    ></textarea>
                                </div>

                                {/* Resim yükleme alanı */}
                                <div className="mb-4">
                                    <label className="mb-1 block text-xs sm:text-sm font-medium text-gray-700">
                                        Ürün Görseli <span className="text-xs text-gray-500">(Opsiyonel)</span>
                                    </label>
                                    <div className="flex flex-col space-y-2">
                                        {imagePreview ? (
                                            <div className="relative mb-2 h-32 sm:h-40 w-full overflow-hidden rounded-md border border-gray-300">
                                                <img
                                                    src={imagePreview}
                                                    alt="Ürün görseli önizleme"
                                                    className="h-full w-full object-contain cursor-pointer"
                                                    onClick={(e) => openImageModal(imagePreview, e)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="absolute right-2 top-2 rounded-full bg-white bg-opacity-90 p-1 text-gray-600 hover:bg-opacity-100 shadow-sm"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center">
                                                    <label className="flex h-28 sm:h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 hover:border-blue-500">
                                                        {imageUploading ? (
                                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                                <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
                                                                <span className="text-xs sm:text-sm text-gray-500">Yükleniyor...</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                            <span className="mt-2 text-xs sm:text-sm text-gray-500">Görsel seçmek için tıklayın</span>
                                                        </>
                                                    )}
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        disabled={imageUploading}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="stock" className="mb-1 block text-xs sm:text-sm font-medium text-gray-700">
                                        Stok
                                    </label>
                                    <input
                                        type="text"
                                        id="stock"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="category" className="mb-1 block text-xs sm:text-sm font-medium text-gray-700">
                                        Kategori
                                    </label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="">Kategori Seçin</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                        <option value="new">Yeni Kategori Ekle</option>
                                    </select>
                                </div>

                                {formData.category === "new" && (
                                    <div className="mb-4">
                                        <label htmlFor="newCategory" className="mb-1 block text-xs sm:text-sm font-medium text-gray-700">
                                            Yeni Kategori Adı
                                        </label>
                                        <input
                                            type="text"
                                            id="newCategory"
                                            name="newCategoryName"
                                            value={newCategoryName}
                                            onChange={handleNewCategoryChange}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="Yeni kategori adı"
                                        />
                                    </div>
                                )}

                                <div className="mb-4">
                                    <label htmlFor="supplier" className="mb-1 block text-xs sm:text-sm font-medium text-gray-700">
                                        Tedarikçi
                                    </label>
                                    <input
                                        type="text"
                                        id="supplier"
                                        name="supplier"
                                        value={formData.supplier}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Tedarikçi"
                                    />
                                </div>

                                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="wholesalePrice" className="mb-1 block text-xs sm:text-sm font-medium text-gray-700">
                                            Toptan Alım Fiyatı (TL)
                                        </label>
                                        <input
                                            type="text"
                                            id="wholesalePrice"
                                            name="wholesalePrice"
                                            value={formData.wholesalePrice}
                                            onChange={handleInputChange}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="salePrice" className="mb-1 block text-xs sm:text-sm font-medium text-gray-700">
                                            Satış Fiyatı (TL)
                                        </label>
                                        <input
                                            type="text"
                                            id="salePrice"
                                            name="salePrice"
                                            value={formData.salePrice}
                                            onChange={handleInputChange}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseForm}
                                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-700 transition-colors hover:bg-gray-50"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formSubmitting}
                                        className="rounded-md bg-blue-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-white transition-all hover:bg-blue-700 disabled:opacity-70"
                                    >
                                        {formSubmitting ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-t-2 border-white"></div>
                                                <span>İşleniyor...</span>
                                            </div>
                                        ) : (
                                            <>{editingProduct ? "Güncelle" : "Ekle"}</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Hata mesajı */}
            {error && (
                <div className="rounded-md bg-red-50 p-3 sm:p-4 text-xs sm:text-sm text-red-700 border border-red-200">
                    {error}
                </div>
            )}

            {/* Yükleniyor göstergesi */}
            {loading ? (
                <div className="flex justify-center py-6 sm:py-8">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    {/* Ürün tablosu */}
                    {products.length === 0 ? (
                            <div className="rounded-md bg-gray-50 p-3 sm:p-4 text-xs sm:text-sm text-gray-600 border border-gray-200">
                            Henüz kayıtlı ürün bulunmuyor.
                        </div>
                    ) : (
                                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr className="text-xs sm:text-sm font-medium uppercase tracking-wider text-gray-600">
                                                <th scope="col" className="px-3 sm:px-6 py-3 text-left">
                                            Ürün
                                        </th>
                                                <th scope="col" className="px-3 sm:px-6 py-3 text-left hidden sm:table-cell">
                                            Kategori
                                        </th>
                                                <th scope="col" className="px-3 sm:px-6 py-3 text-left">
                                                    Fiyat
                                        </th>
                                                <th scope="col" className="px-3 sm:px-6 py-3 text-left hidden sm:table-cell">
                                            Stok
                                        </th>
                                                <th scope="col" className="px-3 sm:px-6 py-3 text-left hidden sm:table-cell">
                                                    Tedarikçi
                                                </th>
                                                <th scope="col" className="px-3 sm:px-6 py-3 text-left hidden sm:table-cell">
                                                    Eklenme
                                                </th>
                                                <th scope="col" className="px-3 sm:px-6 py-3 text-right">
                                                    İşlem
                                        </th>
                                    </tr>
                                </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id || product._id} className="hover:bg-blue-50 transition-colors">
                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <div className="flex items-center">
                                                    {product.image ? (
                                                        <div className="h-10 w-10 sm:h-14 sm:w-14 flex-shrink-0 mr-2 sm:mr-3">
                                                            <img
                                                                src={product.image}
                                                                alt={product.name}
                                                                className="h-full w-full rounded-md border border-gray-200 object-cover cursor-pointer"
                                                                onClick={(e) => openImageModal(product.image || '', e)}
                                                            />
                                                        </div>
                                                    ) : (
                                                            <div className="h-10 w-10 sm:h-14 sm:w-14 flex-shrink-0 rounded-md border border-gray-200 bg-gray-100 mr-2 sm:mr-3 flex items-center justify-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-xs sm:text-sm font-medium text-gray-800 truncate max-w-[120px] sm:max-w-[200px]">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-xs text-gray-600 hidden sm:block truncate max-w-[200px]">
                                                            {product.description}
                                                        </div>
                                                        <div className="text-xs text-gray-500 sm:hidden">
                                                            {product.category}
                                                        </div>
                                                        <div className="text-xs sm:hidden flex items-center text-gray-500">
                                                            Stok: <span className={`ml-1 ${product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                {product.stock > 0 ? product.stock : '0'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                                                <div className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 border border-gray-200 inline-block">
                                                    {product.category}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4">
                                                <div className="text-xs sm:text-sm font-medium text-gray-800">{formatCurrency(product.salePrice)}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                                                <div
                                                    className={`text-xs sm:text-sm font-medium ${product.stock > 10
                                                        ? "text-emerald-600"
                                                        : product.stock > 0
                                                            ? "text-amber-600"
                                                            : "text-red-600 font-bold"
                                                        }`}
                                                >
                                                    {product.stock > 0 ? product.stock :
                                                        <span className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            </svg>
                                                            0
                                                        </span>}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                                                <div className="text-xs sm:text-sm text-gray-600">
                                                    {product.supplier || "-"}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                                                <div className="text-xs sm:text-sm text-gray-600">
                                                    {product.createdAt && typeof product.createdAt === 'string'
                                                        ? new Date(product.createdAt).toLocaleDateString("tr-TR")
                                                        : typeof product.createdAt === 'object' && product.createdAt instanceof Date
                                                            ? product.createdAt.toLocaleDateString("tr-TR")
                                                            : "-"}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-medium">
                                                <button
                                                    onClick={() => handleShowEditForm(product)}
                                                    className="text-blue-600 hover:text-blue-800 transition-colors mr-2 sm:mr-3"
                                                >
                                                    <span className="hidden sm:inline">Düzenle</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct((product.id || product._id) as string)}
                                                    className="text-gray-500 hover:text-red-600 transition-colors"
                                                >
                                                    <span className="hidden sm:inline">Sil</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Gösterilen ürün sayısı */}
                        <div className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                        Toplam {filteredProducts.length} ürün gösteriliyor (toplam {products.length})
                    </div>
                </>
            )}

            {/* Resim Modal */}
            {showImageModal && selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-white/80 p-4" onClick={closeImageModal}>
                    <div className="relative p-2 sm:p-4 md:p-8">
                        <button
                            className="absolute right-2 top-2 sm:right-4 sm:top-4 rounded-full bg-white/90 p-1 sm:p-2 text-gray-800 hover:bg-gray-100 shadow-md border border-gray-200"
                            onClick={closeImageModal}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="h-[70vh] sm:h-[80vh] max-w-[90vw] flex items-center justify-center">
                            <img
                                src={selectedImage}
                                alt="Ürün görseli"
                                className="max-h-full max-w-full object-contain shadow-xl rounded-lg border border-gray-200 bg-white p-3"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 