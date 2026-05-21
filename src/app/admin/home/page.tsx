"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  defaultMarketingHomeContent,
  type MarketingHomeCollection,
  type MarketingHomeContent,
} from "@/services/marketingHomeService";

type AdminCatalogProductOption = {
  id: string;
  name: string;
  code?: string;
  imageSrc?: string;
  categoryId: string;
};

type TextListKey = "reasons" | "processSteps";
type ImageListKey = "heroImages";

const inputClass =
  "h-12 w-full rounded-2xl border border-black/[0.08] bg-[#f7f4ef] px-4 text-sm font-medium text-black outline-none transition focus:border-black/25";
const textareaClass =
  "min-h-24 w-full resize-none rounded-2xl border border-black/[0.08] bg-[#f7f4ef] px-4 py-3 text-sm font-medium leading-6 text-black outline-none transition focus:border-black/25";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-black/48">
        {label}
      </span>
      {children}
    </label>
  );
}

function ImageInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "home");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.success && result.url) {
        onChange(String(result.url));
      }
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="rounded-[22px] bg-white/60 p-3 ring-1 ring-black/[0.05]">
      <div className="flex items-start gap-3">
        <img
          src={value || "/kudattr.png"}
          alt=""
          className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-1 ring-black/[0.06]"
        />
        <div className="min-w-0 flex-1">
          <Field label={label}>
            <input
              value={value}
              onChange={(event) => onChange(event.target.value)}
              className={inputClass}
              placeholder="/katalog/gorsel.png veya https://..."
            />
          </Field>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="mt-3 text-xs text-black/45 file:mr-3 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
            onChange={(event) => upload(event.target.files?.[0])}
          />
          {isUploading ? (
            <p className="mt-2 text-xs font-semibold text-black/42">Yükleniyor...</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AdminHomePage() {
  const [content, setContent] = useState<MarketingHomeContent>(
    defaultMarketingHomeContent
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [productOptions, setProductOptions] = useState<AdminCatalogProductOption[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/admin/home");
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || "Ana sayfa içeriği yüklenemedi");
        }
        setContent(result.data);

        const catalogResponse = await fetch("/api/admin/catalog");
        const catalogResult = await catalogResponse.json();
        if (catalogResponse.ok && catalogResult.success) {
          setProductOptions(catalogResult.data.products || []);
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Ana sayfa içeriği yüklenemedi"
        );
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const updateField = (key: keyof MarketingHomeContent, value: string) => {
    setContent((current) => ({ ...current, [key]: value }));
  };

  const updateTextList = (key: TextListKey, index: number, value: string) => {
    setContent((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) =>
        itemIndex === index ? value : item
      ),
    }));
  };

  const updateImageList = (key: ImageListKey, index: number, value: string) => {
    setContent((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) =>
        itemIndex === index ? value : item
      ),
    }));
  };

  const updateCollection = (
    index: number,
    value: Partial<MarketingHomeCollection>
  ) => {
    setContent((current) => ({
      ...current,
      collections: current.collections.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...value } : item
      ),
    }));
  };

  const updateFeaturedProductId = (index: number, value: string) => {
    setContent((current) => ({
      ...current,
      featuredProductIds: current.featuredProductIds.map((item, itemIndex) =>
        itemIndex === index ? value : item
      ),
    }));
  };

  const addFeaturedProductSlot = () => {
    setContent((current) => ({
      ...current,
      featuredProductIds: [...current.featuredProductIds, ""].slice(0, 6),
    }));
  };

  const removeFeaturedProductSlot = (index: number) => {
    setContent((current) => ({
      ...current,
      featuredProductIds: current.featuredProductIds.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/home", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Ana sayfa kaydedilemedi");
      }

      setContent(result.data);
      setMessage("Tanıtım ana sayfası kaydedildi.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Ana sayfa kaydedilemedi"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-[28px] bg-white/60 p-6 text-sm font-semibold text-black/48">
        Ana sayfa içeriği yükleniyor...
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-6xl pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/35">
            Tanıtım Sayfası
          </p>
          <h1 className="mt-3 text-[38px] font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl">
            Ana sayfa vitrini.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-black/52">
            Yayına alınacak tanıtım sayfasındaki metinleri, bağlantıları ve tüm
            görselleri buradan yönetin. Test görünümü: /tanitim
          </p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="h-12 rounded-full bg-black px-6 text-sm font-semibold text-white disabled:bg-black/35"
        >
          {isSaving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>

      {error ? (
        <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {message}
        </p>
      ) : null}

      <section className="mt-8 rounded-[30px] bg-white/70 p-4 ring-1 ring-black/6 sm:p-6">
        <h2 className="text-xl font-semibold tracking-[-0.03em]">İlk ekran</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <Field label="Üst etiket">
            <input
              value={content.eyebrow}
              onChange={(event) => updateField("eyebrow", event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Logo">
            <input
              value={content.logo}
              onChange={(event) => updateField("logo", event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Başlık">
            <textarea
              value={content.title}
              onChange={(event) => updateField("title", event.target.value)}
              className={textareaClass}
            />
          </Field>
          <Field label="Açıklama">
            <textarea
              value={content.body}
              onChange={(event) => updateField("body", event.target.value)}
              className={textareaClass}
            />
          </Field>
          <Field label="Ana buton metni">
            <input
              value={content.primaryCtaLabel}
              onChange={(event) =>
                updateField("primaryCtaLabel", event.target.value)
              }
              className={inputClass}
            />
          </Field>
          <Field label="Ana buton bağlantısı">
            <input
              value={content.primaryCtaHref}
              onChange={(event) =>
                updateField("primaryCtaHref", event.target.value)
              }
              className={inputClass}
            />
          </Field>
          <Field label="İkinci buton metni">
            <input
              value={content.secondaryCtaLabel}
              onChange={(event) =>
                updateField("secondaryCtaLabel", event.target.value)
              }
              className={inputClass}
            />
          </Field>
          <Field label="İkinci buton bağlantısı">
            <input
              value={content.secondaryCtaHref}
              onChange={(event) =>
                updateField("secondaryCtaHref", event.target.value)
              }
              className={inputClass}
            />
          </Field>
        </div>

        <div className="mt-5 grid gap-3">
          {content.heroImages.map((image, index) => (
            <ImageInput
              key={`hero-${index}`}
              label={`Hero görseli ${index + 1}`}
              value={image}
              onChange={(value) => updateImageList("heroImages", index, value)}
            />
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-[30px] bg-white/70 p-4 ring-1 ring-black/6 sm:p-6">
        <h2 className="text-xl font-semibold tracking-[-0.03em]">Koleksiyonlar</h2>
        <div className="mt-5 grid gap-4">
          {content.collections.map((collection, index) => (
            <div key={index} className="rounded-[24px] bg-[#f7f4ef] p-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Field label="Başlık">
                  <input
                    value={collection.title}
                    onChange={(event) =>
                      updateCollection(index, { title: event.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Bağlantı">
                  <input
                    value={collection.href}
                    onChange={(event) =>
                      updateCollection(index, { href: event.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Açıklama">
                  <textarea
                    value={collection.text}
                    onChange={(event) =>
                      updateCollection(index, { text: event.target.value })
                    }
                    className={textareaClass}
                  />
                </Field>
                <ImageInput
                  label="Görsel"
                  value={collection.image}
                  onChange={(value) => updateCollection(index, { image: value })}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-[30px] bg-white/70 p-4 ring-1 ring-black/6 sm:p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Neden Kudat?</h2>
          <div className="mt-5 grid gap-4">
            <Field label="Bölüm başlığı">
              <input
                value={content.reasonsTitle}
                onChange={(event) =>
                  updateField("reasonsTitle", event.target.value)
                }
                className={inputClass}
              />
            </Field>
            {content.reasons.map((reason, index) => (
              <Field key={index} label={`Madde ${index + 1}`}>
                <input
                  value={reason}
                  onChange={(event) =>
                    updateTextList("reasons", index, event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] bg-white/70 p-4 ring-1 ring-black/6 sm:p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Toptan alım akışı</h2>
          <div className="mt-5 grid gap-4">
            <Field label="Bölüm başlığı">
              <input
                value={content.processTitle}
                onChange={(event) =>
                  updateField("processTitle", event.target.value)
                }
                className={inputClass}
              />
            </Field>
            {content.processSteps.map((step, index) => (
              <Field key={index} label={`Adım ${index + 1}`}>
                <input
                  value={step}
                  onChange={(event) =>
                    updateTextList("processSteps", index, event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[30px] bg-white/70 p-4 ring-1 ring-black/6 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.03em]">
              Öne çıkan ürünler
            </h2>
            <p className="mt-1 text-sm font-medium text-black/46">
              Bu bölümde katalogdaki ürünlerden seçim yapın; ad, görsel ve kategori
              otomatik gelir.
            </p>
          </div>
          <button
            type="button"
            onClick={addFeaturedProductSlot}
            disabled={content.featuredProductIds.length >= 6}
            className="h-11 rounded-full bg-black px-4 text-sm font-semibold text-white disabled:bg-black/25"
          >
            Ürün alanı ekle
          </button>
        </div>
        <div className="mt-5 grid gap-3">
          {(content.featuredProductIds.length ? content.featuredProductIds : [""]).map(
            (productId, index) => {
              const selectedProduct = productOptions.find(
                (product) => product.id === productId
              );

              return (
                <div
                  key={`${productId}-${index}`}
                  className="flex flex-col gap-3 rounded-[24px] bg-[#f7f4ef] p-3 sm:flex-row sm:items-center"
                >
                  <img
                    src={selectedProduct?.imageSrc || "/kudattr.png"}
                    alt=""
                    className="h-20 w-20 rounded-2xl object-cover ring-1 ring-black/[0.06]"
                  />
                  <div className="min-w-0 flex-1">
                    <Field label={`Ürün ${index + 1}`}>
                      <select
                        value={productId}
                        onChange={(event) =>
                          updateFeaturedProductId(index, event.target.value)
                        }
                        className={inputClass}
                      >
                        <option value="">Ürün seçin</option>
                        {productOptions.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                            {product.code ? ` · ${product.code}` : ""}
                          </option>
                        ))}
                      </select>
                    </Field>
                    {selectedProduct ? (
                      <p className="mt-2 text-xs font-semibold text-black/42">
                        Seçili ürün: {selectedProduct.name}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFeaturedProductSlot(index)}
                    className="h-11 rounded-full px-4 text-sm font-semibold text-red-600"
                  >
                    Kaldır
                  </button>
                </div>
              );
            }
          )}
        </div>
      </section>

      <section className="mt-5 rounded-[30px] bg-white/70 p-4 ring-1 ring-black/6 sm:p-6">
        <h2 className="text-xl font-semibold tracking-[-0.03em]">Son çağrı alanı</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <Field label="Başlık">
            <input
              value={content.finalTitle}
              onChange={(event) => updateField("finalTitle", event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Buton metni">
            <input
              value={content.finalCtaLabel}
              onChange={(event) =>
                updateField("finalCtaLabel", event.target.value)
              }
              className={inputClass}
            />
          </Field>
          <Field label="Açıklama">
            <textarea
              value={content.finalBody}
              onChange={(event) => updateField("finalBody", event.target.value)}
              className={textareaClass}
            />
          </Field>
          <Field label="Buton bağlantısı">
            <input
              value={content.finalCtaHref}
              onChange={(event) =>
                updateField("finalCtaHref", event.target.value)
              }
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <div className="sticky bottom-4 mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="h-12 rounded-full bg-black px-7 text-sm font-semibold text-white shadow-2xl disabled:bg-black/35"
        >
          {isSaving ? "Kaydediliyor..." : "Değişiklikleri kaydet"}
        </button>
      </div>
    </form>
  );
}
