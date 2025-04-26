'use client';
import { useState, useEffect } from 'react';
import { ISale, ISaleItem } from '@/models/Sale';
import { IProduct } from '@/models/Product';
import React from 'react';

// Müşteri arayüzü
interface ICustomer {
    _id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    taxNumber?: string;
}

interface SalesFormProps {
    initialData?: ISale;
    products: IProduct[];
    onSubmit: (data: Partial<ISale>) => void;
    onCancel: () => void;
    editingSale?: ISale | null;
    formSubmitting?: boolean;
    formError?: string | null;
}

const SalesForm: React.FC<SalesFormProps> = ({
    initialData,
    products,
    onSubmit,
    onCancel,
    formSubmitting = false,
    formError,
}) => {
    const [activeTab, setActiveTab] = useState('info');
    const [formData, setFormData] = useState<Partial<ISale>>({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        items: [],
        totalAmount: 0,
        paymentMethod: 'Nakit',
        notes: '',
        saleDate: new Date(),
        // Yeni eklenen alanlar
        invoiceNumber: '',
        invoiceAddress: '',
        taxNumber: '',
        deliveryAddress: '',
        deliveryDate: undefined,
        paymentStatus: 'Ödendi',
        dueDate: undefined,
        discountAmount: 0,
        taxRate: 18,
        orderStatus: 'Tamamlandı',
    });
    const [productId, setProductId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);

    // Müşteri listesi ve arama için state'ler
    const [customers, setCustomers] = useState<ICustomer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCustomerList, setShowCustomerList] = useState(false);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

    // Müşteri listesi referansı - Dışa tıklama kontrolü için
    const customerListRef = React.useRef<HTMLDivElement>(null);
    const customerInputRef = React.useRef<HTMLInputElement>(null);

    // Müşteri arama gecikmesi için
    const searchTimeout = React.useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                saleDate: initialData.saleDate ? new Date(initialData.saleDate) : new Date(),
                deliveryDate: initialData.deliveryDate ? new Date(initialData.deliveryDate) : undefined,
                dueDate: initialData.dueDate ? new Date(initialData.dueDate) : undefined,
            });
        }
    }, [initialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setFormData({
            ...formData,
            [field]: e.target.value ? new Date(e.target.value) : undefined,
        });
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const value = parseFloat(e.target.value);
        setFormData({
            ...formData,
            [field]: isNaN(value) ? 0 : value,
        });
    };

    // Müşteri ismi değiştiğinde arama listesini aç - Gecikme ekleyerek
    const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        setFormData({
            ...formData,
            customerName: value,
        });

        setSearchTerm(value);

        // Her değişiklikte önceki zaman aşımını temizle
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        // 300ms gecikme ile müşteri listesini gösterme/gizleme işlemi
        searchTimeout.current = setTimeout(() => {
            setShowCustomerList(value.length > 0);
        }, 300);
    };

    // Müşteri seçildiğinde bilgileri form alanlarına doldur
    const selectCustomer = (customer: ICustomer) => {
        setFormData({
            ...formData,
            customerName: customer.name,
            customerPhone: customer.phone || '',
            customerEmail: customer.email || '',
            invoiceAddress: customer.address || '',
            taxNumber: customer.taxNumber || '',
            deliveryAddress: customer.address || '', // Aynı adresi teslimat adresi olarak da kullan
        });

        // Liste kapanmadan önce küçük bir gecikme ekleyerek UI'nin düzgün çalışmasını sağla
        setTimeout(() => {
            setShowCustomerList(false);
        }, 100);
    };

    // Müşteri listesini yükle
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setIsLoadingCustomers(true);
                const response = await fetch('/api/customers');
                const result = await response.json();

                if (result.success) {
                    setCustomers(result.data);
                } else {
                    console.error('Müşteri listesi yüklenirken hata:', result.error);
                }
            } catch (err) {
                console.error('Müşteri listesi yüklenirken hata:', err);
            } finally {
                setIsLoadingCustomers(false);
            }
        };

        fetchCustomers();
    }, []);

    // Filtrelenmiş müşteri listesi
    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchTerm)) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm))
    ).slice(0, 5); // Maksimum 5 sonuç göster

    // Dışarıdan tıklama ile müşteri listesini kapat - Geliştirilmiş sürüm
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;

            // Eğer input veya müşteri listesi dışında bir yere tıklandıysa
            if (
                customerInputRef.current &&
                customerListRef.current &&
                !customerInputRef.current.contains(target) &&
                !customerListRef.current.contains(target)
            ) {
                setShowCustomerList(false);
            }
        };

        // Tıklama olayını ekle
        document.addEventListener('mousedown', handleClickOutside);

        // Temizleme fonksiyonu
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Para formatı
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(amount);
    };

    const addItem = () => {
        if (!productId || quantity <= 0) {
            alert("Lütfen geçerli bir ürün ve miktar seçin.");
            return;
        }

        const product = products.find((p) => p._id === productId);
        if (!product) {
            alert("Seçilen ürün bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.");
            return;
        }

        // Ürün fiyatını kontrol et
        if (product.salePrice === undefined || product.salePrice === null || isNaN(product.salePrice) || product.salePrice <= 0) {
            alert("Ürün fiyatı tanımlı değil veya geçersiz! Lütfen önce ürün fiyatını düzenleyin.");
            return;
        }

        // Miktar sayısal değer mi kontrol et
        const qtyValue = Number(quantity);
        if (isNaN(qtyValue) || qtyValue <= 0) {
            alert("Lütfen geçerli bir miktar girin.");
            return;
        }

        // Birim fiyat ve toplam fiyat hesapla (NaN kontrolü ile)
        const unitPrice = Number(product.salePrice);
        const totalPrice = unitPrice * qtyValue;

        // NaN kontrolü
        if (isNaN(totalPrice)) {
            alert("Fiyat hesaplaması yapılamadı. Lütfen ürün fiyatını kontrol edin.");
            return;
        }

        console.log(`Ürün ekleniyor: ${product.name}, Fiyat: ${unitPrice}, Miktar: ${qtyValue}, Toplam: ${totalPrice}`);

        const newItem: ISaleItem = {
            product: productId,
            productName: product.name,
            quantity: qtyValue,
            unitPrice: unitPrice,
            totalPrice: totalPrice,
        };

        const updatedItems = [...(formData.items || []), newItem];

        // Toplam tutarı hesapla
        recalculateTotals(updatedItems);

        // Formları temizle
        setProductId('');
        setQuantity(1);
    };

    const removeItem = (index: number) => {
        const updatedItems = [...(formData.items || [])];
        updatedItems.splice(index, 1);

        // Toplam tutarı yeniden hesapla
        recalculateTotals(updatedItems);
    };

    const recalculateTotals = (items: ISaleItem[]) => {
        if (!items || items.length === 0) {
            setFormData({
                ...formData,
                items: [],
                totalAmount: 0,
            });
            return;
        }

        // Önce tüm ürün satırlarını kontrol et ve NaN değerleri düzelt
        const validatedItems = items.map(item => {
            const unitPrice = isNaN(item.unitPrice) ? 0 : item.unitPrice;
            const quantity = isNaN(item.quantity) ? 0 : item.quantity;
            const totalPrice = unitPrice * quantity;

            return {
                ...item,
                unitPrice,
                quantity,
                totalPrice: isNaN(totalPrice) ? 0 : totalPrice
            };
        });

        // Alt toplamı hesapla
        const subTotal = validatedItems.reduce((sum, item) => sum + item.totalPrice, 0);

        // İndirim ve vergi hesapla
        const discountAmount = isNaN(Number(formData.discountAmount)) ? 0 : Number(formData.discountAmount);
        const taxRate = isNaN(Number(formData.taxRate)) ? 18 : Number(formData.taxRate);

        const taxAmount = (subTotal - discountAmount) * (taxRate / 100);
        const totalAmount = subTotal - discountAmount + taxAmount;

        // NaN kontrolü
        const finalTotal = isNaN(totalAmount) ? 0 : totalAmount;

        console.log(`Alt toplam: ${subTotal}, İndirim: ${discountAmount}, Vergi: ${taxAmount}, Toplam: ${finalTotal}`);

        setFormData({
            ...formData,
            items: validatedItems,
            totalAmount: finalTotal,
        });
    };

    // İndirim veya vergi oranı değiştiğinde toplamları yeniden hesapla
    useEffect(() => {
        if (formData.items && formData.items.length > 0) {
            recalculateTotals(formData.items);
        }
    }, [formData.discountAmount, formData.taxRate]);

    // Modal ilk açıldığında ilk sekmenin seçili olduğundan emin ol
    useEffect(() => {
        // Modal ilk açıldığında info sekmesini seç
        setActiveTab('info');

        // Modal açıldığında müşteri alanına otomatik odaklan
        if (customerInputRef.current) {
            customerInputRef.current.focus();
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Form doğrulama
        if (!formData.customerName || !formData.customerName.trim()) {
            alert('Lütfen müşteri adını giriniz.');
            return;
        }

        // Ürün kontrolü
        if (!formData.items || formData.items.length === 0) {
            alert('Lütfen en az bir ürün ekleyiniz.');
            return;
        }

        // Geçersiz ürün kontrolü
        const invalidItems = formData.items.filter(item =>
            !item.product ||
            item.quantity <= 0 ||
            item.unitPrice <= 0 ||
            isNaN(item.totalPrice)
        );

        if (invalidItems.length > 0) {
            alert('Lütfen tüm ürünlerin geçerli olduğundan emin olunuz.');
            return;
        }

        // Formları temizle
        onSubmit(formData);
    };

    // Ara toplam hesapla
    const subTotal = formData.items?.reduce((sum, item) => {
        if (isNaN(item.totalPrice)) {
            // Eğer totalPrice NaN ise, unitPrice ve quantity'i kullan
            if (!isNaN(item.unitPrice) && !isNaN(item.quantity)) {
                return sum + (item.unitPrice * item.quantity);
            }
            return sum;
        }
        return sum + item.totalPrice;
    }, 0) || 0;

    const discountAmount = formData.discountAmount || 0;
    const taxRate = formData.taxRate || 18;
    const taxAmount = (subTotal - discountAmount) * (taxRate / 100);

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700">
            <form onSubmit={handleSubmit}>
                {/* Sekme Butonları - Responsive iyileştirmeler */}
                <div className="flex flex-nowrap gap-0.5 mb-4 border-b border-gray-700 pb-1 overflow-x-auto scrollbar-hide bg-gray-900 p-1 rounded-t-lg">
                    {[
                        { id: 'info', name: 'Temel Bilgiler', shortName: 'Temel', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                        { id: 'items', name: 'Ürünler', shortName: 'Ürünler', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                        { id: 'invoice', name: 'Fatura', shortName: 'Fatura', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                        { id: 'delivery', name: 'Teslimat', shortName: 'Teslimat', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
                        { id: 'payment', name: 'Ödeme', shortName: 'Ödeme', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            className={`flex items-center whitespace-nowrap px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-md scale-105 ring-2 ring-blue-400'
                                : 'bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600'
                                } ${tab.id === 'info' ? 'order-first' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg"
                                className={`h-4 w-4 mr-1 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                            </svg>
                            <span className="hidden sm:inline">{tab.name}</span>
                            <span className="inline sm:hidden">{tab.shortName}</span>
                        </button>
                    ))}
                </div>

                {/* Form içeriği */}
                <div className="space-y-3 mb-6 px-4 py-3">
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                            <div className="sm:col-span-2 relative">
                                <label htmlFor="customerName" className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                                    Müşteri Adı*
                                </label>
                                <input
                                    type="text"
                                    id="customerName"
                                    name="customerName"
                                    value={formData.customerName || ''}
                                    onChange={handleCustomerNameChange}
                                    autoComplete="off"
                                    ref={customerInputRef}
                                    className="w-full p-2 sm:p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    onFocus={() => {
                                        // Input odaklandığında ve içerisinde metin varsa listeyi göster
                                        if (formData.customerName && formData.customerName.length > 0) {
                                            setShowCustomerList(true);
                                        }
                                    }}
                                    required
                                />
                                {/* Müşteri dropdown - Geliştirilmiş yapı */}
                                {showCustomerList && (
                                    <div
                                        ref={customerListRef}
                                        className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto customer-list"
                                    >
                                        {isLoadingCustomers ? (
                                            <div className="py-3 px-3 text-center text-xs sm:text-sm text-gray-400">
                                                <div className="flex justify-center items-center space-x-2">
                                                    <div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                                                    <span>Müşteriler yükleniyor...</span>
                                                </div>
                                            </div>
                                        ) : filteredCustomers.length > 0 ? (
                                                <ul className="py-1 text-xs sm:text-sm text-gray-300">
                                                    {filteredCustomers.map((customer) => (
                                                        <li
                                                            key={customer._id}
                                                            className="cursor-pointer px-3 py-2 hover:bg-gray-700"
                                                            onClick={() => selectCustomer(customer)}
                                                        >
                                                            <div className="font-medium">{customer.name}</div>
                                                            {customer.phone && <div className="text-xs text-gray-400">{customer.phone}</div>}
                                                            {customer.email && <div className="text-xs text-gray-400">{customer.email}</div>}
                                                        </li>
                                                    ))}
                                                </ul>
                                        ) : (
                                            <div className="py-3 px-3 text-center text-xs sm:text-sm text-gray-400">
                                                Sonuç bulunamadı. Yeni müşteri ekleyebilirsiniz.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                                    Telefon
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="customerPhone"
                                    value={formData.customerPhone || ''}
                                    onChange={handleInputChange}
                                    className="w-full p-2 sm:p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                                    E-posta
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="customerEmail"
                                    value={formData.customerEmail || ''}
                                    onChange={handleInputChange}
                                    className="w-full p-2 sm:p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="address" className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                                    Adres
                                </label>
                                <textarea
                                    id="address"
                                    name="invoiceAddress"
                                    value={formData.invoiceAddress || ''}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full p-2 sm:p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="notes" className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                                    Notlar
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes || ''}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full p-2 sm:p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'invoice' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-400 mb-2">
                                    Fatura Numarası
                                </label>
                                <input
                                    type="text"
                                    id="invoiceNumber"
                                    name="invoiceNumber"
                                    value={formData.invoiceNumber || ''}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="taxNumber" className="block text-sm font-medium text-gray-400 mb-2">
                                    Vergi Numarası
                                </label>
                                <input
                                    type="text"
                                    id="taxNumber"
                                    name="taxNumber"
                                    value={formData.taxNumber || ''}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="invoiceAddress" className="block text-sm font-medium text-gray-400 mb-2">
                                    Fatura Adresi
                                </label>
                                <textarea
                                    id="invoiceAddress"
                                    name="invoiceAddress"
                                    value={formData.invoiceAddress || ''}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'delivery' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="sm:col-span-2">
                                <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-400 mb-2">
                                    Teslimat Adresi
                                </label>
                                <textarea
                                    id="deliveryAddress"
                                    name="deliveryAddress"
                                    value={formData.deliveryAddress || ''}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-400 mb-2">
                                    Teslimat Tarihi
                                </label>
                                <input
                                    type="date"
                                    id="deliveryDate"
                                    name="deliveryDate"
                                    value={formData.deliveryDate ? new Date(formData.deliveryDate).toISOString().split('T')[0] : ''}
                                    onChange={(e) => handleDateChange(e, 'deliveryDate')}
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-400 mb-2">
                                    Sipariş Durumu
                                </label>
                                <select
                                    id="orderStatus"
                                    name="orderStatus"
                                    value={formData.orderStatus || 'Tamamlandı'}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                                >
                                    <option value="Tamamlandı">Tamamlandı</option>
                                    <option value="İşlemde">İşlemde</option>
                                    <option value="Kargoda">Kargoda</option>
                                    <option value="İptal Edildi">İptal Edildi</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payment' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                            <div>
                                <label htmlFor="paymentMethod" className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                                    Ödeme Yöntemi
                                </label>
                                <select
                                    id="paymentMethod"
                                    name="paymentMethod"
                                    value={formData.paymentMethod || 'Nakit'}
                                    onChange={handleInputChange}
                                    className="w-full p-2 sm:p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="Nakit">Nakit</option>
                                    <option value="Kredi Kartı">Kredi Kartı</option>
                                    <option value="Havale/EFT">Havale/EFT</option>
                                    <option value="Çek">Çek</option>
                                    <option value="Senet">Senet</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="paymentStatus" className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                                    Ödeme Durumu
                                </label>
                                <select
                                    id="paymentStatus"
                                    name="paymentStatus"
                                    value={formData.paymentStatus || 'Ödendi'}
                                    onChange={handleInputChange}
                                    className="w-full p-2 sm:p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="Ödendi">Ödendi</option>
                                    <option value="Beklemede">Beklemede</option>
                                    <option value="Kısmi Ödeme">Kısmi Ödeme</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="dueDate" className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                                    Son Ödeme Tarihi
                                </label>
                                <input
                                    type="date"
                                    id="dueDate"
                                    name="dueDate"
                                    value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
                                    onChange={(e) => handleDateChange(e, 'dueDate')}
                                    className="w-full p-2 sm:p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="discountAmount" className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                                    İndirim Tutarı (₺)
                                </label>
                                <input
                                    type="number"
                                    id="discountAmount"
                                    name="discountAmount"
                                    value={formData.discountAmount || 0}
                                    min={0}
                                    onChange={(e) => handleNumberChange(e, 'discountAmount')}
                                    className="w-full p-2 sm:p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="taxRate" className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                                    Vergi Oranı (%)
                                </label>
                                <input
                                    type="number"
                                    id="taxRate"
                                    name="taxRate"
                                    value={formData.taxRate || 18}
                                    min={0}
                                    max={100}
                                    onChange={(e) => handleNumberChange(e, 'taxRate')}
                                    className="w-full p-2 sm:p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'items' && (
                        <div>
                            <div className="bg-gray-900 p-3 sm:p-4 rounded-lg mb-4 border border-gray-700 shadow-inner">
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
                                    <div className="sm:col-span-5">
                                        <label htmlFor="productId" className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                                            Ürün
                                        </label>
                                        <select
                                            id="productId"
                                            value={productId}
                                            onChange={(e) => setProductId(e.target.value)}
                                            className="w-full p-2 sm:p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Ürün Seçin</option>
                                            {products.map((product) => (
                                                <option key={product._id} value={product._id}>
                                                    {product.name} - {formatCurrency(product.salePrice)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label htmlFor="quantity" className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                                            Miktar
                                        </label>
                                        <div className="flex">
                                            <button
                                                type="button"
                                                onClick={() => setQuantity(Math.max(1, Number(quantity) - 1))}
                                                className="px-2 sm:px-3 py-1 sm:py-2 bg-gray-700 text-white rounded-l-md hover:bg-gray-600"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            <input
                                                type="number"
                                                id="quantity"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Number(e.target.value))}
                                                min={1}
                                                className="w-full p-1 sm:p-3 bg-gray-800 border-y border-gray-700 text-white text-center focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setQuantity(Number(quantity) + 1)}
                                                className="px-2 sm:px-3 py-1 sm:py-2 bg-gray-700 text-white rounded-r-md hover:bg-gray-600"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="sm:col-span-4 flex items-center sm:items-end mt-2 sm:mt-0">
                                        <button
                                            type="button"
                                            className={`w-full py-2 sm:py-3 px-3 sm:px-4 flex items-center justify-center rounded-md transition-all duration-150 ${!productId || quantity <= 0
                                                ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md'
                                                }`}
                                            onClick={addItem}
                                            disabled={!productId || quantity <= 0}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <span>Ekle</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Ürün Listesi */}
                            <div className="mt-4">
                                <h3 className="text-sm sm:text-base font-medium text-gray-300 mb-2 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Satış Kalemleri
                                </h3>

                                <div className="overflow-x-auto -mx-3 sm:mx-0">
                                    <div className="inline-block min-w-full align-middle">
                                        <div className="overflow-hidden rounded-lg shadow-md border border-gray-800">
                                            <table className="min-w-full divide-y divide-gray-700">
                                                <thead className="bg-gradient-to-r from-gray-800 to-gray-900">
                                                    <tr>
                                                        <th scope="col" className="py-2 sm:py-3 px-2 sm:px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ürün</th>
                                                        <th scope="col" className="py-2 sm:py-3 px-2 sm:px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Birim Fiyat</th>
                                                        <th scope="col" className="py-2 sm:py-3 px-2 sm:px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Miktar</th>
                                                        <th scope="col" className="py-2 sm:py-3 px-2 sm:px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Toplam</th>
                                                        <th scope="col" className="py-2 sm:py-3 px-2 sm:px-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-16"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-gray-800 bg-opacity-50 divide-y divide-gray-700">
                                                    {formData.items && formData.items.length > 0 ? (
                                                        formData.items.map((item, index) => (
                                                            <tr key={index} className="hover:bg-gray-700 hover:bg-opacity-50 transition-colors">
                                                                <td className="py-2 px-2 sm:px-3 whitespace-nowrap text-xs sm:text-sm text-gray-300">{item.productName}</td>
                                                                <td className="py-2 px-2 sm:px-3 whitespace-nowrap text-xs sm:text-sm text-gray-300">{formatCurrency(item.unitPrice)}</td>
                                                                <td className="py-2 px-2 sm:px-3 whitespace-nowrap text-xs sm:text-sm text-gray-300">{item.quantity}</td>
                                                                <td className="py-2 px-2 sm:px-3 whitespace-nowrap text-xs sm:text-sm text-gray-300 font-medium">{formatCurrency(item.totalPrice)}</td>
                                                                <td className="py-2 px-2 sm:px-3 whitespace-nowrap text-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeItem(index)}
                                                                        className="p-1.5 rounded-full text-gray-400 hover:bg-red-800 hover:bg-opacity-30 hover:text-red-300 transition-colors"
                                                                        aria-label="Sil"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={5} className="py-4 px-2 sm:px-3 text-center text-xs sm:text-sm text-gray-400">
                                                                <div className="flex flex-col items-center justify-center py-3 sm:py-4">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-12 sm:w-12 text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                                    </svg>
                                                                    <p>Henüz ürün eklenmedi</p>
                                                                    <p className="text-xs text-gray-500 mt-1">Yukarıdaki formdan ürün ekleyebilirsiniz</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                                <tfoot className="bg-gradient-to-b from-gray-900 to-gray-800">
                                                    <tr className="border-t border-gray-700">
                                                        <td colSpan={3} className="py-2 px-2 sm:px-3 text-right text-xs sm:text-sm font-medium text-gray-300">Ara Toplam:</td>
                                                        <td colSpan={2} className="py-2 px-2 sm:px-3 text-xs sm:text-sm text-gray-300">{formatCurrency(subTotal)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan={3} className="py-2 px-2 sm:px-3 text-right text-xs sm:text-sm font-medium text-gray-300">İndirim:</td>
                                                        <td colSpan={2} className="py-2 px-2 sm:px-3 text-xs sm:text-sm text-gray-300">-{formatCurrency(discountAmount)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan={3} className="py-2 px-2 sm:px-3 text-right text-xs sm:text-sm font-medium text-gray-300">KDV (%{taxRate}):</td>
                                                        <td colSpan={2} className="py-2 px-2 sm:px-3 text-xs sm:text-sm text-gray-300">{formatCurrency(taxAmount)}</td>
                                                    </tr>
                                                    <tr className="border-t border-gray-700 font-bold bg-gray-800">
                                                        <td colSpan={3} className="py-2 sm:py-3 px-2 sm:px-3 text-right text-xs sm:text-sm font-semibold text-white">Genel Toplam:</td>
                                                        <td colSpan={2} className="py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm font-semibold text-white">{formatCurrency(formData.totalAmount || 0)}</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Form altındaki butonlar için ayrı bir alan */}
                <div className="flex justify-end items-center gap-2 pt-4 mt-6 border-t border-gray-700">
                    <div className="text-right mr-4">
                        <div className="text-gray-400 text-xs mb-1">Toplam Tutar:</div>
                        <div className="text-xl font-bold text-white">{formatCurrency(formData.totalAmount || 0)}</div>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        type="submit"
                        disabled={formSubmitting}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center min-w-[100px]
                                ${formSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-500 transition-colors'}`}
                    >
                        {formSubmitting ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                                <span>Kaydediliyor...</span>
                            </>
                        ) : (
                            <span>Kaydet</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SalesForm; 