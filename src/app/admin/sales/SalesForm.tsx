'use client';
import { useState, useEffect } from 'react';
import { ISale, ISaleItem } from '@/models/Sale';
import { IProduct } from '@/models/Product';

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
}) => {
    const [activeTab, setActiveTab] = useState('basic');
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

    // Müşteri ismi değiştiğinde arama listesini aç
    const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({
            ...formData,
            customerName: value,
        });
        setSearchTerm(value);
        setShowCustomerList(value.length > 0);
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
        setShowCustomerList(false);
    };

    // Filtrelenmiş müşteri listesi
    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchTerm)) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm))
    ).slice(0, 5); // Maksimum 5 sonuç göster

    // Para formatı
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(amount);
    };

    const addItem = () => {
        if (!productId || quantity <= 0) return;

        const product = products.find((p) => p._id === productId);
        if (!product) return;

        // Ürün fiyatını kontrol et
        if (!product.salePrice || isNaN(product.salePrice)) {
            alert("Ürün fiyatı tanımlı değil veya geçersiz!");
            return;
        }

        // Miktar sayısal değer mi kontrol et
        const qtyValue = Number(quantity);
        if (isNaN(qtyValue) || qtyValue <= 0) {
            alert("Lütfen geçerli bir miktar girin.");
            return;
        }

        // Birim fiyat ve toplam fiyat hesapla (NaN kontrolü ile)
        const unitPrice = product.salePrice;
        const totalPrice = unitPrice * qtyValue;

        // NaN kontrolü
        if (isNaN(totalPrice)) {
            alert("Fiyat hesaplaması yapılamadı. Lütfen ürün fiyatını kontrol edin.");
            return;
        }

        const newItem: ISaleItem = {
            product: productId,
            productName: product.name,
            quantity: qtyValue,
            unitPrice: unitPrice,
            totalPrice: totalPrice,
        };

        const updatedItems = [...(formData.items || []), newItem];

        // Toplam tutarı hesapla
        const subTotal = updatedItems.reduce((sum, item) => {
            if (isNaN(item.totalPrice)) {
                // Eğer totalPrice NaN ise, unitPrice ve quantity'i kullan
                if (!isNaN(item.unitPrice) && !isNaN(item.quantity)) {
                    return sum + (item.unitPrice * item.quantity);
                }
                return sum;
            }
            return sum + item.totalPrice;
        }, 0);
        const discountAmount = formData.discountAmount || 0;
        const taxRate = formData.taxRate || 18;
        const taxAmount = (subTotal - discountAmount) * (taxRate / 100);
        const totalAmount = subTotal - discountAmount + taxAmount;

        setFormData({
            ...formData,
            items: updatedItems,
            totalAmount,
        });

        // Formları temizle
        setProductId('');
        setQuantity(1);
    };

    const removeItem = (index: number) => {
        const updatedItems = [...(formData.items || [])];
        updatedItems.splice(index, 1);

        // Toplam tutarı yeniden hesapla
        const subTotal = updatedItems.reduce((sum, item) => {
            if (isNaN(item.totalPrice)) {
                // Eğer totalPrice NaN ise, unitPrice ve quantity'i kullan
                if (!isNaN(item.unitPrice) && !isNaN(item.quantity)) {
                    return sum + (item.unitPrice * item.quantity);
                }
                return sum;
            }
            return sum + item.totalPrice;
        }, 0);
        const discountAmount = formData.discountAmount || 0;
        const taxRate = formData.taxRate || 18;
        const taxAmount = (subTotal - discountAmount) * (taxRate / 100);
        const totalAmount = subTotal - discountAmount + taxAmount;

        setFormData({
            ...formData,
            items: updatedItems,
            totalAmount,
        });
    };

    const recalculateTotals = () => {
        if (!formData.items || formData.items.length === 0) {
            setFormData({
                ...formData,
                totalAmount: 0,
            });
            return;
        }

        const subTotal = formData.items.reduce((sum, item) => {
            if (isNaN(item.totalPrice)) {
                // Eğer totalPrice NaN ise, unitPrice ve quantity'i kullan
                if (!isNaN(item.unitPrice) && !isNaN(item.quantity)) {
                    return sum + (item.unitPrice * item.quantity);
                }
                return sum;
            }
            return sum + item.totalPrice;
        }, 0);

        const discountAmount = formData.discountAmount || 0;
        const taxRate = formData.taxRate || 18;
        const taxAmount = (subTotal - discountAmount) * (taxRate / 100);
        const totalAmount = subTotal - discountAmount + taxAmount;

        setFormData({
            ...formData,
            totalAmount,
        });
    };

    // İndirim veya vergi oranı değiştiğinde toplamları yeniden hesapla
    useEffect(() => {
        recalculateTotals();
    }, [formData.discountAmount, formData.taxRate]);

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

    // Dışarıdan tıklama ile müşteri listesini kapat
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('#customerName') && !target.closest('.customer-list')) {
                setShowCustomerList(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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
        <div className="bg-gray-800 text-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sekme Butonları - Responsive tasarım için düzenlendi */}
                <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700 pb-2 overflow-x-auto">
                        <button
                            type="button"
                        className={`px-3 py-2 rounded-t-md text-sm font-medium ${activeTab === 'info' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'}`}
                        onClick={() => setActiveTab('info')}
                        >
                            Temel Bilgiler
                        </button>
                        <button
                            type="button"
                        className={`px-3 py-2 rounded-t-md text-sm font-medium ${activeTab === 'items' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'}`}
                        onClick={() => setActiveTab('items')}
                    >
                        Ürünler
                    </button>
                    <button
                        type="button"
                        className={`px-3 py-2 rounded-t-md text-sm font-medium ${activeTab === 'invoice' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'}`}
                            onClick={() => setActiveTab('invoice')}
                        >
                            Fatura Bilgileri
                        </button>
                        <button
                            type="button"
                        className={`px-3 py-2 rounded-t-md text-sm font-medium ${activeTab === 'delivery' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'}`}
                            onClick={() => setActiveTab('delivery')}
                        >
                        Teslimat
                        </button>
                        <button
                            type="button"
                        className={`px-3 py-2 rounded-t-md text-sm font-medium ${activeTab === 'payment' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'}`}
                            onClick={() => setActiveTab('payment')}
                        >
                        Ödeme
                    </button>
                </div>

                {/* Temel Bilgiler Sekmesi */}
                {activeTab === 'info' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="sm:col-span-2 relative">
                            <label htmlFor="customerName" className="block text-sm font-medium text-gray-400 mb-2">
                                Müşteri Adı*
                            </label>
                                <input
                                    type="text"
                                    id="customerName"
                                    name="customerName"
                                    value={formData.customerName || ''}
                                onChange={handleCustomerNameChange}
                                    autoComplete="off"
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                                required
                            />
                            {/* Müşteri dropdown - Responsive hale getirildi */}
                            {showCustomerList && filteredCustomers.length > 0 && (
                                <div
                                    className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto"
                                >
                                    <ul className="py-1 text-sm text-gray-300">
                                        {filteredCustomers.map((customer) => (
                                                    <li
                                                        key={customer._id}
                                                className="cursor-pointer px-4 py-2 hover:bg-gray-700"
                                                onClick={() => selectCustomer(customer)}
                                            >
                                                <div>{customer.name}</div>
                                                {customer.phone && <div className="text-xs text-gray-400">{customer.phone}</div>}
                                                    </li>
                                                ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-2">
                                Telefon
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="customerPhone"
                                value={formData.customerPhone || ''}
                                onChange={handleInputChange}
                                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                                E-posta
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="customerEmail"
                                value={formData.customerEmail || ''}
                                onChange={handleInputChange}
                                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-400 mb-2">
                                Adres
                            </label>
                            <textarea
                                id="address"
                                name="invoiceAddress"
                                value={formData.invoiceAddress || ''}
                                onChange={handleInputChange}
                                rows={2}
                                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-400 mb-2">
                                Notlar
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes || ''}
                                onChange={handleInputChange}
                                rows={2}
                                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                            />
                        </div>
                    </div>
                )}

                {/* Fatura Bilgileri Sekmesi */}
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

                {/* Teslimat Bilgileri Sekmesi */}
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

                {/* Ödeme Detayları Sekmesi */}
                {activeTab === 'payment' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-400 mb-2">
                                Ödeme Durumu
                            </label>
                            <select
                                id="paymentStatus"
                                name="paymentStatus"
                                value={formData.paymentStatus || 'Ödendi'}
                                onChange={handleInputChange}
                                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                            >
                                <option value="Ödendi">Ödendi</option>
                                <option value="Beklemede">Beklemede</option>
                                <option value="Kısmi Ödeme">Kısmi Ödeme</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-400 mb-2">
                                Son Ödeme Tarihi
                            </label>
                            <input
                                type="date"
                                id="dueDate"
                                name="dueDate"
                                value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => handleDateChange(e, 'dueDate')}
                                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="discountAmount" className="block text-sm font-medium text-gray-400 mb-2">
                                İndirim Tutarı (₺)
                            </label>
                            <input
                                type="number"
                                id="discountAmount"
                                name="discountAmount"
                                value={formData.discountAmount || 0}
                                min={0}
                                onChange={(e) => handleNumberChange(e, 'discountAmount')}
                                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="taxRate" className="block text-sm font-medium text-gray-400 mb-2">
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
                                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                            />
                        </div>
                    </div>
                )}

                {/* Ürünler Sekmesi */}
                {activeTab === 'items' && (
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-6">
                            <div className="sm:col-span-5">
                                <label htmlFor="productId" className="block text-sm font-medium text-gray-400 mb-2">
                                    Ürün
                                </label>
                                <select
                                    id="productId"
                                    value={productId}
                                    onChange={(e) => setProductId(e.target.value)}
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
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
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-400 mb-2">
                                    Miktar
                                </label>
                                <input
                                    type="number"
                                    id="quantity"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    min={1}
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                                />
                            </div>
                            <div className="sm:col-span-4 flex items-end">
                                <button
                                    type="button"
                                    className={`w-full py-3 px-4 sm:px-6 flex items-center justify-center rounded-md ${!productId || quantity <= 0
                                        ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                                        : 'bg-gray-700 text-white hover:bg-gray-600'
                                        }`}
                                    onClick={addItem}
                                    disabled={!productId || quantity <= 0}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span className="hidden sm:inline">Ekle</span>
                                </button>
                            </div>
                        </div>

                        {/* Ürün Listesi - Responsive tablo tasarımı */}
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <div className="inline-block min-w-full align-middle">
                                <div className="overflow-hidden shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-700">
                                        <thead className="bg-gray-800">
                                            <tr>
                                                <th scope="col" className="py-3 px-2 sm:px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ürün</th>
                                                <th scope="col" className="py-3 px-2 sm:px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Birim Fiyat</th>
                                                <th scope="col" className="py-3 px-2 sm:px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Miktar</th>
                                                <th scope="col" className="py-3 px-2 sm:px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Toplam</th>
                                                <th scope="col" className="py-3 px-2 sm:px-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-16"></th>
                                    </tr>
                                </thead>
                                        <tbody className="bg-gray-900 divide-y divide-gray-800">
                                    {formData.items && formData.items.length > 0 ? (
                                        formData.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="py-2 px-2 sm:px-4 whitespace-nowrap text-sm text-gray-300">{item.productName}</td>
                                                <td className="py-2 px-2 sm:px-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(item.unitPrice)}</td>
                                                <td className="py-2 px-2 sm:px-4 whitespace-nowrap text-sm text-gray-300">{item.quantity}</td>
                                                <td className="py-2 px-2 sm:px-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(item.totalPrice)}</td>
                                                <td className="py-2 px-2 sm:px-4 whitespace-nowrap text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
                                                        aria-label="Sil"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                                        <td colSpan={5} className="py-3 px-2 sm:px-4 text-center text-sm text-gray-400">Henüz ürün eklenmedi</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-900">
                                    <tr className="border-t border-gray-800">
                                                <td colSpan={3} className="py-2 px-2 sm:px-4 text-right text-sm font-medium text-gray-300">Ara Toplam:</td>
                                                <td colSpan={2} className="py-2 px-2 sm:px-4 text-sm text-gray-300">{formatCurrency(subTotal)}</td>
                                    </tr>
                                    <tr>
                                                <td colSpan={3} className="py-2 px-2 sm:px-4 text-right text-sm font-medium text-gray-300">İndirim:</td>
                                                <td colSpan={2} className="py-2 px-2 sm:px-4 text-sm text-gray-300">-{formatCurrency(discountAmount)}</td>
                                    </tr>
                                    <tr>
                                                <td colSpan={3} className="py-2 px-2 sm:px-4 text-right text-sm font-medium text-gray-300">KDV (%{taxRate}):</td>
                                                <td colSpan={2} className="py-2 px-2 sm:px-4 text-sm text-gray-300">{formatCurrency(taxAmount)}</td>
                                    </tr>
                                    <tr className="border-t border-gray-800 font-bold">
                                                <td colSpan={3} className="py-2 px-2 sm:px-4 text-right text-sm text-gray-300">Genel Toplam:</td>
                                                <td colSpan={2} className="py-2 px-2 sm:px-4 text-sm text-white">{formatCurrency(formData.totalAmount || 0)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4 mt-8">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-800 text-silver rounded-md hover:bg-gray-700 w-full sm:w-auto"
                    >
                        İptal
                    </button>
                    <button
                        type="submit"
                        disabled={!formData.customerName || !formData.items || formData.items.length === 0}
                        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-md flex items-center justify-center w-full sm:w-auto ${!formData.customerName || !formData.items || formData.items.length === 0
                            ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-600 text-white hover:bg-gray-500'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Kaydet
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SalesForm; 