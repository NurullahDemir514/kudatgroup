"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { loginSchema, LoginFormValues } from "@/schemas/authSchemas";
import { Suspense } from 'react';

// Login içeriğini ayrı bir bileşene taşıyoruz
function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await signIn("credentials", {
                redirect: false,
                username: data.username,
                password: data.password,
            });

            if (result?.error) {
                setError("Geçersiz kullanıcı adı veya şifre");
                setIsLoading(false);
                return;
            }

            router.push("/admin");
        } catch (error) {
            setError("Bir hata oluştu. Lütfen tekrar deneyin.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 login-container">
            {/* Arka plan desenler ve blob efektleri */}
            <div className="login-blob" style={{ top: '20%', left: '10%', width: '300px', height: '300px', background: 'var(--accent-gold)', opacity: 0.15 }}></div>
            <div className="login-blob" style={{ bottom: '30%', right: '15%', width: '250px', height: '250px', background: 'var(--accent-silver)', opacity: 0.15 }}></div>
            <div className="login-blob" style={{ top: '60%', left: '25%', width: '200px', height: '200px', background: '#606060', opacity: 0.1, animation: 'float 6s ease-in-out infinite' }}></div>

            <div className="w-full max-w-md relative">
                {/* Logo ve başlık */}
                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-28 h-28 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center shadow-lg border border-gray-700 z-10" style={{ animation: 'pulse 3s infinite ease-in-out' }}>
                    <div className="text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-400">KS</div>
                </div>

                {/* Kart bileşeni */}
                <div className="login-card rounded-xl overflow-hidden shadow-2xl">
                    {/* Üst kısım */}
                    <div className="pt-16 pb-6 px-8 bg-gradient-to-b from-gray-800/30 to-transparent">
                        <h1 className="login-title text-3xl font-serif font-bold text-center">
                            Kudat Steel Jewelry
                        </h1>
                        <p className="mt-1 text-center text-gray-400 text-sm">
                            Yönetim Paneli
                        </p>
                    </div>

                    {/* Giriş formu */}
                    <div className="p-8">
                        {error && (
                            <div className="login-error mb-6 rounded-lg bg-red-500/10 backdrop-blur-sm p-4 border border-red-800/50 flex items-center text-sm text-red-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-5">
                                <div className="relative group">
                                    <div className="relative">
                                        <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">
                                            Kullanıcı Adı
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <input
                                                id="username"
                                                type="text"
                                                {...register("username")}
                                                className={`login-input block w-full pl-10 pr-4 py-2.5 text-white rounded-lg ${errors.username ? "border-red-500/50" : "border-gray-700"}`}
                                                placeholder="Kullanıcı adınızı girin"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        {errors.username && (
                                            <p className="mt-1.5 text-xs text-red-400 ml-1 animate-fadeIn">
                                                {errors.username.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="relative group">
                                    <div className="relative">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">
                                            Şifre
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                            <input
                                                id="password"
                                                type="password"
                                                {...register("password")}
                                                className={`login-input block w-full pl-10 pr-4 py-2.5 text-white rounded-lg ${errors.password ? "border-red-500/50" : "border-gray-700"}`}
                                                placeholder="Şifrenizi girin"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        {errors.password && (
                                            <p className="mt-1.5 text-xs text-red-400 ml-1 animate-fadeIn">
                                                {errors.password.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="login-button relative w-full px-5 py-2.5 rounded-lg font-medium text-gray-900"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="spinner mr-2"></div>
                                        <span>Giriş yapılıyor...</span>
                                    </div>
                                ) : (
                                    <span>Giriş Yap</span>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Alt bilgi */}
                    <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
                        © {new Date().getFullYear()} Kudat Steel Jewelry. Tüm hakları saklıdır.
                    </div>
                </div>
            </div>
        </div>
    );
}

// Ana bileşen sadece Suspense ile LoginContent'i sarar
export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="text-center">
                    <div className="spinner mx-auto"></div>
                    <p className="mt-4 text-gray-400">Yükleniyor...</p>
                </div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}

// Özel stil tanımlamaları için bu CSS kodunu style.css dosyasına veya global css dosyasına ekleyin
/*
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

@keyframes shine {
  from {
    left: -100%;
  }
  to {
    left: 100%;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.animate-shine {
  animation: shine 1.2s linear infinite;
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
*/