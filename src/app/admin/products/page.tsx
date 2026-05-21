"use client";

import { useState, useEffect, useRef } from "react";
import { IProduct } from "@/models/Product";
import { useToast } from "@/providers/toast-provider";

type CatalogCategory = {
    id: string;
    title: string;
    parentId: string | null;
};

type CatalogProduct = {
    id: string;
    name: string;
    code?: string;
    categoryId: string;
    imageSrc?: string;
    purchasePrice?: number;
    price: number;
    compareAtPrice?: number;
    stock: number;
    supplier?: string;
    isActive?: boolean;
};

type AdminProductListItem = IProduct & {
    source?: "legacy" | "catalog";
    catalogId?: string;
    catalogCategoryId?: string;
    catalogCode?: string;
    compareAtPrice?: number;
    isActive?: boolean;
};

type CatalogManageMode = "menu" | "edit" | "stock" | "discount";

const buildCategoryPath = (
    categoryId: string,
    categoriesById: Map<string, CatalogCategory>
) => {
    const titles: string[] = [];
    const visited = new Set<string>();
    let current = categoriesById.get(categoryId);

    while (current && !visited.has(current.id)) {
        visited.add(current.id);
        titles.unshift(current.title);
        current = current.parentId ? categoriesById.get(current.parentId) : undefined;
    }

    return titles.join(" / ") || "Katalog";
};

const mapCatalogProduct = (
    product: CatalogProduct,
    categoriesById: Map<string, CatalogCategory>
): AdminProductListItem => ({
    id: `catalog:${product.id}`,
    _id: `catalog:${product.id}`,
    name: product.name,
    wholesalePrice: product.purchasePrice || 0,
    salePrice: product.price || 0,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock || 0,
    category: buildCategoryPath(product.categoryId, categoriesById),
    image: product.imageSrc,
    supplier: product.supplier || "",
    source: "catalog",
    catalogId: product.id,
    catalogCategoryId: product.categoryId,
    catalogCode: product.code,
    isActive: product.isActive !== false,
});

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

function CatalogManageOption({
    title,
    description,
    onClick,
}: {
    title: string;
    description: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex min-h-14 items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 text-left shadow-sm transition active:scale-[0.99]"
        >
            <span className="min-w-0">
                <span className="block text-sm font-semibold text-black">{title}</span>
                <span className="mt-0.5 block truncate text-xs font-medium text-black/42">
                    {description}
                </span>
            </span>
            <span className="text-lg text-black/28">›</span>
        </button>
    );
}

function CatalogManageField({
    label,
    helper,
    children,
}: {
    label: string;
    helper?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="grid gap-2">
            <span className="px-0.5 text-[12px] font-semibold leading-none text-black/56">{label}</span>
            {children}
            {helper ? <span className="px-0.5 text-[11px] font-medium leading-4 text-black/36">{helper}</span> : null}
        </label>
    );
}

export default function ProductsPage() {
    const { showToast } = useToast();
    // State tanımlamaları
    const [products, setProducts] = useState<AdminProductListItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<AdminProductListItem | null>(null);
    const [formData, setFormData] = useState({
        name: "",
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
    const [managedProduct, setManagedProduct] = useState<AdminProductListItem | null>(null);
    const [catalogManageMode, setCatalogManageMode] = useState<CatalogManageMode>("menu");
    const [manageForm, setManageForm] = useState({
        name: "",
        code: "",
        purchasePrice: "",
        salePrice: "",
        compareAtPrice: "",
        discountRate: "",
        stock: "",
        supplier: "",
    });
    const [catalogActionSubmitting, setCatalogActionSubmitting] = useState(false);

    useEffect(() => {
        if (error) {
            showToast({ message: error, tone: "error" });
        }
    }, [error, showToast]);

    useEffect(() => {
        if (formError) {
            showToast({ message: formError, tone: "error" });
        }
    }, [formError, showToast]);

    // Ürünleri API'den getir
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const [legacyResponse, catalogResponse] = await Promise.all([
                    fetch("/api/products?source=legacy"),
                    fetch("/api/admin/catalog"),
                ]);
                const legacyResult = await legacyResponse.json();
                const catalogResult = await catalogResponse.json();

                if (legacyResult.success) {
                    const legacyProducts = (legacyResult.data as IProduct[]).map((product) => ({
                        ...product,
                        source: "legacy" as const,
                    }));
                    const catalogCategories = (catalogResult.success
                        ? catalogResult.data?.categories || []
                        : []) as CatalogCategory[];
                    const catalogProducts = (catalogResult.success
                        ? catalogResult.data?.products || []
                        : []) as CatalogProduct[];
                    const categoriesById = new Map(
                        catalogCategories.map((category) => [category.id, category])
                    );
                    const mappedCatalogProducts = catalogProducts.map((product) =>
                        mapCatalogProduct(product, categoriesById)
                    );

                    setProducts([...legacyProducts, ...mappedCatalogProducts]);
                } else {
                    setError(legacyResult.error || "Ürünler yüklenirken bir hata oluştu");
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
                    const productCategories = products
                        .map((product) => product.category)
                        .filter(Boolean);
                    setCategories(
                        Array.from(new Set([...result.data, ...productCategories])).sort((a, b) =>
                            a.localeCompare(b, "tr-TR")
                        )
                    );
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

    // Düzenleme formunu göster
    const handleShowEditForm = (product: AdminProductListItem) => {
        if (product.source === "catalog") {
            openCatalogManagement(product);
            return;
        }

        setFormData({
            name: product.name,
            wholesalePrice: product.wholesalePrice?.toString() || "",
            salePrice: product.salePrice.toString(),
            stock: (product.stock ?? 0).toString(),
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
                            p._id === editingProduct._id ? { ...result.data, source: "legacy" } : p
                        )
                    );
                } else {
                    // Yeni ürün ekle
                    setProducts((prev) => [...prev, { ...result.data, source: "legacy" }]);
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
        if (id.startsWith("catalog:")) {
            const product = products.find((item) => (item.id || item._id) === id);
            if (product) openCatalogManagement(product);
            return;
        }

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
                setError(result.error || "Ürün silinirken bir hata oluştu");
            }
        } catch (err) {
            setError("Sunucu ile bağlantı kurulamadı");
            console.error(err);
        }
    };

    const openCatalogManagement = (product: AdminProductListItem) => {
        setManagedProduct(product);
        setCatalogManageMode("menu");
        setManageForm({
            name: product.name || "",
            code: product.catalogCode || "",
            purchasePrice: String(product.wholesalePrice || ""),
            salePrice: String(product.salePrice || ""),
            compareAtPrice: String(product.salePrice || ""),
            discountRate: "",
            stock: String(product.stock ?? 0),
            supplier: product.supplier || "",
        });
    };

    const openDiscountManagement = () => {
        if (!managedProduct) return;

        setManageForm((current) => ({
            ...current,
            compareAtPrice: String(managedProduct.salePrice || ""),
            salePrice: "",
            discountRate: "",
        }));
        setCatalogManageMode("discount");
    };

    const closeCatalogManagement = () => {
        setManagedProduct(null);
        setCatalogManageMode("menu");
    };

    const readPositiveNumber = (value: string) => {
        const normalized = value.trim().replace(",", ".");
        const numberValue = Number(normalized);
        return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
    };

    const formatFormNumber = (value: number, fractionDigits = 2) => {
        if (!Number.isFinite(value) || value <= 0) return "";
        return value
            .toFixed(fractionDigits)
            .replace(/\.?0+$/, "");
    };

    const handleDiscountBasePriceChange = (value: string) => {
        const currentPrice = readPositiveNumber(value);
        const newPrice = readPositiveNumber(manageForm.salePrice);
        const rate =
            currentPrice > 0 && newPrice > 0 && newPrice < currentPrice
                ? formatFormNumber((1 - newPrice / currentPrice) * 100, 1)
                : "";

        setManageForm((current) => ({
            ...current,
            compareAtPrice: value,
            discountRate: rate,
        }));
    };

    const handleDiscountSalePriceChange = (value: string) => {
        const currentPrice = readPositiveNumber(manageForm.compareAtPrice);
        const newPrice = readPositiveNumber(value);
        const rate =
            currentPrice > 0 && newPrice > 0 && newPrice < currentPrice
                ? formatFormNumber((1 - newPrice / currentPrice) * 100, 1)
                : "";

        setManageForm((current) => ({
            ...current,
            salePrice: value,
            discountRate: rate,
        }));
    };

    const handleDiscountRateChange = (value: string) => {
        const currentPrice = readPositiveNumber(manageForm.compareAtPrice);
        const rate = Math.min(readPositiveNumber(value), 100);
        const nextSalePrice =
            currentPrice > 0 && rate > 0 && rate < 100
                ? formatFormNumber(currentPrice * (1 - rate / 100), 2)
                : "";

        setManageForm((current) => ({
            ...current,
            discountRate: value,
            salePrice: nextSalePrice || current.salePrice,
        }));
    };

    const updateCatalogProduct = async (
        product: AdminProductListItem,
        updates: Partial<{
            name: string;
            code: string;
            purchasePrice: number;
            salePrice: number;
            compareAtPrice: number;
            stock: number;
            supplier: string;
            isActive: boolean;
        }>
    ) => {
        if (!product.catalogId || !product.catalogCategoryId) return false;

        setCatalogActionSubmitting(true);
        setError(null);

        try {
            const nextName = updates.name ?? product.name;
            const nextCode = updates.code ?? product.catalogCode ?? product.catalogId;
            const nextPurchasePrice = updates.purchasePrice ?? product.wholesalePrice ?? 0;
            const nextSalePrice = updates.salePrice ?? product.salePrice ?? 0;
            const nextCompareAtPrice = updates.compareAtPrice ?? product.compareAtPrice ?? 0;
            const nextStock = updates.stock ?? product.stock ?? 0;
            const nextSupplier = updates.supplier ?? product.supplier ?? "";
            const nextIsActive = updates.isActive ?? product.isActive !== false;

            const response = await fetch("/api/admin/catalog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "update-product",
                    id: product.catalogId,
                    product: {
                        name: nextName,
                        code: nextCode,
                        categoryId: product.catalogCategoryId,
                        imageSrc: product.image || "",
                        purchasePrice: nextPurchasePrice,
                        price: nextSalePrice,
                        compareAtPrice: nextCompareAtPrice,
                        stock: nextStock,
                        supplier: nextSupplier,
                        isActive: nextIsActive,
                    },
                }),
            });
            const result = await response.json().catch(() => null);
            if (!response.ok || !result.success) {
                throw new Error(result?.error || "Ürün güncellenemedi");
            }

            setProducts((current) =>
                current.map((item) =>
                    item.catalogId === product.catalogId
                        ? {
                              ...item,
                              name: nextName,
                              wholesalePrice: nextPurchasePrice,
                              salePrice: nextSalePrice,
                              compareAtPrice: nextCompareAtPrice || undefined,
                              stock: nextStock,
                              supplier: nextSupplier,
                              catalogCode: nextCode,
                              isActive: nextIsActive,
                          }
                        : item
                )
            );
            setManagedProduct((current) =>
                current?.catalogId === product.catalogId
                    ? {
                          ...current,
                          name: nextName,
                          wholesalePrice: nextPurchasePrice,
                          salePrice: nextSalePrice,
                          compareAtPrice: nextCompareAtPrice || undefined,
                          stock: nextStock,
                          supplier: nextSupplier,
                          catalogCode: nextCode,
                          isActive: nextIsActive,
                      } as AdminProductListItem
                    : current
            );
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ürün güncellenemedi");
            return false;
        } finally {
            setCatalogActionSubmitting(false);
        }
    };

    const submitCatalogManagement = async () => {
        if (!managedProduct) return;
        let isSaved = false;
        let successMessage = "Ürün güncellendi.";

        if (catalogManageMode === "stock") {
            isSaved = await updateCatalogProduct(managedProduct, {
                stock: Math.max(Math.floor(readPositiveNumber(manageForm.stock)), 0),
            });
            successMessage = "Stok güncellendi.";
        } else if (catalogManageMode === "discount") {
            const currentPrice = readPositiveNumber(manageForm.compareAtPrice);
            const typedNewPrice = readPositiveNumber(manageForm.salePrice);
            const discountRate = Math.min(readPositiveNumber(manageForm.discountRate), 100);

            if (!currentPrice) {
                setError("Şu anki fiyat zorunludur.");
                return;
            }

            const nextSalePrice =
                typedNewPrice || (discountRate ? currentPrice * (1 - discountRate / 100) : 0);

            if (!nextSalePrice || nextSalePrice >= currentPrice) {
                setError("Yeni fiyat şu anki fiyattan düşük olmalıdır.");
                return;
            }

            isSaved = await updateCatalogProduct(managedProduct, {
                salePrice: Number(nextSalePrice.toFixed(2)),
                compareAtPrice: currentPrice,
            });
            successMessage = "İndirim güncellendi.";
        } else {
            const nextName = manageForm.name.trim();
            const nextCode = manageForm.code.trim() || managedProduct.catalogCode || managedProduct.catalogId || "";
            if (!nextName || !nextCode) {
                setError("Ürün adı ve kodu zorunludur.");
                return;
            }

            isSaved = await updateCatalogProduct(managedProduct, {
                name: nextName,
                code: nextCode,
                supplier: manageForm.supplier.trim(),
            });
        }

        if (isSaved) {
            closeCatalogManagement();
            showToast(successMessage);
        }
    };

    const deleteCatalogProduct = async (product: AdminProductListItem) => {
        if (!product.catalogId) return;
        if (!window.confirm("Bu katalog ürününü silmek istediğinize emin misiniz?")) return;

        setCatalogActionSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/admin/catalog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "delete-product",
                    id: product.catalogId,
                }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.error || "Ürün silinemedi");
            }

            setProducts((current) =>
                current.filter((item) => item.catalogId !== product.catalogId)
            );
            setManagedProduct(null);
            showToast("Ürün silindi.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ürün silinemedi");
        } finally {
            setCatalogActionSubmitting(false);
        }
    };

    // Arama ve kategori filtreleme
    const filteredProducts = products.filter((product) => {
        const matchesSearch = searchTerm
            ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.supplier ? product.supplier.toLowerCase().includes(searchTerm.toLowerCase()) : false)
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

    const discountCurrentPrice = readPositiveNumber(manageForm.compareAtPrice);
    const discountTypedNewPrice = readPositiveNumber(manageForm.salePrice);
    const discountRate = Math.min(readPositiveNumber(manageForm.discountRate), 100);
    const discountCalculatedPrice =
        discountTypedNewPrice ||
        (discountCurrentPrice > 0 && discountRate > 0
            ? discountCurrentPrice * (1 - discountRate / 100)
            : 0);
    const discountSaving =
        discountCurrentPrice > 0 && discountCalculatedPrice > 0
            ? Math.max(discountCurrentPrice - discountCalculatedPrice, 0)
            : 0;
    const discountPercent =
        discountCurrentPrice > 0 && discountCalculatedPrice > 0
            ? Math.round((1 - discountCalculatedPrice / discountCurrentPrice) * 100)
            : 0;

    return (
        <div className="space-y-5 text-[#171411]">
            {/* Global CSS style tag */}
            <style jsx global>{scrollbarHideStyles}</style>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/38">
                        Stok ve fiyat takibi
                    </p>
                    <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.04em] text-black">
                        Ürünler
                    </h1>
                </div>
                <a
                    href="/admin/catalog"
                    className="inline-flex h-10 items-center justify-center rounded-full bg-black px-4 text-sm font-semibold text-white transition active:scale-[0.98]"
                >
                    Katalogda ürün ekle
                </a>
            </div>

            {/* Arama ve filtreleme */}
            <div className="grid gap-3 rounded-[28px] border border-black/[0.08] bg-white/70 p-3 shadow-[0_18px_55px_rgba(30,24,17,0.06)] sm:grid-cols-[1fr_260px]">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Ürün adı, kod veya açıklama ara"
                        className="h-12 w-full rounded-2xl border border-black/[0.08] bg-[#f8f6f2] px-4 pl-11 text-sm font-medium text-black outline-none transition placeholder:text-black/32 focus:border-black/24"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-black/35">
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

                <div className="w-full">
                    <select
                        className="h-12 w-full rounded-2xl border border-black/[0.08] bg-[#f8f6f2] px-4 text-sm font-semibold text-black/72 outline-none transition focus:border-black/24"
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

            {/* Yükleniyor göstergesi */}
            {loading ? (
                <div className="flex justify-center py-6 sm:py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-black"></div>
                </div>
            ) : (
                <>
                    {/* Ürün tablosu */}
                    {products.length === 0 ? (
                        <div className="rounded-[28px] border border-black/[0.08] bg-white/70 p-8 text-center">
                            <p className="text-sm font-semibold text-black/55">
                                Henüz kayıtlı ürün bulunmuyor.
                            </p>
                            <a
                                href="/admin/catalog"
                                className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-black px-4 text-sm font-semibold text-white"
                            >
                                Katalogda ürün ekle
                            </a>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-[28px] border border-black/[0.08] bg-white/80 shadow-[0_18px_55px_rgba(30,24,17,0.06)]">
                            <table className="min-w-full divide-y divide-black/[0.08]">
                                <thead className="bg-[#f8f6f2]">
                                    <tr className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/46">
                                        <th scope="col" className="px-5 py-4 text-left">
                                            Ürün
                                        </th>
                                        <th scope="col" className="hidden px-5 py-4 text-left sm:table-cell">
                                            Kategori
                                        </th>
                                        <th scope="col" className="px-5 py-4 text-left">
                                                    Fiyat
                                        </th>
                                        <th scope="col" className="hidden px-5 py-4 text-left sm:table-cell">
                                            Stok
                                        </th>
                                        <th scope="col" className="hidden px-5 py-4 text-left sm:table-cell">
                                                    Tedarikçi
                                                </th>
                                        <th scope="col" className="px-5 py-4 text-right">
                                                    İşlem
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/[0.08] bg-white">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id || product._id} className="transition-colors hover:bg-[#faf8f4]">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center">
                                                    {product.image ? (
                                                        <div className="mr-3 h-14 w-14 flex-shrink-0">
                                                            <img
                                                                src={product.image}
                                                                alt={product.name}
                                                                className="h-full w-full cursor-pointer rounded-2xl border border-black/[0.08] object-cover"
                                                                onClick={(e) => openImageModal(product.image || '', e)}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="mr-3 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-black/[0.08] bg-[#f8f6f2]">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black/28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <div className="max-w-[220px] truncate text-sm font-semibold text-black">
                                                            {product.name}
                                                        </div>
                                                        <div className="mt-1 hidden max-w-[260px] items-center gap-2 text-xs text-black/45 sm:flex">
                                                            {product.source === "catalog" && (
                                                                <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                                                                    Katalog
                                                                </span>
                                                            )}
                                                            <span className="truncate">{product.catalogCode || product.supplier || product.category}</span>
                                                        </div>
                                                        <div className="text-xs text-black/48 sm:hidden">
                                                            {product.category}
                                                        </div>
                                                        <div className="flex items-center text-xs text-black/48 sm:hidden">
                                                            Stok: <span className={`ml-1 ${(product.stock ?? 0) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                {(product.stock ?? 0) > 0 ? product.stock : '0'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden whitespace-nowrap px-5 py-4 sm:table-cell">
                                                <div className="inline-block rounded-full border border-black/[0.08] bg-[#f8f6f2] px-3 py-1 text-xs font-semibold text-black/65">
                                                    {product.category}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <div className="text-sm font-semibold text-black">{formatCurrency(product.salePrice)}</div>
                                            </td>
                                            <td className="hidden whitespace-nowrap px-5 py-4 sm:table-cell">
                                                <div
                                                    className={`text-sm font-semibold ${(product.stock ?? 0) > 10
                                                        ? "text-emerald-600"
                                                        : (product.stock ?? 0) > 0
                                                            ? "text-amber-600"
                                                            : "text-red-600 font-bold"
                                                        }`}
                                                >
                                                    {(product.stock ?? 0) > 0 ? product.stock :
                                                        <span className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            </svg>
                                                            0
                                                        </span>}
                                                </div>
                                            </td>
                                            <td className="hidden whitespace-nowrap px-5 py-4 sm:table-cell">
                                                <div className="text-sm font-medium text-black/52">
                                                    {product.supplier || "-"}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium">
                                                {product.source === "catalog" ? (
                                                    <button
                                                        onClick={() => {
                                                            openCatalogManagement(product);
                                                        }}
                                                        className="rounded-full border border-black/[0.10] px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:border-black hover:bg-black hover:text-white"
                                                    >
                                                        Yönet
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleShowEditForm(product)}
                                                            className="mr-3 text-black transition-colors hover:text-black/60"
                                                        >
                                                            <span className="hidden sm:inline">Düzenle</span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct((product.id || product._id) as string)}
                                                            className="text-black/45 transition-colors hover:text-red-600"
                                                        >
                                                            <span className="hidden sm:inline">Sil</span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </>
                                                )}
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

            {managedProduct && (
                <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/20 p-4 backdrop-blur-[2px] sm:items-center">
                    <button
                        type="button"
                        aria-label="Ürün yönetimini kapat"
                        className="absolute inset-0"
                        onClick={closeCatalogManagement}
                    />
                    <div className="relative w-full max-w-md rounded-[28px] border border-black/[0.08] bg-white p-5 shadow-[0_26px_80px_rgba(17,24,39,0.18)]">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/36">
                                    Katalog ürünü
                                </p>
                                <h2 className="mt-1 truncate text-xl font-semibold tracking-[-0.03em] text-black">
                                    {managedProduct.name}
                                </h2>
                                <p className="mt-1 text-sm font-medium text-black/48">
                                    Stok: {managedProduct.stock ?? 0} · {formatCurrency(managedProduct.salePrice)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeCatalogManagement}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-lg leading-none text-black/55"
                            >
                                ×
                            </button>
                        </div>

                        {catalogManageMode === "menu" ? (
                            <div className="mt-5 grid gap-2">
                                <CatalogManageOption
                                    title="Düzenle"
                                    description="Ürün adı, kodu ve tedarikçi"
                                    onClick={() => setCatalogManageMode("edit")}
                                />
                                <CatalogManageOption
                                    title="Stok yönet"
                                    description="Stok adedini manuel güncelle"
                                    onClick={() => setCatalogManageMode("stock")}
                                />
                                <CatalogManageOption
                                    title="İndirim oluştur"
                                    description="Yeni fiyat veya oran ile indirim gir"
                                    onClick={openDiscountManagement}
                                />
                                <button
                                    type="button"
                                    disabled={catalogActionSubmitting}
                                    onClick={async () => {
                                        const isSaved = await updateCatalogProduct(managedProduct, {
                                            isActive: managedProduct.isActive === false,
                                        });
                                        if (isSaved) {
                                            closeCatalogManagement();
                                            showToast(
                                                managedProduct.isActive === false
                                                    ? "Ürün katalogda gösteriliyor."
                                                    : "Ürün katalogdan gizlendi."
                                            );
                                        }
                                    }}
                                    className="flex h-14 items-center justify-between rounded-2xl bg-white px-4 text-sm font-semibold text-black shadow-sm disabled:opacity-50"
                                >
                                    {managedProduct.isActive === false
                                        ? "Katalogda göster"
                                        : "Katalogdan gizle"}
                                    <span className="text-black/35">
                                        {managedProduct.isActive === false ? "Aktif" : "Pasif"}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    disabled={catalogActionSubmitting}
                                    onClick={() => deleteCatalogProduct(managedProduct)}
                                    className="flex h-14 items-center justify-between rounded-2xl border border-red-500/20 bg-red-50 px-4 text-sm font-semibold text-red-600 disabled:opacity-50"
                                >
                                    Ürünü sil
                                    <span>Sil</span>
                                </button>
                            </div>
                        ) : (
                            <div className="mt-5 grid gap-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="text-[18px] font-semibold tracking-[-0.03em] text-black">
                                            {catalogManageMode === "edit"
                                                ? "Ürün bilgileri"
                                                : catalogManageMode === "stock"
                                                  ? "Stok yönet"
                                                  : "İndirim oluştur"}
                                        </h3>
                                        <p className="mt-1 text-sm font-medium leading-5 text-black/48">
                                            {catalogManageMode === "edit"
                                                ? "Katalogda görünen temel ürün bilgilerini düzenleyin."
                                                : catalogManageMode === "stock"
                                                  ? "Güncel stok adedini doğrudan yazın."
                                                  : "Eski fiyatı baz alın. Yeni fiyatı elle yazabilir ya da oran girerek otomatik hesaplatabilirsiniz."}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setCatalogManageMode("menu")}
                                        className="shrink-0 rounded-full border border-black/[0.08] bg-[#f5f6f8] px-3 py-1.5 text-xs font-semibold text-black/58 transition hover:bg-black hover:text-white"
                                    >
                                        İşlemlere dön
                                    </button>
                                </div>
                                {catalogManageMode === "edit" ? (
                                    <div className="grid gap-3 rounded-3xl bg-[#f5f6f8] p-3">
                                        <CatalogManageField label="Ürün adı">
                                            <input
                                                value={manageForm.name}
                                                onChange={(event) =>
                                                    setManageForm((current) => ({ ...current, name: event.target.value }))
                                                }
                                                className="h-12 rounded-2xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-black outline-none focus:border-black/24"
                                                placeholder="Ürün adı"
                                            />
                                        </CatalogManageField>
                                        <CatalogManageField label="Ürün kodu">
                                            <input
                                                value={manageForm.code}
                                                onChange={(event) =>
                                                    setManageForm((current) => ({ ...current, code: event.target.value }))
                                                }
                                                className="h-12 rounded-2xl border border-black/[0.08] bg-white px-4 text-sm font-medium text-black outline-none focus:border-black/24"
                                                placeholder="Ürün kodu"
                                            />
                                        </CatalogManageField>
                                        <CatalogManageField label="Tedarikçi">
                                            <input
                                                value={manageForm.supplier}
                                                onChange={(event) =>
                                                    setManageForm((current) => ({ ...current, supplier: event.target.value }))
                                                }
                                                className="h-12 rounded-2xl border border-black/[0.08] bg-white px-4 text-sm font-medium text-black outline-none focus:border-black/24"
                                                placeholder="Tedarikçi adı"
                                            />
                                        </CatalogManageField>
                                    </div>
                                ) : catalogManageMode === "stock" ? (
                                    <div className="grid gap-3 rounded-3xl bg-[#f5f6f8] p-3">
                                        <CatalogManageField label="Güncel stok" helper="Artır/azalt yerine net stok adedini yazın.">
                                            <input
                                                value={manageForm.stock}
                                                onChange={(event) =>
                                                    setManageForm((current) => ({ ...current, stock: event.target.value }))
                                                }
                                                inputMode="numeric"
                                                className="h-14 rounded-2xl border border-black/[0.08] bg-white px-4 text-lg font-semibold text-black outline-none focus:border-black/24"
                                                placeholder="Stok"
                                            />
                                        </CatalogManageField>
                                        <div className="rounded-2xl bg-white p-3 text-sm font-medium text-black/52">
                                            Mevcut kayıt: <span className="font-semibold text-black">{managedProduct.stock ?? 0} adet</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid gap-3 rounded-3xl bg-[#f5f6f8] p-3">
                                            <CatalogManageField label="Şu anki fiyat" helper="İndirim etiketi için gösterilecek eski fiyat.">
                                                <input
                                                    value={manageForm.compareAtPrice}
                                                    onChange={(event) => handleDiscountBasePriceChange(event.target.value)}
                                                    inputMode="decimal"
                                                    className="h-12 rounded-2xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-black outline-none focus:border-black/24"
                                                    placeholder="Örn. 150"
                                                />
                                            </CatalogManageField>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <CatalogManageField label="Yeni fiyat">
                                                    <input
                                                        value={manageForm.salePrice}
                                                        onChange={(event) => handleDiscountSalePriceChange(event.target.value)}
                                                        inputMode="decimal"
                                                        className="h-12 rounded-2xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-black outline-none focus:border-black/24"
                                                        placeholder="Örn. 120"
                                                    />
                                                </CatalogManageField>
                                                <CatalogManageField label="İndirim oranı">
                                                    <div className="relative">
                                                        <input
                                                            value={manageForm.discountRate}
                                                            onChange={(event) => handleDiscountRateChange(event.target.value)}
                                                            inputMode="decimal"
                                                            className="h-12 w-full rounded-2xl border border-black/[0.08] bg-white px-4 pr-10 text-sm font-semibold text-black outline-none focus:border-black/24"
                                                            placeholder="Örn. 20"
                                                        />
                                                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-black/36">
                                                            %
                                                        </span>
                                                    </div>
                                                </CatalogManageField>
                                            </div>
                                        </div>

                                        <div className="rounded-3xl border border-black/[0.06] bg-black/[0.035] p-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/35">
                                                        Yeni katalog fiyatı
                                                    </p>
                                                    <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-black">
                                                        {discountCalculatedPrice > 0
                                                            ? formatCurrency(discountCalculatedPrice)
                                                            : "Henüz hesaplanmadı"}
                                                    </p>
                                                </div>
                                                {discountSaving > 0 ? (
                                                    <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-sm">
                                                        <p className="text-xs font-semibold text-black/42">
                                                            %{discountPercent}
                                                        </p>
                                                        <p className="text-sm font-semibold text-emerald-700">
                                                            {formatCurrency(discountSaving)}
                                                        </p>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </>
                                )}
                                <button
                                    type="button"
                                    disabled={catalogActionSubmitting}
                                    onClick={submitCatalogManagement}
                                    className="flex h-12 items-center justify-center rounded-2xl bg-black px-4 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
                                >
                                    Kaydet
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
} 
