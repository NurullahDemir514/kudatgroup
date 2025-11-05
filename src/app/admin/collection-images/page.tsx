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

interface CollectionImage {
    url: string;
    name: string;
    id?: string;
    title?: string;
    code?: string;
    description?: string;
    order?: number;
}

export default function CollectionImagesPage() {
    const router = useRouter();
    const [images, setImages] = useState<CollectionImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [editingImage, setEditingImage] = useState<CollectionImage | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        code: '',
        description: '',
    });
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
                // Metadata ile birlikte görselleri al
                const imagesWithData = result.images.map((img: any) => {
                    const urlParts = img.url.split('/');
                    const fileName = urlParts[urlParts.length - 1].split('?')[0];
                    return {
                        url: img.url,
                        name: fileName,
                        id: img.id,
                        title: img.title || '',
                        code: img.code || '',
                        description: img.description || '',
                        order: img.order || 0,
                    };
                });
                setImages(imagesWithData);
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
                setSuccess('Görsel başarıyla yüklendi! Şimdi ürün bilgilerini girebilirsiniz.');
                // Cache'i temizle
                await fetch('/api/collection-images', { method: 'DELETE' });
                // Görselleri yeniden yükle
                await fetchCollectionImages().then(() => {
                    // Yeni yüklenen görseli düzenleme moduna al
                    const newImage: CollectionImage = {
                        url: data.url,
                        name: data.fileName || data.url.split('/').pop()?.split('?')[0] || '',
                        title: '',
                        code: '',
                        description: '',
                    };
                    setEditingImage(newImage);
                    setFormData({
                        title: '',
                        code: '',
                        description: '',
                    });
                });
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

    const handleDeleteImage = async (imageUrl: string, imageId?: string) => {
        if (!confirm('Bu görseli silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            setError(null);
            setSuccess(null);
            
            // Önce metadata'yı sil
            if (imageId) {
                await fetch(`/api/collection-images/metadata?id=${imageId}`, {
                    method: 'DELETE',
                });
            }
            
            // Sonra görseli sil
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

    const handleEditImage = (image: CollectionImage) => {
        setEditingImage(image);
        setFormData({
            title: image.title || '',
            code: image.code || '',
            description: image.description || '',
        });
    };

    const handleSaveMetadata = async () => {
        if (!editingImage) return;

        try {
            setError(null);
            setSuccess(null);

            const response = await fetch('/api/collection-images/metadata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: editingImage.id,
                    imageUrl: editingImage.url,
                    title: formData.title,
                    code: formData.code,
                    description: formData.description,
                    order: editingImage.order || 0,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Ürün bilgileri başarıyla kaydedildi!');
                setEditingImage(null);
                setFormData({ title: '', code: '', description: '' });
                // Cache'i temizle
                await fetch('/api/collection-images', { method: 'DELETE' });
                // Görselleri yeniden yükle
                await fetchCollectionImages();
            } else {
                setError('Bilgiler kaydedilirken bir hata oluştu: ' + (data.error || 'Bilinmeyen hata'));
            }
        } catch (err) {
            console.error('Metadata kaydetme hatası:', err);
            setError('Bilgiler kaydedilirken bir hata oluştu');
        }
    };

    const handleCancelEdit = () => {
        setEditingImage(null);
        setFormData({ title: '', code: '', description: '' });
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
                                            alt={image.title || `Collection ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {image.title || image.name}
                                        </p>
                                        {image.code && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Kod: {image.code}
                                            </p>
                                        )}
                                        <div className="mt-3 flex gap-2">
                                            <button
                                                onClick={() => handleEditImage(image)}
                                                className="flex-1 text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                            >
                                                Düzenle
                                            </button>
                                            <button
                                                onClick={() => handleDeleteImage(image.url, image.id)}
                                                className="flex-1 text-sm px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Edit Modal */}
                    {editingImage && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-semibold">Ürün Bilgilerini Düzenle</h3>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="mb-4">
                                        <img
                                            src={editingImage.url}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ürün Adı *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Örn: Zarif Çelik Kolye"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ürün Kodu *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Örn: KT-001"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Açıklama
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={4}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Ürün hakkında açıklama..."
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex gap-3">
                                        <button
                                            onClick={handleSaveMetadata}
                                            disabled={!formData.title || !formData.code}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            Kaydet
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            İptal
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

