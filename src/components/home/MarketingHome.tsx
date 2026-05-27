import Link from "next/link";
import {
  defaultMarketingHomeContent,
  type MarketingHomeProduct,
  type MarketingHomeContent,
} from "@/services/marketingHomeService";

type MarketingHomeProps = {
  content?: MarketingHomeContent;
  featuredProducts?: MarketingHomeProduct[];
};

export function MarketingHome({
  content = defaultMarketingHomeContent,
  featuredProducts,
}: MarketingHomeProps) {
  const heroImages = content.heroImages;
  const visibleFeaturedProducts =
    featuredProducts?.length ? featuredProducts : content.featuredProducts;

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f6f2] text-black">
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 pb-10 pt-5 sm:px-8 sm:pb-14 sm:pt-8 lg:min-h-[88vh] lg:grid-cols-[1fr_0.92fr] lg:items-center lg:gap-14">
        <div className="min-w-0">
          <img
            src={content.logo}
            alt="Kudat Bijuteri"
            className="mx-auto h-auto w-[176px] object-contain sm:mx-0 sm:w-[178px]"
          />
          <p className="mt-10 text-[10px] font-semibold uppercase tracking-[0.24em] text-black/38 sm:mt-12 sm:text-[11px]">
            {content.eyebrow}
          </p>
          <h1 className="mt-4 max-w-[760px] text-[42px] font-semibold leading-[0.98] text-black sm:text-[64px] lg:text-[70px]">
            {content.title}
          </h1>
          <p className="mt-5 max-w-[500px] text-[16px] leading-7 text-black/58 sm:mt-6 sm:text-[17px] sm:leading-8">
            {content.body}
          </p>
          <div className="mt-7 grid gap-2.5 sm:mt-8 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <Link
              href={content.primaryCtaHref}
              className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-black/82"
            >
              {content.primaryCtaLabel}
            </Link>
            <Link
              href={content.secondaryCtaHref}
              className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 px-6 text-sm font-semibold text-black/68 transition hover:border-black hover:text-black"
            >
              {content.secondaryCtaLabel}
            </Link>
          </div>
        </div>

        {heroImages.length ? (
          <div className="relative -mx-1 sm:mx-0">
            <div className="grid grid-cols-[0.9fr_1fr] gap-2.5 sm:gap-4">
              <img
                src={heroImages[0]}
                alt="Kudat ana ürün görseli"
                className="mt-10 aspect-[0.82] w-full rounded-[22px] object-cover sm:mt-14 sm:rounded-[28px]"
              />
              <div className="grid gap-2.5 sm:gap-4">
                {heroImages[1] ? (
                  <img
                    src={heroImages[1]}
                    alt="Kudat koleksiyon görseli"
                    className="aspect-[1.08] w-full rounded-[22px] object-cover sm:rounded-[28px]"
                  />
                ) : null}
                {heroImages[2] ? (
                  <img
                    src={heroImages[2]}
                    alt="Kudat ürün detayı"
                    className="aspect-[1.08] w-full rounded-[22px] object-cover sm:rounded-[28px]"
                  />
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {content.collections.length ? (
        <section className="border-y border-black/[0.06] bg-white/44">
          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-black/34 sm:hidden">
              {content.collectionsEyebrow}
            </p>
            <div className="grid gap-6 sm:gap-5 lg:grid-cols-3">
              {content.collections.map((collection) => (
                <Link key={collection.title} href={collection.href} className="group block">
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="aspect-[1.08] w-full rounded-[22px] object-cover sm:rounded-[24px]"
                  />
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-[21px] font-semibold leading-7 text-black">
                        {collection.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-black/50">
                        {collection.text}
                      </p>
                    </div>
                    <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-lg text-white transition group-hover:translate-x-1">
                      ›
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 sm:py-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:gap-10">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/36 sm:text-[11px]">
            {content.reasonsEyebrow}
          </p>
          <h2 className="mt-3 text-[32px] font-semibold leading-tight text-black sm:text-[36px]">
            {content.reasonsTitle}
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {content.reasons.map((reason, index) => (
            <div
              key={`${reason}-${index}`}
              className="rounded-[22px] border border-black/[0.06] bg-white/56 p-5"
            >
              <span className="text-xs font-semibold text-black/34">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-7 text-[16px] font-semibold leading-6 text-black sm:mt-8 sm:text-[17px]">
                {reason}
              </p>
            </div>
          ))}
        </div>
      </section>

      {visibleFeaturedProducts.length ? (
        <section className="bg-[#efede8]">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/36 sm:text-[11px]">
                  {content.featuredEyebrow}
                </p>
                <h2 className="mt-3 text-[32px] font-semibold leading-tight text-black sm:text-[36px]">
                  {content.featuredTitle}
                </h2>
              </div>
              <Link
                href={content.featuredLinkHref}
                className="text-sm font-semibold text-black/58 hover:text-black"
              >
                {content.featuredLinkLabel}
              </Link>
            </div>

            <div className="mt-7 grid gap-6 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
              {visibleFeaturedProducts.map((product) => (
                <Link key={product.name} href={product.href} className="group block">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="aspect-square w-full rounded-[22px] object-cover sm:rounded-[24px]"
                  />
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-black">
                        {product.name}
                      </h3>
                      <p className="mt-1 truncate text-sm text-black/44">
                        {product.category}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-black/42 transition group-hover:text-black">
                      İncele
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14">
        <div className="rounded-[26px] bg-black p-5 text-white sm:rounded-[30px] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42 sm:text-[11px]">
                {content.processEyebrow}
              </p>
              <h2 className="mt-3 text-[29px] font-semibold leading-tight sm:text-[32px]">
                {content.processTitle}
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {content.processSteps.map((step, index) => (
                <div key={`${step}-${index}`} className="rounded-[22px] bg-white/[0.08] p-4">
                  <span className="text-xs font-semibold text-white/38">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-7 text-sm font-semibold leading-5 text-white sm:mt-8">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-14 text-center sm:px-8 sm:pb-16">
        <h2 className="text-[34px] font-semibold leading-tight text-black sm:text-[38px]">
          {content.finalTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[16px] leading-7 text-black/52">
          {content.finalBody}
        </p>
        <Link
          href={content.finalCtaHref}
          className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-black px-7 text-sm font-semibold text-white"
        >
          {content.finalCtaLabel}
        </Link>
      </section>
    </main>
  );
}
