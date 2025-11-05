'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IProduct } from '@/models/Product';
import { useParams, useRouter } from 'next/navigation';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<IProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/products/${params.id}`);
                const result = await response.json();

                if (result.success) {
                    setProduct(result.data);
                    fetchRelatedProducts(result.data.category);
                } else {
                    setError(result.error || 'Ürün yüklenirken bir hata oluştu');
                }
            } catch (err) {
                setError('Sunucu ile bağlantı kurulamadı');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchProduct();
        }
    }, [params.id]);

    // İlgili ürünleri getir
    const fetchRelatedProducts = async (category: string) => {
        try {
            const response = await fetch('/api/products');
            const result = await response.json();

            if (result.success) {
                // Aynı kategorideki diğer ürünleri filtrele ve maksimum 4 ürün göster
                const filtered = result.data
                    .filter((p: IProduct) => p.category === category && p._id !== params.id)
                    .slice(0, 4);
                setRelatedProducts(filtered);
            }
        } catch (err) {
            console.error('İlgili ürünler yüklenirken hata:', err);
        }
    };

    // Para formatı
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(amount);
    };

    // Resim modalını aç
    const openImageModal = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setShowImageModal(true);
    };

    // Modal kapat
    const closeImageModal = () => {
        setShowImageModal(false);
        setSelectedImage(null);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
                <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-[var(--accent-silver)]"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="bg-[var(--background)] min-h-screen">
                <div className="container mx-auto px-4 py-20">
                    <div className="mx-auto max-w-2xl rounded-md bg-red-900 bg-opacity-20 p-8 text-center text-red-200 border border-red-800 shadow-md">
                        <h2 className="mb-4 text-xl font-semibold">Hata</h2>
                        <p>{error || 'Ürün bulunamadı'}</p>
                        <Link
                            href="/"
                            className="mt-6 inline-block rounded-md bg-[var(--primary-medium)] px-6 py-3 text-[var(--text-primary)] hover:bg-[var(--primary-light)] transition-all btn-hover-effect"
                        >
                            Ana Sayfaya Dön
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Structured Data for Product Page
    const productStructuredData = product ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description || `${product.name} - Zarif çelik takı`,
        "image": product.image 
            ? (product.image.startsWith('http') ? product.image : `https://kudatgroup.com${product.image}`)
            : "https://kudatgroup.com/icon.png",
        "brand": {
            "@type": "Brand",
            "name": "Kudat Steel Jewelry"
        },
        "category": product.category || "Çelik Takı",
        "offers": {
            "@type": "Offer",
            "url": `https://kudatgroup.com/products/${product._id}`,
            "priceCurrency": "TRY",
            "price": product.price || 0,
            "availability": product.stock && product.stock > 0 
                ? "https://schema.org/InStock" 
                : "https://schema.org/OutOfStock",
            "seller": {
                "@type": "Organization",
                "name": "Kudat Group"
            }
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "100"
        }
    } : null;

    return (
        <div className="flex flex-col min-h-screen bg-[var(--background)]">
            {/* Structured Data for SEO */}
            {productStructuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
                />
            )}
            <header className="fixed w-full z-40 bg-transparent">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between py-4 px-4 md:px-6">
                        <Link href="/" className="relative z-10">
                            <h1 className="text-2xl font-bold">
                                <span className="text-[var(--text-primary)]">Kudat Steel Jewelry</span>
                            </h1>
                        </Link>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-md border border-[var(--border-medium)] bg-[var(--primary-medium)] text-[var(--text-primary)]"
                            >
                                {!mobileMenuOpen ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Desktop menu */}
                        <nav className="hidden md:flex items-center space-x-6">
                            <Link href="/" className="text-[var(--text-primary)] hover:text-[var(--accent-silver)] transition-colors font-medium">
                                Ana Sayfa
                            </Link>
                            <Link href="/products" className="text-[var(--text-primary)] hover:text-[var(--accent-silver)] transition-colors font-medium">
                                Ürünler
                            </Link>
                            <Link href="/perakende-satis" className="text-[var(--text-primary)] hover:text-[var(--accent-silver)] transition-colors font-medium">
                                Perakende Satış
                            </Link>
                            <Link href="/toptan-satis" className="text-[var(--text-primary)] hover:text-[var(--accent-silver)] transition-colors font-medium">
                                Toptan Satış
                            </Link>
                            <Link href="/bulten-kayit" className="text-[var(--text-primary)] hover:text-[var(--accent-silver)] transition-colors font-medium">
                                Bülten
                            </Link>
                        </nav>
                    </div>

                    {/* Mobile menu */}
                    <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <nav className="flex flex-col px-4 pb-4 space-y-3 border-t border-[var(--border-medium)] pt-3">
                            <Link
                                href="/"
                                className="text-[var(--text-primary)] hover:text-[var(--accent-silver)] transition-colors py-2 px-3 rounded-md hover:bg-[var(--primary-medium)]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Ana Sayfa
                            </Link>
                            <Link
                                href="/products"
                                className="text-[var(--text-primary)] hover:text-[var(--accent-silver)] transition-colors py-2 px-3 rounded-md hover:bg-[var(--primary-medium)]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Ürünler
                            </Link>
                            <Link
                                href="/perakende-satis"
                                className="text-[var(--text-primary)] hover:text-[var(--accent-silver)] transition-colors py-2 px-3 rounded-md hover:bg-[var(--primary-medium)]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Perakende Satış
                            </Link>
                            <Link
                                href="/toptan-satis"
                                className="text-[var(--text-primary)] hover:text-[var(--accent-silver)] transition-colors py-2 px-3 rounded-md hover:bg-[var(--primary-medium)]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Toptan Satış
                            </Link>
                            <Link
                                href="/bulten-kayit"
                                className="text-[var(--text-primary)] hover:text-[var(--accent-silver)] transition-colors py-2 px-3 rounded-md hover:bg-[var(--primary-medium)]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Bülten
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 pt-32 pb-16">
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-silver)]"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mr-2 h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Tüm Ürünlere Dön
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-12 md:grid-cols-5">
                    {/* Ürün Görseli */}
                    <div className="md:col-span-2">
                        <div className="relative h-[400px] w-full overflow-hidden rounded-lg border border-[var(--border-medium)] bg-[var(--primary-dark)] md:h-[500px] shadow-md">
                            {product.image ? (
                                <div className="flex h-full w-full items-center justify-center">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="max-h-full max-w-full object-contain cursor-pointer transition-all hover:scale-105"
                                        onClick={() => openImageModal(product.image || '')}
                                    />
                                </div>
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-24 w-24 text-[var(--text-muted)]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ürün Detayları */}
                    <div className="md:col-span-3">
                        <div className="rounded-lg border border-[var(--border-medium)] bg-[var(--primary-dark)] p-8 shadow-md">
                            <div className="flex items-center mb-4">
                                <span className="rounded-full bg-[var(--primary-dark)] bg-opacity-80 px-3 py-1 text-sm font-medium text-[var(--accent-silver)] border border-[var(--border-medium)]">
                                    {product.category}
                                </span>
                            </div>

                            <h1 className="mb-3 text-3xl font-bold text-[var(--text-primary)] md:text-4xl">{product.name}</h1>

                            <div className="mb-6 flex items-center">
                                <span className="text-2xl font-bold text-[var(--accent-gold)]">{formatCurrency(product.salePrice)}</span>
                                {product.originalPrice && product.salePrice < product.originalPrice && (
                                    <span className="ml-3 text-lg line-through text-[var(--text-muted)]">
                                        {formatCurrency(product.originalPrice)}
                                    </span>
                                )}
                            </div>

                            <div className="border-t border-b border-[var(--border-medium)] py-6 my-6">
                                <p className="text-[var(--text-secondary)] leading-relaxed">
                                    {product.description || 'Bu ürün için açıklama bulunmuyor.'}
                                </p>
                            </div>

                            <div className="flex items-center space-x-4 mb-6">
                                <div className="text-lg font-medium text-[var(--text-primary)]">Stok Durumu:</div>
                                <div
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock > 10
                                        ? 'bg-emerald-900 bg-opacity-20 text-emerald-400 border border-emerald-800'
                                        : product.stock > 0
                                            ? 'bg-amber-900 bg-opacity-20 text-amber-400 border border-amber-800'
                                            : 'bg-red-900 bg-opacity-20 text-red-400 border border-red-800'
                                        }`}
                                >
                                    {product.stock > 0 ? `${product.stock} adet stokta` : 'Stokta yok'}
                                </div>
                            </div>

                            <a
                                href="https://kudatsteeljewerly.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full rounded-md px-8 py-4 text-center font-medium shadow-md transition-all bg-gradient-to-r from-[var(--primary-medium)] to-[var(--primary-light)] text-[var(--text-primary)] hover:text-[var(--accent-silver)] border border-[var(--border-medium)] btn-hover-effect"
                            >
                                Web Sitemizden Satın Al
                            </a>

                            <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-[var(--text-secondary)]">
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>1-3 İş Günü İçinde Kargo</span>
                                </div>
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span>Güvenli Ödeme</span>
                                </div>
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    <span>Kredi Kartına Taksit</span>
                                </div>
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <span>İade Garantisi</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Benzer Ürünler */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="mb-8 text-2xl font-bold text-center bg-clip-text text-transparent bg-[var(--gradient-accent)]">
                            Benzer Ürünler
                        </h2>
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {relatedProducts.map((relatedProduct) => (
                                <Link
                                    key={relatedProduct._id}
                                    href={`/products/${relatedProduct._id}`}
                                    className="group overflow-hidden rounded-lg bg-[var(--primary-dark)] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                                >
                                    <div className="relative h-56 w-full overflow-hidden">
                                        {relatedProduct.image ? (
                                            <div className="h-full w-full bg-gradient-to-b from-[var(--primary-medium)] to-[var(--primary-dark)]">
                                                <img
                                                    src={relatedProduct.image}
                                                    alt={relatedProduct.name}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary-dark)] opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                            </div>
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[var(--primary-medium)] to-[var(--primary-dark)]">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-12 w-12 text-[var(--text-muted)]"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1}
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 border-t border-[var(--border-dark)]">
                                        <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-silver)]">
                                            {relatedProduct.name}
                                        </h3>
                                        <p className="text-lg font-bold text-[var(--accent-silver)]">
                                            {formatCurrency(relatedProduct.salePrice)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Resim Modalı */}
            {showImageModal && product.image && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm p-4"
                    onClick={closeImageModal}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] rounded-lg overflow-hidden border border-[var(--border-light)] shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={product.image}
                            alt={product.name}
                            className="max-h-[90vh] max-w-full object-contain"
                        />
                        <button
                            className="absolute right-4 top-4 rounded-full bg-[var(--primary-dark)] bg-opacity-80 p-2 text-white hover:bg-opacity-100 transition-all"
                            onClick={closeImageModal}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <footer className="bg-[var(--primary-dark)] text-[var(--text-secondary)] border-t border-[var(--border-medium)] mt-20">
                <div className="container mx-auto px-4 py-10">
                    <div className="flex flex-col md:flex-row justify-between">
                        <div className="mb-8 md:mb-0">
                            <div className="text-xl font-bold text-[var(--accent-silver)] mb-4">Kudat Steel Jewelry</div>
                            <p className="max-w-xs text-sm">Zarif çelik takı koleksiyonlarımızla tarzınıza güç ve şıklık katıyoruz.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-[var(--accent-silver)] font-medium mb-3">Hızlı Linkler</h3>
                                <ul className="space-y-2 text-sm">
                                    <li><Link href="/" className="hover:text-[var(--text-primary)] transition-colors">Ana Sayfa</Link></li>
                                    <li><Link href="/bulten-kayit" className="hover:text-[var(--text-primary)] transition-colors">Bülten</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-[var(--accent-silver)] font-medium mb-3">İletişim</h3>
                                <ul className="space-y-2 text-sm">
                                    <li>info@kudatsteel.com</li>
                                    <li>+90 (544) 357 62 14</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-[var(--border-medium)] mt-10 pt-6 text-center text-xs">
                        <p>© {new Date().getFullYear()} Kudat Steel Jewelry. Tüm hakları saklıdır.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
} 