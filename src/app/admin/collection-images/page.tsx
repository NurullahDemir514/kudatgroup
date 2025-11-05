"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const scrollbarHideStyles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

export default function CollectionImagesPage() {
    const router = useRouter();
    const [images, setImages] = useState<{ url: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Collection görsellerini çek
    useEffect(() => {
        fetchCollectionImages();
    }, []);

    const fetchCollectionImages = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/collection-images');
            const result = await response.json();
            
            if (result.success && Array.isArray(result.images)) {
                // URL'den dosya adını çıkar
                const imagesWithNames = result.images.map((url: string) => {
                    const urlParts = url.split('/');
                    const fileName = urlParts[urlParts.length - 1].split('?')[0];
                    return { url, name: fileName };
                });
                setImages(imagesWithNames);
            } else {
                setError('Görseller yüklenirken bir hata oluştu');
            }
        } catch (err) {
            console.error('Collection görselleri çekilirken hata:', err);
            setError('Görseller yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Dosya tipi kontrolü
        if (!file.type.startsWith('image/')) {
            setError('Lütfen geçerli bir resim dosyası seçin');
            return;
        }

        // Dosya boyutu kontrolü (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('Maksimum dosya boyutu 10MB olmalıdır');
            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'collection'); // Collection klasörüne yükle

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Görsel başarıyla yüklendi!');
                // Cache'i temizle
                await fetch('/api/collection-images', { method: 'DELETE' });
                // Görselleri yeniden yükle
                await fetchCollectionImages();
            } else {
                setError('Görsel yüklenirken bir hata oluştu: ' + (data.error || 'Bilinmeyen hata'));
            }
        } catch (err) {
            console.error('Görsel yükleme hatası:', err);
            setError('Görsel yüklenirken bir hata oluştu');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDeleteImage = async (imageUrl: string) => {
        if (!confirm('Bu görseli silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            setError(null);
            setSuccess(null);
            
            const response = await fetch(`/api/collection-images/delete?url=${encodeURIComponent(imageUrl)}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Görsel başarıyla silindi');
                // Cache'i temizle
                await fetch('/api/collection-images', { method: 'DELETE' });
                // Görselleri yeniden yükle
                await fetchCollectionImages();
            } else {
                setError('Görsel silinirken bir hata oluştu: ' + (data.error || 'Bilinmeyen hata'));
            }
        } catch (err) {
            console.error('Görsel silme hatası:', err);
            setError('Görsel silinirken bir hata oluştu');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <style>{scrollbarHideStyles}</style>
            
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Koleksiyon Görselleri Yönetimi</h1>
                            <p className="text-gray-600 mt-2">
                                Ana sayfa koleksiyon bölümündeki görselleri yönetin. Tüm görseller InfiniteMenu'de gösterilir.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/admin')}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            ← Admin Paneli
                        </button>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                        {success}
                    </div>
                )}

                {/* Upload Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Yeni Görsel Yükle</h2>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className="hidden"
                            id="collection-image-upload"
                        />
                        <label
                            htmlFor="collection-image-upload"
                            className={`cursor-pointer inline-block px-6 py-3 rounded-lg ${
                                uploading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            } transition-colors`}
                        >
                            {uploading ? 'Yükleniyor...' : 'Görsel Seç ve Yükle'}
                        </label>
                        <p className="text-sm text-gray-500 mt-4">
                            Maksimum dosya boyutu: 10MB. Desteklenen formatlar: JPG, PNG, WebP
                        </p>
                    </div>
                </div>

                {/* Images Grid */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Mevcut Görseller ({images.length})</h2>
                    
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            <p className="mt-4 text-gray-600">Yükleniyor...</p>
                        </div>
                    ) : images.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>Henüz görsel yüklenmemiş.</p>
                            <p className="text-sm mt-2">Yukarıdan yeni görsel yükleyebilirsiniz.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className="relative group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    <div className="aspect-video bg-gray-100 relative">
                                        <img
                                            src={image.url}
                                            alt={`Collection ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {image.name}
                                        </p>
                                        <button
                                            onClick={() => handleDeleteImage(image.url)}
                                            className="mt-2 text-sm text-red-600 hover:text-red-800"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

