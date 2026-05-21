const previewItems = [
  "DİJİTAL KATALOG",
  "KOLAY ÜRÜN SEÇİMİ",
  "HIZLI SİPARİŞ",
  "FATURALI SATIŞ",
];

const progressStartDate = new Date("2026-05-21T00:00:00+03:00");
const progressStartValue = 82;
const dayInMilliseconds = 24 * 60 * 60 * 1000;

function getCatalogProgress() {
  const elapsedDays = Math.max(
    0,
    Math.floor((Date.now() - progressStartDate.getTime()) / dayInMilliseconds)
  );

  return Math.min(100, progressStartValue + elapsedDays);
}

export function ComingSoonHome() {
  const catalogProgress = getCatalogProgress();

  return (
    <main className="h-screen w-full max-w-full overflow-hidden bg-[#f8f6f2] text-black supports-[height:100dvh]:h-[100dvh]">
      <section className="home-ready-section mx-auto flex h-full w-full max-w-2xl flex-col overflow-hidden px-5 py-3 sm:px-8 sm:py-5">
        <header className="flex shrink-0 justify-center">
          <img
            src="/kudattr.png"
            alt="Kudat Bijuteri"
            className="home-ready-logo h-auto w-[634px] max-w-full object-contain sm:w-[420px]"
          />
        </header>

        <div className="home-ready-content flex min-h-0 flex-1 flex-col justify-start pb-3 pt-0 sm:pb-5 sm:pt-2">
          <div className="mx-auto w-full max-w-[520px] overflow-hidden text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-black/36">
              Yakında Hizmetinizde
            </p>

            <div className="home-ready-progress mx-auto mt-4 w-full max-w-[300px] text-left sm:mt-5">
              <div className="flex items-center gap-3">
                <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-black/7">
                  <div
                    className="relative h-full overflow-hidden rounded-full bg-black/62"
                    style={{ width: `${catalogProgress}%` }}
                  >
                    <span className="absolute inset-y-0 -left-1/2 w-1/2 animate-[progressShine_2.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/45 to-transparent" />
                  </div>
                </div>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/42">
                  {catalogProgress}%
                </span>
              </div>
            </div>

            <h1 className="home-ready-title mt-5 text-[42px] font-semibold leading-[0.95] tracking-[-0.07em] text-black sm:mt-4 sm:text-[56px]">
              Yeni kataloğumuz hazırlanıyor.
            </h1>

            <p className="home-ready-copy mx-auto mt-5 max-w-[400px] text-[16px] leading-[1.65] tracking-[-0.02em] text-black/52 sm:mt-4 sm:text-[17px] sm:leading-7">
              Kudat Bijuteri ürünlerine daha kolay ulaşmanız için dijital katalog
              altyapımızı yeniliyoruz. Çok yakında ürünleri inceleyip sipariş
              talebinizi pratik bir şekilde iletebileceksiniz.
            </p>

            <div className="home-ready-badges mt-5 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2.5 sm:mt-6 sm:gap-2.5">
              {previewItems.map((item) => (
                <div
                  key={item}
                  className="home-ready-badge min-w-0 truncate whitespace-nowrap rounded-full border border-black/7 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(255,255,255,0.28))] px-1.5 py-3 text-center text-[clamp(8px,2.35vw,12px)] font-semibold tracking-[0.01em] text-black/64 backdrop-blur-xl sm:px-4"
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
