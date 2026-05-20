"use client";

import { FormEvent, useState } from "react";

export default function AdminSettingsPage() {
  const [currentCode, setCurrentCode] = useState("");
  const [nextCode, setNextCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (nextCode !== confirmCode) {
      setError("Yeni kodlar eşleşmiyor.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/access/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentCode, nextCode }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Kod güncellenemedi.");
        setIsSaving(false);
        return;
      }

      setCurrentCode("");
      setNextCode("");
      setConfirmCode("");
      setMessage("Yönetim kodu güncellendi.");
    } catch {
      setError("Kod güncellenemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/35">
        Güvenlik
      </p>
      <h1 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl">
        Yönetim kodunu güncelleyin.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-black/52">
        Bu kod admin paneline giriş için kullanılır. Kodun kendisi yerine
        Firebase’de hash değeri tutulur; panelden istediğiniz zaman
        değiştirebilirsiniz.
      </p>

      <form onSubmit={submit} className="mt-10 rounded-[32px] bg-white/70 p-5 shadow-sm ring-1 ring-black/6 sm:p-8">
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-black/45">
              Mevcut kod
            </span>
            <input
              value={currentCode}
              onChange={(event) => setCurrentCode(event.target.value)}
              type="password"
              autoComplete="current-password"
              className="h-14 w-full rounded-2xl border border-black/8 bg-[#f7f4ef] px-4 text-[15px] font-medium outline-none transition focus:border-black/25"
              placeholder="Mevcut yönetim kodu"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-black/45">
              Yeni kod
            </span>
            <input
              value={nextCode}
              onChange={(event) => setNextCode(event.target.value)}
              type="password"
              autoComplete="new-password"
              className="h-14 w-full rounded-2xl border border-black/8 bg-[#f7f4ef] px-4 text-[15px] font-medium outline-none transition focus:border-black/25"
              placeholder="En az 6 karakter"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-black/45">
              Yeni kod tekrar
            </span>
            <input
              value={confirmCode}
              onChange={(event) => setConfirmCode(event.target.value)}
              type="password"
              autoComplete="new-password"
              className="h-14 w-full rounded-2xl border border-black/8 bg-[#f7f4ef] px-4 text-[15px] font-medium outline-none transition focus:border-black/25"
              placeholder="Yeni kodu tekrar girin"
            />
          </label>
        </div>

        {error ? (
          <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSaving}
          className="mt-6 h-14 rounded-full bg-black px-6 text-sm font-semibold text-white transition active:scale-[0.99] disabled:bg-black/35"
        >
          {isSaving ? "Güncelleniyor..." : "Kodu güncelle"}
        </button>
      </form>
    </section>
  );
}
