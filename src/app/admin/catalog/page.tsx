"use client";

import { useEffect, useRef, useState } from "react";

type Category = {
    id: string;
    name: string;
    parentId: string | null;
    image?: string;
};

type Product = {
    id: string;
    name: string;
    categoryId: string;
    price: string;
    stock: string;
    image?: string;
    status: "Aktif" | "Taslak";
};

const initialCategories: Category[] = [
    { id: "celik", name: "Çelik Ürünlerimiz", parentId: null, image: "/catalog/categories/category-01-steel-family.png" },
    { id: "celik-kupe", name: "Çelik Küpe", parentId: "celik", image: "/catalog/categories/category-02-steel-earrings.png" },
    { id: "celik-bileklik", name: "Çelik Bileklik", parentId: "celik", image: "/catalog/categories/category-03-steel-bracelets.png" },
    { id: "celik-kolye", name: "Çelik Kolye", parentId: "celik", image: "/catalog/categories/category-04-steel-necklaces.png" },
    { id: "ysx", name: "YSX Ürünlerimiz", parentId: null, image: "/catalog/categories/category-05-ysx.png" },
    { id: "vip", name: "VIP Ürünlerimiz", parentId: null, image: "/catalog/categories/category-06-vip-series.png" },
];

const initialProducts: Product[] = [
    { id: "p1", name: "Minimal Halka Küpe", categoryId: "celik-kupe", price: "70", stock: "24", image: "/catalog/categories/category-02-steel-earrings.png", status: "Aktif" },
    { id: "p2", name: "Zarif Çelik Bileklik", categoryId: "celik-bileklik", price: "80", stock: "16", image: "/catalog/categories/category-03-steel-bracelets.png", status: "Aktif" },
];

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replaceAll("ç", "c")
        .replaceAll("ğ", "g")
        .replaceAll("ı", "i")
        .replaceAll("ö", "o")
        .replaceAll("ş", "s")
        .replaceAll("ü", "u")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

const childrenOf = (categories: Category[], parentId: string | null) =>
    categories.filter((category) => category.parentId === parentId);

const categoryPath = (categories: Category[], category: Category) => {
    const parts = [category.name];
    let current = category;

    while (current.parentId) {
        const parent = categories.find((item) => item.id === current.parentId);
        if (!parent) break;
        parts.unshift(parent.name);
        current = parent;
    }

    return parts.join(" / ");
};

export default function CatalogAdminPage() {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategories[0].id);
    const [categoryForm, setCategoryForm] = useState({ name: "", parentId: "root", image: "" });
    const [productForm, setProductForm] = useState({ name: "", price: "", stock: "", image: "" });
    const categoryImageRef = useRef<HTMLInputElement>(null);
    const productImageRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await fetch("/api/catalog/categories", { cache: "no-store" });
                const result = await response.json();

                if (result.success && Array.isArray(result.data) && result.data.length) {
                    setCategories(result.data);
                    setSelectedCategoryId(result.data[0].id);
                }
            } catch (error) {
                console.error("Kategoriler yüklenemedi:", error);
            }
        };

        loadCategories();
    }, []);

    const persistCategories = async (nextCategories: Category[]) => {
        try {
            await fetch("/api/catalog/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categories: nextCategories }),
            });
        } catch (error) {
            console.error("Kategoriler kaydedilemedi:", error);
        }
    };

    const selectedCategory = categories.find((category) => category.id === selectedCategoryId) ?? categories[0];
    const visibleProducts = products.filter((product) => product.categoryId === selectedCategory.id);
    const rootCategories = childrenOf(categories, null);

    const previewFile = (file: File | undefined, callback: (src: string) => void) => {
        if (!file || !file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = () => callback(String(reader.result));
        reader.readAsDataURL(file);
    };

    const addCategory = () => {
        const name = categoryForm.name.trim();
        if (!name) return;

        const baseId = slugify(name) || `kategori-${Date.now()}`;
        const id = categories.some((category) => category.id === baseId)
            ? `${baseId}-${Date.now()}`
            : baseId;

        const parentId = categoryForm.parentId === "root" ? null : categoryForm.parentId;
        const nextCategories = [
            ...categories,
            { id, name, parentId, image: categoryForm.image || undefined },
        ];

        setCategories(nextCategories);
        persistCategories(nextCategories);
        setSelectedCategoryId(id);
        setCategoryForm({ name: "", parentId: parentId ?? "root", image: "" });
        if (categoryImageRef.current) categoryImageRef.current.value = "";
    };

    const addProduct = () => {
        const name = productForm.name.trim();
        if (!name) return;

        setProducts((current) => [
            ...current,
            {
                id: `urun-${Date.now()}`,
                name,
                categoryId: selectedCategory.id,
                price: productForm.price,
                stock: productForm.stock,
                image: productForm.image || selectedCategory.image,
                status: "Aktif",
            },
        ]);
        setProductForm({ name: "", price: "", stock: "", image: "" });
        if (productImageRef.current) productImageRef.current.value = "";
    };

    return (
        <div className="space-y-6">
            <section className="flex flex-col gap-5 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/35">
                        Katalog Yönetimi
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-black sm:text-5xl">
                        Kategoriler ve ürünler.
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-black/50">
                        Kategorileri oluşturun, ürünleri doğru kategoriye yükleyin ve katalog
                        yapısını tek panelden yönetin.
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
                    <div className="rounded-2xl bg-[#f7f4ef] p-4">
                        <span className="block text-2xl font-semibold text-black">{rootCategories.length}</span>
                        <span className="mt-1 block text-xs text-black/45">ana kategori</span>
                    </div>
                    <div className="rounded-2xl bg-[#f7f4ef] p-4">
                        <span className="block text-2xl font-semibold text-black">{categories.length}</span>
                        <span className="mt-1 block text-xs text-black/45">kategori</span>
                    </div>
                    <div className="rounded-2xl bg-[#f7f4ef] p-4">
                        <span className="block text-2xl font-semibold text-black">{products.length}</span>
                        <span className="mt-1 block text-xs text-black/45">ürün</span>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
                <aside className="space-y-6">
                    <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-black/5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-black/40">
                                Kategori Listesi
                            </h2>
                            <button
                                onClick={() => setCategoryForm((current) => ({ ...current, parentId: "root" }))}
                                className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white"
                            >
                                Ana kategori
                            </button>
                        </div>

                        <div className="space-y-3">
                            {rootCategories.map((root) => {
                                const children = childrenOf(categories, root.id);
                                const isSelected = selectedCategory.id === root.id;

                                return (
                                    <div key={root.id}>
                                        <button
                                            onClick={() => setSelectedCategoryId(root.id)}
                                            className={`grid w-full grid-cols-[64px_1fr] items-center gap-3 rounded-2xl p-2 text-left transition ${
                                                isSelected ? "bg-black text-white" : "bg-[#faf8f3] text-black hover:bg-[#f3eee6]"
                                            }`}
                                        >
                                            <span className="h-16 overflow-hidden rounded-xl bg-black/5">
                                                {root.image ? <img src={root.image} alt="" className="h-full w-full object-cover" /> : null}
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-semibold">{root.name}</span>
                                                <span className={`mt-1 block text-xs ${isSelected ? "text-white/50" : "text-black/40"}`}>
                                                    {children.length} alt kategori
                                                </span>
                                            </span>
                                        </button>

                                        {children.length ? (
                                            <div className="ml-5 mt-2 space-y-2 border-l border-black/10 pl-3">
                                                {children.map((child) => (
                                                    <button
                                                        key={child.id}
                                                        onClick={() => setSelectedCategoryId(child.id)}
                                                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                                                            selectedCategory.id === child.id
                                                                ? "bg-black text-white"
                                                                : "text-black/62 hover:bg-[#faf8f3] hover:text-black"
                                                        }`}
                                                    >
                                                        <span className="truncate">{child.name}</span>
                                                        <span className={selectedCategory.id === child.id ? "text-white/45" : "text-black/35"}>
                                                            {products.filter((product) => product.categoryId === child.id).length}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-black/5">
                        <h2 className="text-lg font-semibold tracking-[-0.03em] text-black">Kategori ekle</h2>
                        <div className="mt-4 space-y-3">
                            <input
                                value={categoryForm.name}
                                onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
                                placeholder="Kategori adı"
                                className="w-full rounded-2xl border border-black/10 bg-[#faf8f3] px-4 py-3 text-sm outline-none focus:border-black/30"
                            />
                            <select
                                value={categoryForm.parentId}
                                onChange={(event) => setCategoryForm((current) => ({ ...current, parentId: event.target.value }))}
                                className="w-full rounded-2xl border border-black/10 bg-[#faf8f3] px-4 py-3 text-sm outline-none focus:border-black/30"
                            >
                                <option value="root">Ana kategori olarak ekle</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {categoryPath(categories, category)} altına ekle
                                    </option>
                                ))}
                            </select>
                            <input
                                ref={categoryImageRef}
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                    previewFile(event.target.files?.[0], (src) =>
                                        setCategoryForm((current) => ({ ...current, image: src }))
                                    )
                                }
                                className="block w-full text-sm text-black/45 file:mr-4 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                            />
                            {categoryForm.image ? (
                                <img src={categoryForm.image} alt="" className="h-36 w-full rounded-3xl object-cover" />
                            ) : null}
                            <button onClick={addCategory} className="w-full rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white">
                                Kategoriyi kaydet
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="space-y-6">
                    <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                {selectedCategory.image ? (
                                    <img src={selectedCategory.image} alt="" className="h-20 w-20 rounded-2xl object-cover" />
                                ) : null}
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
                                        Seçili kategori
                                    </p>
                                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">
                                        {selectedCategory.name}
                                    </h2>
                                    <p className="mt-1 text-sm text-black/45">
                                        {categoryPath(categories, selectedCategory)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setCategoryForm((current) => ({ ...current, parentId: selectedCategory.id }))}
                                className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
                            >
                                Alt kategori ekle
                            </button>
                        </div>
                    </div>

                    <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
                        <h3 className="text-lg font-semibold tracking-[-0.03em] text-black">Ürün ekle</h3>
                        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_120px_120px]">
                            <input
                                value={productForm.name}
                                onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                                placeholder="Ürün adı"
                                className="rounded-2xl border border-black/10 bg-[#faf8f3] px-4 py-3 text-sm outline-none focus:border-black/30"
                            />
                            <input
                                value={productForm.price}
                                onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
                                placeholder="Fiyat"
                                inputMode="decimal"
                                className="rounded-2xl border border-black/10 bg-[#faf8f3] px-4 py-3 text-sm outline-none focus:border-black/30"
                            />
                            <input
                                value={productForm.stock}
                                onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))}
                                placeholder="Stok"
                                inputMode="numeric"
                                className="rounded-2xl border border-black/10 bg-[#faf8f3] px-4 py-3 text-sm outline-none focus:border-black/30"
                            />
                        </div>
                        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                            <input
                                ref={productImageRef}
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                    previewFile(event.target.files?.[0], (src) =>
                                        setProductForm((current) => ({ ...current, image: src }))
                                    )
                                }
                                className="block flex-1 text-sm text-black/45 file:mr-4 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                            />
                            <button onClick={addProduct} className="rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white">
                                Ürünü kaydet
                            </button>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5">
                        <div className="flex items-center justify-between border-b border-black/10 p-5">
                            <h3 className="text-lg font-semibold tracking-[-0.03em] text-black">Ürün listesi</h3>
                            <span className="text-sm text-black/45">{visibleProducts.length} ürün</span>
                        </div>
                        <div className="divide-y divide-black/8">
                            {visibleProducts.length ? (
                                visibleProducts.map((product) => (
                                    <div key={product.id} className="grid grid-cols-[64px_1fr_auto] items-center gap-4 p-4">
                                        <span className="h-16 overflow-hidden rounded-2xl bg-[#faf8f3]">
                                            {product.image ? <img src={product.image} alt="" className="h-full w-full object-cover" /> : null}
                                        </span>
                                        <div>
                                            <p className="font-semibold tracking-[-0.02em] text-black">{product.name}</p>
                                            <p className="mt-1 text-sm text-black/45">{product.price || "0"} TL · {product.stock || "0"} stok</p>
                                        </div>
                                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            {product.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-sm text-black/45">
                                    Bu kategoride henüz ürün yok.
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </section>
        </div>
    );
}
