'use client';
import { useState, useEffect } from 'react';
import { ISale, ISaleItem } from '@/models/Sale';
import { IProduct } from '@/models/Product';
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Müşteri arayüzü
interface ICustomer {
    _id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    taxNumber?: string;
    isSubscriber?: boolean; // E-bülten abonesi mi?
    addressCity?: string;
    addressDistrict?: string;
    addressStreet?: string;
    addressBuildingNo?: string;
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
    const [formData, setFormData] = useState<Partial<ISale> & {
        // Ek form alanları
        invoiceDate?: Date;
        invoiceAddressLine1?: string;
        invoiceAddressLine2?: string;
        invoiceCity?: string;
        invoicePostalCode?: string;
        taxOffice?: string;
        sameAsInvoice?: boolean;
        deliveryAddressLine1?: string;
        deliveryAddressLine2?: string;
        deliveryCity?: string;
        deliveryPostalCode?: string;
        deliveryNotes?: string;
        paymentDate?: Date;
        amountPaid?: string;
        paymentNotes?: string;
    }>({
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
        // Ek form alanları
        invoiceDate: undefined,
        invoiceAddressLine1: '',
        invoiceAddressLine2: '',
        invoiceCity: '',
        invoicePostalCode: '',
        taxOffice: '',
        sameAsInvoice: false,
        deliveryAddressLine1: '',
        deliveryAddressLine2: '',
        deliveryCity: '',
        deliveryPostalCode: '',
        deliveryNotes: '',
        paymentDate: undefined,
        amountPaid: '',
        paymentNotes: '',
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

    const createChangeEvent = (name: string, value: any): React.ChangeEvent<HTMLInputElement> => {
        return {
            target: { name, value } as any,
            currentTarget: { name, value } as any,
            preventDefault: () => { },
            stopPropagation: () => { },
            isPropagationStopped: () => false,
            isDefaultPrevented: () => false,
            persist: () => { },
            nativeEvent: new Event('change'),
            bubbles: true,
            cancelable: true,
            timeStamp: Date.now(),
            type: 'change',
        } as unknown as React.ChangeEvent<HTMLInputElement>;
    };

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

    // DatePicker için ayrı bir tarih değiştirme fonksiyonu
    const handleDatePickerChange = (date: Date | null, field: string) => {
        setFormData({
            ...formData,
            [field]: date,
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
        // Adres bilgilerini birleştir
        let fullAddress = '';

        if (customer.isSubscriber) {
            // E-bülten abonesi ise adres bilgilerini subscriptions modeli formatından alıyoruz
            if (customer.addressCity) {
                fullAddress += customer.addressCity;
            }
            if (customer.addressDistrict) {
                fullAddress += fullAddress ? `, ${customer.addressDistrict}` : customer.addressDistrict;
            }
            if (customer.addressStreet) {
                fullAddress += fullAddress ? `, ${customer.addressStreet}` : customer.addressStreet;
            }
            if (customer.addressBuildingNo) {
                fullAddress += fullAddress ? ` No: ${customer.addressBuildingNo}` : `No: ${customer.addressBuildingNo}`;
            }

            console.log(`E-bülten abonesi için adres oluşturuldu: ${fullAddress}`);
        } else {
            // Normal müşteri ise varsa adres bilgisini kullan
            fullAddress = customer.address || '';
        }

        // Adres bilgilerini ayrıştır (basit bir yaklaşım)
        let addressLine1 = fullAddress;
        let addressLine2 = '';

        // Adres virgülle ayrılmışsa ilk satır olarak al
        if (fullAddress.includes(',')) {
            const parts = fullAddress.split(',');
            addressLine1 = parts[0].trim();
            addressLine2 = parts.slice(1).join(',').trim();
        }

        setFormData({
            ...formData,
            customerName: customer.name,
            customerPhone: customer.phone || '',
            customerEmail: customer.email || '',
            invoiceAddress: fullAddress || '',
            // Yeni eklenen adres alanları
            invoiceAddressLine1: addressLine1,
            invoiceAddressLine2: addressLine2,
            invoiceCity: customer.addressCity || '',  
            taxNumber: customer.taxNumber || '',
            deliveryAddress: fullAddress || '', // Aynı adresi teslimat adresi olarak da kullan
            deliveryAddressLine1: addressLine1,
            deliveryAddressLine2: addressLine2,
            deliveryCity: customer.addressCity || ''
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
                console.log("Müşteri ve abone verileri alınıyor...");

                // Müşteri verileri
                const customersResponse = await fetch('/api/customers');
                const customersResult = await customersResponse.json();

                // Müşteri verilerini işle
                let allContacts: ICustomer[] = [];
                if (customersResult.success) {
                    console.log(`${customersResult.data.length} müşteri yüklendi`);
                    allContacts = [...customersResult.data];
                } else {
                    console.error('Müşteri listesi yüklenirken hata:', customersResult.error);
                }

                // Bülten aboneleri için endpoint'i kontrol et
                try {
                    const subscribersResponse = await fetch('/api/whatsapp/subscribers');
                    const subscribersResult = await subscribersResponse.json();

                    if (subscribersResult.success) {
                        console.log(`${subscribersResult.data.length} bülten abonesi yüklendi`);
                        // Aboneleri müşteri formatına dönüştür ve isSubscriber özelliğini ekle
                        const formattedSubscribers = subscribersResult.data.map((sub: any) => ({
                            _id: sub._id,
                            name: sub.name || sub.email,
                            email: sub.email,
                            phone: sub.phone || '',
                            isSubscriber: true,
                            // Adres bilgilerini de ekle
                            addressCity: sub.addressCity,
                            addressDistrict: sub.addressDistrict,
                            addressStreet: sub.addressStreet,
                            addressBuildingNo: sub.addressBuildingNo,
                            taxNumber: sub.taxNumber
                        }));

                        // Aynı email'e sahip olanları müşteri listesinden filtrele
                        const uniqueSubscribers = formattedSubscribers.filter((sub: ICustomer) =>
                            !allContacts.some(customer => customer.email === sub.email && sub.email)
                        );

                        console.log(`${uniqueSubscribers.length} benzersiz abone ekleniyor`);
                        // Benzersiz aboneleri ekle
                        allContacts = [...allContacts, ...uniqueSubscribers];
                    } else {
                        console.error('Aboneler yüklenirken hata:', subscribersResult.error);
                    }
                } catch (subErr) {
                    console.error('Abone verileri alınırken hata oluştu:', subErr);
                }

                console.log(`Toplam ${allContacts.length} kişi yüklendi`);
                setCustomers(allContacts);
            } catch (err) {
                console.error('Veri yükleme hatası:', err);
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

    // Toplam tutarı hesapla
    const calculateTotal = () => {
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

        return subTotal - discountAmount + taxAmount;
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

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-300">
            <form onSubmit={handleSubmit}>
                {/* Sekme Butonları - Responsive iyileştirmeler */}
                <div className="flex flex-nowrap gap-0.5 mb-4 border-b border-gray-200 pb-1 overflow-x-auto scrollbar-hide bg-gray-50 p-1 rounded-t-lg">
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
                                ? 'bg-blue-500 text-white shadow-md scale-105 ring-2 ring-blue-300'
                                : 'bg-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-300'
                                } ${tab.id === 'info' ? 'order-first' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg"
                                className={`h-4 w-4 mr-1 ${activeTab === tab.id ? 'text-white' : 'text-gray-600'}`}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Müşteri bilgileri - Sol sütun */}
                            <div className="space-y-4">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Müşteri Adı <span className="text-red-500">*</span>
                                </label>
                                    <div className="relative">
                                <input
                                            type="text"
                                    name="customerName"
                                            value={formData.customerName}
                                    onChange={handleCustomerNameChange}
                                            className="pr-8 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                                            placeholder="Müşteri adını girin veya seçin"
                                    required
                                />
                                        {formData.customerName && (
                                            <button
                                                type="button"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                onClick={() => {
                                                    setFormData({ ...formData, customerName: '', customerEmail: '', customerPhone: '' });
                                                    setSearchTerm('');
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    {/* Müşteri Listesi */}
                                    {showCustomerList && filteredCustomers.length > 0 && (
                                        <div
                                            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg border border-gray-300"
                                            ref={customerListRef}
                                        >
                                                    {filteredCustomers.map((customer) => (
                                                        <div
                                                            key={customer._id}
                                                            className="cursor-pointer px-3 py-2 hover:bg-blue-50 text-gray-800"
                                                            onClick={() => selectCustomer(customer)}
                                                        >
                                                                    <div className="font-medium">{customer.name}</div>
                                                            {customer.email && <div className="text-xs text-gray-600">{customer.email}</div>}
                                                            {customer.phone && <div className="text-xs text-gray-600">{customer.phone}</div>}
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>

                            <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Telefon
                                </label>
                                <input
                                        type="tel"
                                    name="customerPhone"
                                        value={formData.customerPhone}
                                    onChange={handleInputChange}
                                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                                        placeholder="05XX XXX XX XX"
                                />
                            </div>

                            <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                    E-posta
                                </label>
                                <input
                                        type="email"
                                    name="customerEmail"
                                        value={formData.customerEmail}
                                    onChange={handleInputChange}
                                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                                        placeholder="ornek@eposta.com"
                                />
                            </div>
                            </div>

                            {/* Satış bilgileri - Sağ sütun */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Satış Tarihi <span className="text-red-500">*</span>
                                </label>
                                    <div className="relative">
                                        <DatePicker
                                            selected={formData.saleDate ? new Date(formData.saleDate) : null}
                                            onChange={(date: Date | null) => handleDatePickerChange(date, 'saleDate')}
                                            dateFormat="dd/MM/yyyy"
                                            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholderText="Satış tarihi seçin"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                            </svg>
                            </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ödeme Yöntemi
                                    </label>
                                    <select
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleInputChange}
                                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="">Seçiniz...</option>
                                        <option value="Nakit">Nakit</option>
                                        <option value="Kredi Kartı">Kredi Kartı</option>
                                        <option value="Banka Transferi">Banka Transferi</option>
                                        <option value="Çek">Çek</option>
                                        <option value="Diğer">Diğer</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notlar
                                </label>
                                    <textarea
                                    name="notes"
                                        value={formData.notes}
                                    onChange={handleInputChange}
                                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                                        placeholder="Sipariş ile ilgili notlar..."
                                        rows={3}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ürünler Sekmesi */}
                    {activeTab === 'items' && (
                        <div className="space-y-4">
                            {/* Ürün Tablosu */}
                            <div className="overflow-x-auto rounded-lg border border-gray-300">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Ürün
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Birim
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Fiyat
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Miktar
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Toplam
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                İşlem
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-300">
                                        {formData.items?.length ? (
                                            formData.items.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">Adet</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.unitPrice)}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.totalPrice)}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-3 text-sm text-center text-gray-500">
                                                    Henüz ürün eklenmemiş
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Ürün Ekle */}
                            <div className="p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
                                <h3 className="text-base font-medium text-gray-800 mb-3">Ürün Ekle</h3>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ürün <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={productId}
                                            onChange={(e) => setProductId(e.target.value)}
                                            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value="">Ürün seçin...</option>
                                            {products.map((product) => (
                                                <option key={product._id} value={product._id}>
                                                    {product.name} - {formatCurrency(product.salePrice || 0)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Miktar <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={quantity === 0 ? '' : quantity}
                                            onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                                            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="0"
                                            min="0"
                                            step="1"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                        >
                                            Ekle
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Toplam Bilgileri */}
                            <div className="flex justify-end">
                                <div className="w-full md:w-96 border border-gray-300 rounded-lg overflow-hidden bg-white">
                                    <div className="space-y-1 p-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700">Ara Toplam:</span>
                                            <span className="text-gray-900 font-medium">{formatCurrency(subTotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700">İndirim:</span>
                                            <span className="text-gray-900 font-medium">-{formatCurrency(formData.discountAmount || 0)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700">KDV ({formData.taxRate || 18}%):</span>
                                            <span className="text-gray-900 font-medium">{formatCurrency((subTotal - (formData.discountAmount || 0)) * ((formData.taxRate || 18) / 100))}</span>
                                        </div>
                                        <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between">
                                            <span className="text-gray-800 font-bold">Genel Toplam:</span>
                                            <span className="text-blue-700 font-bold">{formatCurrency(formData.totalAmount || 0)}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 border-t border-gray-300">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    İndirim (₺)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="discountAmount"
                                                    value={formData.discountAmount || 0}
                                                    onChange={handleInputChange}
                                                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    KDV (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="taxRate"
                                                    value={formData.taxRate || 18}
                                                    onChange={handleInputChange}
                                                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Fatura Bilgileri */}
                    {activeTab === 'invoice' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
                                <h3 className="text-base font-medium text-gray-800 mb-3">Fatura Bilgileri</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fatura Numarası
                                </label>
                                <input
                                            type="text"
                                    name="invoiceNumber"
                                            value={formData.invoiceNumber}
                                            onChange={handleInputChange}
                                            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="Fatura numarası"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fatura Tarihi
                                        </label>
                                        <div className="relative">
                                            <DatePicker
                                                selected={formData.invoiceDate ? new Date(formData.invoiceDate) : null}
                                                onChange={(date: Date | null) => handleDatePickerChange(date, 'invoiceDate')}
                                                dateFormat="dd/MM/yyyy"
                                                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholderText="Fatura tarihi seçin"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 mt-4 pt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Fatura Adresi</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Adres Satırı 1
                                            </label>
                                            <input
                                                type="text"
                                                name="invoiceAddressLine1"
                                                value={formData.invoiceAddressLine1}
                                                onChange={handleInputChange}
                                                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="Adres satırı 1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Adres Satırı 2
                                            </label>
                                            <input
                                                type="text"
                                                name="invoiceAddressLine2"
                                                value={formData.invoiceAddressLine2}
                                                onChange={handleInputChange}
                                                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="Adres satırı 2 (opsiyonel)"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Şehir
                                            </label>
                                            <input
                                                type="text"
                                                name="invoiceCity"
                                                value={formData.invoiceCity}
                                                onChange={handleInputChange}
                                                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="Şehir"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Posta Kodu
                                            </label>
                                            <input
                                                type="text"
                                                name="invoicePostalCode"
                                                value={formData.invoicePostalCode}
                                                onChange={handleInputChange}
                                                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="Posta kodu"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 mt-4 pt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Vergi Bilgileri</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Vergi Dairesi
                                            </label>
                                            <input
                                                type="text"
                                                name="taxOffice"
                                                value={formData.taxOffice}
                                                onChange={handleInputChange}
                                                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="Vergi dairesi"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Vergi / TC Kimlik No
                                            </label>
                                            <input
                                                type="text"
                                                name="taxNumber"
                                                value={formData.taxNumber}
                                                onChange={handleInputChange}
                                                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="Vergi numarası veya TC kimlik no"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Teslimat Bilgileri */}
                    {activeTab === 'delivery' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-base font-medium text-gray-800">Teslimat Bilgileri</h3>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="sameAsInvoice"
                                            name="sameAsInvoice"
                                            checked={formData.sameAsInvoice}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                handleInputChange(createChangeEvent('sameAsInvoice', checked));

                                                if (checked) {
                                                    // Fatura bilgilerini teslimat bilgilerine kopyala
                                                    handleInputChange(createChangeEvent('deliveryAddressLine1', formData.invoiceAddressLine1));
                                                    handleInputChange(createChangeEvent('deliveryAddressLine2', formData.invoiceAddressLine2));
                                                    handleInputChange(createChangeEvent('deliveryCity', formData.invoiceCity));
                                                    handleInputChange(createChangeEvent('deliveryPostalCode', formData.invoicePostalCode));
                                                }
                                            }}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="sameAsInvoice" className="ml-2 text-sm text-gray-700">
                                            Fatura adresi ile aynı
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Adres Satırı 1
                                        </label>
                                        <input
                                            type="text"
                                            name="deliveryAddressLine1"
                                            value={formData.deliveryAddressLine1}
                                            onChange={handleInputChange}
                                            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="Teslimat adresi satırı 1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Adres Satırı 2
                                </label>
                                        <input
                                            type="text"
                                            name="deliveryAddressLine2"
                                            value={formData.deliveryAddressLine2}
                                            onChange={handleInputChange}
                                            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="Teslimat adresi satırı 2 (opsiyonel)"
                                />
                            </div>
                            <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Şehir
                                </label>
                                        <input
                                            type="text"
                                            name="deliveryCity"
                                            value={formData.deliveryCity}
                                            onChange={handleInputChange}
                                            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="Şehir"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Posta Kodu
                                        </label>
                                        <input
                                            type="text"
                                            name="deliveryPostalCode"
                                            value={formData.deliveryPostalCode}
                                            onChange={handleInputChange}
                                            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="Posta kodu"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 mt-4 pt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Teslimat Notları</h4>
                                    <textarea
                                        name="deliveryNotes"
                                        value={formData.deliveryNotes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Teslimat talimatları veya notları..."
                                    />
                                </div>

                                <div className="border-t border-gray-200 mt-4 pt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Teslimat Tarihi</h4>
                                    <div className="relative">
                                        <DatePicker
                                            selected={formData.deliveryDate ? new Date(formData.deliveryDate) : null}
                                            onChange={(date: Date | null) => handleDatePickerChange(date, 'deliveryDate')}
                                            dateFormat="dd/MM/yyyy"
                                            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholderText="Teslimat tarihi seçin"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ödeme Bilgileri */}
                    {activeTab === 'payment' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
                                <h3 className="text-base font-medium text-gray-800 mb-3">Ödeme Bilgileri</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ödeme Yöntemi
                                </label>
                                        <select
                                    name="paymentMethod"
                                            value={formData.paymentMethod}
                                    onChange={handleInputChange}
                                            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                            <option value="">Seçiniz...</option>
                                    <option value="Nakit">Nakit</option>
                                    <option value="Kredi Kartı">Kredi Kartı</option>
                                            <option value="Banka Transferi">Banka Transferi</option>
                                    <option value="Çek">Çek</option>
                                            <option value="Diğer">Diğer</option>
                                </select>
                            </div>

                            <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ödeme Durumu
                                </label>
                                        <select
                                    name="paymentStatus"
                                            value={formData.paymentStatus}
                                    onChange={handleInputChange}
                                            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                            <option value="">Seçiniz...</option>
                                    <option value="Ödendi">Ödendi</option>
                                    <option value="Beklemede">Beklemede</option>
                                    <option value="Kısmi Ödeme">Kısmi Ödeme</option>
                                            <option value="İptal Edildi">İptal Edildi</option>
                                </select>
                                    </div>
                            </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ödeme Tarihi
                                </label>
                                    <div className="relative">
                                        <DatePicker
                                            selected={formData.paymentDate ? new Date(formData.paymentDate) : null}
                                            onChange={(date: Date | null) => handleDatePickerChange(date, 'paymentDate')}
                                            dateFormat="dd/MM/yyyy"
                                            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholderText="Ödeme tarihi seçin"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                            </div>
                                </div>

                                <div className="border-t border-gray-200 mt-4 pt-4">
                                    <div className="flex justify-between">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Ödenen Tutar
                                        </label>
                                        <div className="text-sm text-gray-500">
                                            Toplam: {formatCurrency(formData.totalAmount || 0)}
                                        </div>
                                    </div>
                                    <div className="mt-2 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">₺</span>
                                        </div>
                                            <input
                                                type="number"
                                            name="amountPaid"
                                            value={formData.amountPaid}
                                            onChange={handleInputChange}
                                            className="block w-full rounded-md border border-gray-300 bg-white pl-7 pr-12 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center">
                                            <span className="text-gray-500 mr-3 text-sm">
                                                Kalan: {formatCurrency(formData.totalAmount || 0 - (parseFloat(formData.amountPaid || '0') || 0))}
                                            </span>
                                    </div>
                                </div>
                            </div>

                                <div className="border-t border-gray-200 mt-4 pt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ödeme Notları
                                    </label>
                                    <textarea
                                        name="paymentNotes"
                                        value={formData.paymentNotes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Ödeme ile ilgili notlar..."
                                    />
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

export { SalesForm }; 