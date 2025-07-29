import mongoose, { Schema, models } from 'mongoose';

export interface IProduct {
    _id?: string;
    name: string;
    description?: string;
    wholesalePrice?: number; // Toptan alım fiyatı
    salePrice: number; // Satış fiyatı (zorunlu)
    originalPrice?: number; // İndirimli ürünler için orijinal fiyat
    stock: number;
    category: string;
    image?: string; // Base64 formatında resim verisi
    supplier?: string; // Tedarikçi bilgisi
    barcode?: string; // Barkod bilgisi
    sku?: string; // Stok Kodu (Stock Keeping Unit)
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, 'Ürün adı zorunlu'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
        wholesalePrice: {
            type: Number,
            min: [0, 'Toptan alım fiyatı 0\'dan küçük olamaz'],
            default: 0,
        },
        salePrice: {
            type: Number,
            required: [true, 'Satış fiyatı zorunlu'],
            min: [0, 'Satış fiyatı 0\'dan küçük olamaz'],
        },
        originalPrice: {
            type: Number,
            min: [0, 'Orijinal fiyat 0\'dan küçük olamaz'],
            default: 0,
        },
        stock: {
            type: Number,
            required: [true, 'Stok zorunlu'],
            min: [0, 'Stok 0\'dan küçük olamaz'],
            default: 0,
        },
        category: {
            type: String,
            required: [true, 'Kategori zorunlu'],
            trim: true,
        },
        image: {
            type: String, // Base64 data:image/ formatında string veri
            default: '',
        },
        supplier: {
            type: String,
            default: '',
            trim: true,
        },
        barcode: {
            type: String,
            default: '',
            trim: true,
        },
        sku: {
            type: String,
            default: '',
            trim: true,
        },
    },
    { timestamps: true }
);

// Modeli sadece bir kez oluştur
export const Product = mongoose.models.Product as mongoose.Model<IProduct> || mongoose.model<IProduct>('Product', productSchema); 