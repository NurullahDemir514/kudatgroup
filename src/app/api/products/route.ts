import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/services/firebaseServices';
import { getAdminCatalogProducts } from '@/services/catalogProductService';
import {
    getAdminCatalogCategories,
    type AdminCatalogCategory,
} from '@/services/catalogCategoryService';

const categoryWordMap: Record<string, string> = {
    bijuteri: 'Bijuteri',
    bujiteri: 'Bijuteri',
    celik: 'Çelik',
    yuzuk: 'Yüzük',
    kupe: 'Küpe',
    bileklik: 'Bileklik',
    kolye: 'Kolye',
    xuping: 'Xuping',
};

function cleanCategoryTitle(value: string) {
    const normalized = value
        .trim()
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\b[uü]r[uü]nlerimiz\b/gi, '')
        .trim();

    if (!normalized) return '';

    return normalized
        .split(' ')
        .map((word) => {
            const key = word.toLocaleLowerCase('tr-TR');
            const mapped = categoryWordMap[key];
            if (mapped) return mapped;
            return `${key.charAt(0).toLocaleUpperCase('tr-TR')}${key.slice(1)}`;
        })
        .join(' ')
        .trim();
}

function categoryPathFor(
    categoryId: string,
    categoriesById: Map<string, AdminCatalogCategory>
) {
    const path: string[] = [];
    const visited = new Set<string>();
    let currentId = categoryId.trim();

    while (currentId && !visited.has(currentId)) {
        visited.add(currentId);
        const category = categoriesById.get(currentId);
        if (!category) break;
        const title = cleanCategoryTitle(category.title || category.slug || category.id);
        if (title) path.unshift(title);
        currentId = category.parentId ?? '';
    }

    if (!path.length && categoryId.trim()) {
        const fallback = cleanCategoryTitle(categoryId);
        if (fallback) path.push(fallback);
    }

    if (path.length >= 2) {
        const main = path[0];
        return path.map((item, index) => {
            if (index === 0) return item;
            const prefix = `${main} `;
            return item.toLocaleLowerCase('tr-TR').startsWith(prefix.toLocaleLowerCase('tr-TR'))
                ? item.slice(prefix.length).trim()
                : item;
        }).filter(Boolean);
    }

    return path;
}

// Tüm ürünleri getir
export async function GET(request: NextRequest) {
    try {
        const source = request.nextUrl.searchParams.get('source');
        if (source === 'legacy') {
            const legacyProducts = await productService.getAll();
            return NextResponse.json({ success: true, data: legacyProducts });
        }

        const [legacyProducts, catalogProducts, catalogCategories] = await Promise.all([
            productService.getAll(),
            getAdminCatalogProducts(),
            getAdminCatalogCategories(),
        ]);
        const categoriesById = new Map(
            catalogCategories.map((category) => [category.id, category])
        );
        const mappedCatalogProducts = catalogProducts
            .filter((product) => product.isActive !== false)
            .map((product) => {
                const categoryPath = categoryPathFor(product.categoryId, categoriesById);
                const mainCategory = categoryPath[0] ?? '';
                const subCategory = categoryPath.length > 1
                    ? categoryPath[categoryPath.length - 1]
                    : '';

                return {
                    id: product.id,
                    name: product.name,
                    code: product.code,
                    category: categoryPath.join(' / ') || product.categoryId,
                    categoryId: product.categoryId,
                    categoryPath,
                    categoryMain: mainCategory,
                    mainCategory,
                    categoryTitle: subCategory || mainCategory,
                    subCategory,
                    image: product.imageSrc || '',
                    wholesalePrice: product.purchasePrice || 0,
                    salePrice: product.price || 0,
                    stock: product.stock || 0,
                    supplier: product.supplier || '',
                    source: 'catalog',
                    catalogId: product.id,
                };
            });
        const products = mappedCatalogProducts.length
            ? mappedCatalogProducts
            : legacyProducts;

        return NextResponse.json({ success: true, data: products });
    } catch (error) {
        console.error('Ürün listeleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Yeni ürün ekle
export async function POST(request: NextRequest) {
    try {

        const data = await request.json();

        // Price alanını temizle (artık kullanılmıyor)
        if (data.price !== undefined) {
            delete data.price;
        }
        delete data.description;

        // Zorunlu alanları kontrol et
        if (!data.name || !data.salePrice || !data.category) {
            return NextResponse.json(
                { success: false, error: 'Ürün adı, satış fiyatı ve kategori alanları zorunludur' },
                { status: 400 }
            );
        }

        // Sayısal değerleri kontrol et
        const wholesalePrice = parseFloat(data.wholesalePrice);
        const salePrice = parseFloat(data.salePrice);
        const stock = parseInt(data.stock);

        if (
            (data.wholesalePrice && isNaN(wholesalePrice)) ||
            isNaN(salePrice) ||
            (data.stock && isNaN(stock))
        ) {
            return NextResponse.json(
                { success: false, error: 'Fiyat ve stok değerleri sayısal olmalıdır' },
                { status: 400 }
            );
        }

        // Negatif değer kontrolü
        if (
            (data.wholesalePrice && wholesalePrice < 0) ||
            salePrice < 0 ||
            (data.stock && stock < 0)
        ) {
            return NextResponse.json(
                { success: false, error: 'Fiyat ve stok değerleri negatif olamaz' },
                { status: 400 }
            );
        }

        // Yeni ürün oluştur (Firebase)
        const newProduct = await productService.create({
            ...data,
            wholesalePrice: data.wholesalePrice ? wholesalePrice : undefined,
            salePrice,
            stock: data.stock ? stock : 0
        });

        return NextResponse.json(
            { success: true, data: newProduct },
            { status: 201 }
        );
    } catch (error) {
        console.error('Ürün ekleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
} 
