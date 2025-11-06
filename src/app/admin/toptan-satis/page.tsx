"use client";

import { useState, useEffect } from "react";
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

interface ToptanSatisRecord {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    message: string;
    status: 'pending' | 'contacted' | 'completed';
    createdAt: string;
}

export default function ToptanSatisPage() {
    const router = useRouter();
    const [records, setRecords] = useState<ToptanSatisRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedRecord, setSelectedRecord] = useState<ToptanSatisRecord | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'contacted' | 'completed'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/toptan-satis');
            const result = await response.json();
            
            if (result.success && Array.isArray(result.data)) {
                setRecords(result.data);
            } else {
                setError('Kayıtlar yüklenirken bir hata oluştu');
            }
        } catch (err) {
            console.error('Toptan satış kayıtları çekilirken hata:', err);
            setError('Kayıtlar yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: 'pending' | 'contacted' | 'completed') => {
        try {
            const response = await fetch(`/api/toptan-satis/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const result = await response.json();

            if (result.success) {
                setRecords(records.map(r => 
                    r.id === id ? { ...r, status: newStatus } : r
                ));
                setSuccess('Durum güncellendi');
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(result.error || 'Durum güncellenirken bir hata oluştu');
            }
        } catch (err) {
            console.error('Durum güncellenirken hata:', err);
            setError('Durum güncellenirken bir hata oluştu');
        }
    };

    const handleDelete = async () => {
        if (!selectedRecord) return;

        try {
            setDeleting(true);
            const response = await fetch(`/api/toptan-satis/${selectedRecord.id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                setRecords(records.filter(r => r.id !== selectedRecord.id));
                setSelectedRecord(null);
                setShowDeleteConfirm(false);
                setSuccess('Kayıt başarıyla silindi');
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(result.error || 'Kayıt silinirken bir hata oluştu');
            }
        } catch (err) {
            console.error('Kayıt silinirken hata:', err);
            setError('Kayıt silinirken bir hata oluştu');
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(date);
        } catch {
            return dateString;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'contacted':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Beklemede';
            case 'contacted':
                return 'İletişime Geçildi';
            case 'completed':
                return 'Tamamlandı';
            default:
                return status;
        }
    };

    const filteredRecords = records.filter(record => {
        const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
        const matchesSearch = searchTerm === '' || 
            record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.phone.includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <style>{scrollbarHideStyles}</style>
            
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Toptan Satış Form Kayıtları</h1>
                            <p className="text-gray-600 mt-2 text-sm sm:text-base">
                                Toptan satış formundan gelen tüm kayıtları görüntüleyin ve yönetin.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/admin')}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
                        >
                            ← Admin Paneli
                        </button>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                        {success}
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="İşletme adı, iletişim kişisi, e-posta veya telefon ile ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm sm:text-base"
                            />
                        </div>
                        {/* Status Filter */}
                        <div className="sm:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm sm:text-base"
                            >
                                <option value="all">Tüm Durumlar</option>
                                <option value="pending">Beklemede</option>
                                <option value="contacted">İletişime Geçildi</option>
                                <option value="completed">Tamamlandı</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Records Table */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <p className="mt-4 text-gray-600">Kayıtlar yükleniyor...</p>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-gray-600">Henüz kayıt bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto scrollbar-hide">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">İşletme Adı</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">İletişim Kişisi</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">E-posta</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Telefon</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Durum</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tarih</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.name}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.contactPerson}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                <a href={`mailto:${record.email}`} className="text-blue-600 hover:text-blue-800">
                                                    {record.email}
                                                </a>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                <a href={`tel:${record.phone}`} className="text-blue-600 hover:text-blue-800">
                                                    {record.phone}
                                                </a>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                                                    {getStatusText(record.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(record.createdAt)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedRecord(record)}
                                                        className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
                                                    >
                                                        Detay
                                                    </button>
                                                    <select
                                                        value={record.status}
                                                        onChange={(e) => updateStatus(record.id, e.target.value as any)}
                                                        className="text-xs sm:text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-900"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <option value="pending">Beklemede</option>
                                                        <option value="contacted">İletişime Geçildi</option>
                                                        <option value="completed">Tamamlandı</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                {selectedRecord && (
                    <div 
                        className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300" 
                        onClick={() => setSelectedRecord(null)}
                    >
                        <div 
                            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-100" 
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6 py-5 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Kayıt Detayları</h2>
                                    <p className="text-sm text-gray-500">Form kaydı bilgileri</p>
                                </div>
                                <button
                                    onClick={() => setSelectedRecord(null)}
                                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
                                    aria-label="Kapat"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* İşletme Adı */}
                                    <div className="md:col-span-2">
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                İşletme Adı
                                            </label>
                                            <p className="text-lg font-medium text-gray-900">{selectedRecord.name}</p>
                                        </div>
                                    </div>

                                    {/* İletişim Kişisi */}
                                    <div>
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                İletişim Kişisi
                                            </label>
                                            <p className="text-base font-medium text-gray-900">{selectedRecord.contactPerson}</p>
                                        </div>
                                    </div>

                                    {/* Durum */}
                                    <div>
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                Durum
                                            </label>
                                            <span className={`inline-block px-3 py-1.5 text-sm font-semibold rounded-full ${getStatusColor(selectedRecord.status)}`}>
                                                {getStatusText(selectedRecord.status)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* E-posta */}
                                    <div>
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                E-posta
                                            </label>
                                            <a 
                                                href={`mailto:${selectedRecord.email}`} 
                                                className="text-blue-600 hover:text-blue-800 font-medium text-base transition-colors inline-flex items-center gap-1"
                                            >
                                                {selectedRecord.email}
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>

                                    {/* Telefon */}
                                    <div>
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                Telefon
                                            </label>
                                            <a 
                                                href={`tel:${selectedRecord.phone}`} 
                                                className="text-blue-600 hover:text-blue-800 font-medium text-base transition-colors inline-flex items-center gap-1"
                                            >
                                                {selectedRecord.phone}
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>

                                    {/* Mesaj */}
                                    {selectedRecord.message && (
                                        <div className="md:col-span-2">
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                    Mesaj
                                                </label>
                                                <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedRecord.message}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Kayıt Tarihi */}
                                    <div className="md:col-span-2">
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                Kayıt Tarihi
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-base font-medium text-gray-900">{formatDate(selectedRecord.createdAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(true);
                                    }}
                                    className="px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Sil
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelectedRecord(null)}
                                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                                    >
                                        Kapat
                                    </button>
                                    <button
                                        onClick={() => {
                                            window.open(`mailto:${selectedRecord.email}?subject=Toptan Satış Talebi - ${selectedRecord.name}`, '_blank');
                                        }}
                                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                                    >
                                        E-posta Gönder
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && selectedRecord && (
                    <div 
                        className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-[60] p-4" 
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        <div 
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" 
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900">Kaydı Sil</h3>
                                    <p className="text-sm text-gray-500 mt-1">Bu işlem geri alınamaz</p>
                                </div>
                            </div>
                            
                            <p className="text-gray-700 mb-6">
                                <span className="font-semibold">{selectedRecord.name}</span> işletmesine ait kaydı silmek istediğinizden emin misiniz?
                            </p>
                            
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={deleting}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm disabled:opacity-50 flex items-center gap-2"
                                >
                                    {deleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Siliniyor...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Sil
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

