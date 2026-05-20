const previewItems = [
  "Yeni katalog deneyimi",
  "Kolay ürün seçimi",
  "Hızlı sipariş akışı",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f6f2] text-black">
      <section className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-5 sm:px-8 sm:py-8">
        <header className="flex justify-center">
          <img
            src="/kudattr.png"
            alt="Kudat Bijuteri"
            className="h-auto w-[634px] max-w-full object-contain sm:w-[420px]"
          />
        </header>

        <div className="flex flex-1 flex-col justify-start pt-5 pb-8 sm:pt-7 sm:pb-12">
          <div className="mx-auto w-full max-w-[520px] text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-black/36">
              Yakında Hizmetinizde
            </p>

            <h1 className="mt-5 text-[42px] font-semibold leading-[0.95] tracking-[-0.07em] text-black sm:text-[64px]">
              Yeni kataloğumuz hazırlanıyor.
            </h1>

            <p className="mx-auto mt-5 max-w-[380px] text-[15px] leading-6 tracking-[-0.02em] text-black/52 sm:text-[17px] sm:leading-7">
              Kudat Bijuteri ürünlerine daha kolay ulaşmanız için dijital katalog
              altyapımızı yeniliyoruz. Çok yakında ürünleri inceleyip sipariş
              talebinizi pratik bir şekilde iletebileceksiniz.
            </p>

            <div className="mt-9 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {previewItems.map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-black/8 bg-white/55 px-4 py-3 text-[13px] font-medium tracking-[-0.02em] text-black/62 shadow-[0_14px_45px_rgba(0,0,0,0.04)] backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="pb-2 text-center">
          <p className="text-[12px] font-medium tracking-[-0.01em] text-black/34">
            Faturalı | Yasal Satış
          </p>
        </footer>
      </section>
    </main>
  );
}
