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
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900">
          <div className="w-full max-w-md space-y-8 rounded-xl bg-black bg-opacity-50 p-6 backdrop-blur-lg border border-gray-800">
              <div className="text-center">
                  <h1 className="text-3xl font-serif font-bold text-white">Kudat Steel Jewelry</h1>
                  <p className="mt-2 text-sm text-gray-400">Yönetim Paneli Girişi</p>
              </div>

              {error && (
                  <div className="rounded-md bg-red-500 bg-opacity-10 p-4 text-center text-sm text-red-400 border border-red-800">
                      {error}
                  </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                  <div className="-space-y-px rounded-md">
                      <div>
                          <label htmlFor="username" className="sr-only">
                              Kullanıcı Adı
                          </label>
                          <input
                              id="username"
                              type="text"
                              {...register("username")}
                              className={`relative block w-full rounded-t-md border-0 py-3 px-4 text-white bg-gray-900 focus:ring-0 ${errors.username ? "border-b-2 border-rose-500" : "border-b border-gray-700"
                                  }`}
                              placeholder="Kullanıcı Adı"
                              disabled={isLoading}
                          />
                          {errors.username && (
                              <p className="mt-1 text-xs text-rose-500">{errors.username.message}</p>
                          )}
                      </div>
                      <div>
                          <label htmlFor="password" className="sr-only">
                              Şifre
                          </label>
                          <input
                              id="password"
                              type="password"
                              {...register("password")}
                              className={`relative block w-full rounded-b-md border-0 py-3 px-4 text-white bg-gray-900 focus:ring-0 ${errors.password ? "border-b-2 border-rose-500" : "border-b border-gray-700"
                                  }`}
                              placeholder="Şifre"
                              disabled={isLoading}
                          />
                          {errors.password && (
                              <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>
                          )}
                      </div>
                  </div>

                  <div>
                      <button
                          type="submit"
                          disabled={isLoading}
                          className="group relative flex w-full justify-center rounded-md bg-gradient-to-r from-gray-300 to-gray-400 py-3 px-4 text-sm font-medium text-gray-900 hover:from-gray-400 hover:to-gray-500 focus:outline-none"
                      >
                          {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                      </button>
                  </div>
              </form>
            </div>
        </div>
    );
}

// Ana bileşen sadece Suspense ile LoginContent'i sarar
export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">Yükleniyor...</div>}>
            <LoginContent />
        </Suspense>
    );
}