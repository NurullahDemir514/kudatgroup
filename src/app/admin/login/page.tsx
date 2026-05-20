"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter } from "next/navigation";

function LoginContent() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/access/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Giriş kodu hatalı");
        setIsLoading(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Giriş yapılamadı. Lütfen tekrar deneyin.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f6f2] text-black">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6">
        <header className="flex justify-center pt-4">
          <img
            src="/kudattr.png"
            alt="Kudat Bijuteri"
            className="h-auto w-[190px] object-contain"
          />
        </header>

        <div className="flex flex-1 items-center">
          <div className="w-full">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.26em] text-black/34">
              Yönetim Girişi
            </p>
            <h1 className="mt-4 text-center text-[38px] font-semibold leading-[0.96] tracking-[-0.06em]">
              Katalog paneline erişin.
            </h1>
            <p className="mx-auto mt-5 max-w-[320px] text-center text-[15px] leading-6 tracking-[-0.02em] text-black/48">
              Size iletilen yönetim kodunu girerek katalog, ürün ve sipariş
              alanlarını yönetebilirsiniz.
            </p>

            <form onSubmit={submit} className="mt-9 space-y-4">
              <label className="block">
                <span className="mb-2 block text-[13px] font-medium text-black/48">
                  Yönetim Kodu
                </span>
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  autoFocus
                  autoComplete="one-time-code"
                  inputMode="text"
                  placeholder="Kodu girin"
                  className="h-14 w-full rounded-full border border-black/10 bg-white/70 px-5 text-center text-[18px] font-semibold tracking-[0.08em] text-black outline-none transition placeholder:text-black/24 focus:border-black/25 focus:bg-white"
                  disabled={isLoading}
                />
              </label>

              {error ? (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                className="h-14 w-full rounded-full bg-black text-[15px] font-semibold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-black/35"
              >
                {isLoading ? "Kontrol ediliyor..." : "Panele gir"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
