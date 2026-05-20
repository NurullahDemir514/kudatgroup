const previewItems = [
  "DİJİTAL KATALOG",
  "KOLAY ÜRÜN SEÇİMİ",
  "HIZLI SİPARİŞ",
  "FATURALI SATIŞ",
];

export default function Home() {
  return (
    <main className="h-screen w-full max-w-full overflow-hidden bg-[#f8f6f2] text-black supports-[height:100dvh]:h-[100dvh]">
      <section className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-hidden px-5 py-3 sm:px-8 sm:py-5">
        <header className="flex shrink-0 justify-center">
          <img
            src="/kudattr.png"
            alt="Kudat Bijuteri"
            className="h-auto w-[634px] max-w-full object-contain sm:w-[420px]"
          />
        </header>

        <div className="flex min-h-0 flex-1 flex-col justify-start pt-0 pb-3 sm:pt-2 sm:pb-5">
          <div className="mx-auto w-full max-w-[520px] overflow-hidden text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-black/36">
              Yakında Hizmetinizde
            </p>

            <h1 className="mt-5 text-[42px] font-semibold leading-[0.95] tracking-[-0.07em] text-black sm:mt-4 sm:text-[56px]">
              Yeni kataloğumuz hazırlanıyor.
            </h1>

            <p className="mx-auto mt-5 max-w-[400px] text-[16px] leading-[1.65] tracking-[-0.02em] text-black/52 sm:mt-4 sm:text-[17px] sm:leading-7">
              Kudat Bijuteri ürünlerine daha kolay ulaşmanız için dijital katalog
              altyapımızı yeniliyoruz. Çok yakında ürünleri inceleyip sipariş
              talebinizi pratik bir şekilde iletebileceksiniz.
            </p>

            <div className="mt-5 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2.5 sm:mt-6 sm:gap-2.5">
              {previewItems.map((item) => (
                <div
                  key={item}
                  className="min-w-0 truncate whitespace-nowrap rounded-full border border-black/7 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(255,255,255,0.28))] px-1.5 py-3 text-center text-[clamp(8px,2.35vw,12px)] font-semibold tracking-[0.01em] text-black/64 backdrop-blur-xl sm:px-4"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="shrink-0 pb-1 text-center">
          <p className="text-[12px] font-medium tracking-[-0.01em] text-black/34">
            Tüm hakları Kudat Group'a aittir.
          </p>
        </footer>
      </section>
    </main>
  );
}
