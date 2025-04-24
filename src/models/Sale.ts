import mongoose, { Schema, models } from 'mongoose';
import { IProduct } from './Product';

// Satış kalemini temsil eden interface
export interface ISaleItem {
    product: string | IProduct; // Ürün ID'si veya ürün nesnesi
    productName: string; // Ürün adı (satış zamanında)
    quantity: number; // Satılan miktar
    unitPrice: number; // Birim fiyat (satış zamanında)
    totalPrice: number; // Toplam fiyat (miktar * birim fiyat)
}

// Satış belgesini temsil eden interface
export interface ISale {
    _id?: string;
    customerName: string; // Müşteri adı
    customerPhone?: string; // Müşteri telefonu (opsiyonel)
    customerEmail?: string; // Müşteri email (opsiyonel)
    items: ISaleItem[]; // Satış kalemleri
    totalAmount: number; // Toplam satış tutarı
    paymentMethod: string; // Ödeme yöntemi
    notes?: string; // Notlar (opsiyonel)
    saleDate: Date; // Satış tarihi
    createdAt: Date; // Kayıt tarihi
    updatedAt: Date; // Son güncelleme tarihi

    // Fatura bilgileri
    invoiceNumber?: string; // Fatura numarası
    invoiceAddress?: string; // Fatura adresi
    taxNumber?: string; // Vergi numarası

    // Teslimat bilgileri
    deliveryAddress?: string; // Teslimat adresi
    deliveryDate?: Date; // Teslimat tarihi

    // Ödeme detayları
    paymentStatus?: string; // Ödeme durumu
    dueDate?: Date; // Son ödeme tarihi
    discountAmount?: number; // İndirim tutarı
    taxRate?: number; // Vergi oranı

    // Sipariş durumu
    orderStatus?: string; // Sipariş durumu
}

// Satış kalemi şeması
const saleItemSchema = new Schema<ISaleItem>({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Ürün bilgisi zorunludur'],
    },
    productName: {
        type: String,
        required: [true, 'Ürün adı zorunludur'],
        trim: true,
    },
    quantity: {
        type: Number,
        required: [true, 'Miktar zorunludur'],
        min: [1, 'Miktar en az 1 olmalıdır'],
    },
    unitPrice: {
        type: Number,
        required: [true, 'Birim fiyat zorunludur'],
        min: [0, 'Birim fiyat 0\'dan küçük olamaz'],
    },
    totalPrice: {
        type: Number,
        required: [true, 'Toplam fiyat zorunludur'],
        min: [0, 'Toplam fiyat 0\'dan küçük olamaz'],
    },
});

// Satış şeması
const saleSchema = new Schema<ISale>(
    {
        customerName: {
            type: String,
            required: [true, 'Müşteri adı zorunludur'],
            trim: true,
        },
        customerPhone: {
            type: String,
            trim: true,
        },
        customerEmail: {
            type: String,
            trim: true,
        },
        items: {
            type: [saleItemSchema],
            required: [true, 'En az bir ürün eklemelisiniz'],
            validate: {
                validator: function (items: ISaleItem[]) {
                    return items.length > 0;
                },
                message: 'En az bir ürün eklemelisiniz',
            },
        },
        totalAmount: {
            type: Number,
            required: [true, 'Toplam tutar zorunludur'],
            min: [0, 'Toplam tutar 0\'dan küçük olamaz'],
        },
        paymentMethod: {
            type: String,
            required: [true, 'Ödeme yöntemi zorunludur'],
            enum: ['Nakit', 'Kredi Kartı', 'Havale/EFT', 'Diğer'],
            default: 'Nakit',
        },
        notes: {
            type: String,
            trim: true,
        },
        saleDate: {
            type: Date,
            required: [true, 'Satış tarihi zorunludur'],
            default: Date.now,
        },

        // Fatura bilgileri
        invoiceNumber: {
            type: String,
            trim: true,
        },
        invoiceAddress: {
            type: String,
            trim: true,
        },
        taxNumber: {
            type: String,
            trim: true,
        },

        // Teslimat bilgileri
        deliveryAddress: {
            type: String,
            trim: true,
        },
        deliveryDate: {
            type: Date,
        },

        // Ödeme detayları
        paymentStatus: {
            type: String,
            enum: ['Ödendi', 'Beklemede', 'Kısmi Ödeme'],
            default: 'Ödendi',
        },
        dueDate: {
            type: Date,
        },
        discountAmount: {
            type: Number,
            min: [0, 'İndirim tutarı 0\'dan küçük olamaz'],
            default: 0,
        },
        taxRate: {
            type: Number,
            min: [0, 'Vergi oranı 0\'dan küçük olamaz'],
            default: 18,
        },

        // Sipariş durumu
        orderStatus: {
            type: String,
            enum: ['Tamamlandı', 'İşlemde', 'Kargoda', 'İptal Edildi'],
            default: 'Tamamlandı',
        },
    },
    { timestamps: true }
);

// Satış yapıldığında stok kontrolü ve güncelleme için middleware eklenebilir
// Örneğin:
/*
saleSchema.pre('save', async function(next) {
    if (this.isNew && this.status === 'completed') {
        const product = await mongoose.model('Product').findById(this.productId);
        
        if (!product) {
            return next(new Error('Ürün bulunamadı'));
        }
        
        if (product.stock < this.quantity) {
            return next(new Error('Yetersiz stok'));
        }
        
        // Stok güncelleme
        await mongoose.model('Product').findByIdAndUpdate(
            this.productId,
            { $inc: { stock: -this.quantity } }
        );
    }
    next();
});
*/

// Modeli sadece bir kez oluştur
export const Sale = mongoose.models.Sale as mongoose.Model<ISale> || mongoose.model<ISale>('Sale', saleSchema); 