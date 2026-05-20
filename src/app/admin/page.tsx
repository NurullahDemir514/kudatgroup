import Link from "next/link";

export default function AdminHomePage() {
    return (
        <section className="flex min-h-[calc(100vh-8rem)] items-center">
            <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/35">
                    Kudat Yönetim
                </p>
                <h1 className="mt-5 text-4xl font-semibold leading-[0.96] tracking-[-0.05em] text-black sm:text-6xl">
                    Kataloğu sade şekilde yönetin.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-black/52">
                    Ana kategori oluşturun, alt kategori ekleyin ve ürünleri doğru
                    kategoriye yükleyin. Müşteri katalog tarafında aynı ağaç yapısını
                    görür.
                </p>
                <Link
                    href="/admin/catalog"
                    className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/85"
                >
                    Katalog yönetimine geç
                </Link>
            </div>
        </section>
    );
}
