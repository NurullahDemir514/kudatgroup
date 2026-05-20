import Link from "next/link";

export default function ToptanSatisPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
        <p className="text-xs uppercase tracking-[0.24em] text-black/45">Kudat</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Toptan satış</h1>
        <p className="mt-4 text-sm leading-6 text-black/55">
          Toptan satış tasarımı sıfırlandı. Katalog bağlantısı korunuyor.
        </p>
        <Link href="/katalog" className="mt-8 rounded-2xl bg-black px-5 py-4 text-center text-sm font-medium text-white">
          Kataloğa git
        </Link>
      </div>
    </main>
  );
}
