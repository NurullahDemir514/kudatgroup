"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";

const loginSchema = z.object({
    username: z.string().min(1, "Kullanıcı adı zorunludur"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
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
            console.log("Giriş denemesi:", data.username, "Şifre uzunluğu:", data.password.length);

            const result = await signIn("credentials", {
                redirect: false,
                username: data.username,
                password: data.password,
                callbackUrl: "/admin"
            });

            console.log("Giriş sonucu:", result);

            if (result?.error) {
                console.error("Giriş hatası:", result.error);
                switch (result.error) {
                    case "CredentialsSignin":
                        setError("Kullanıcı adı veya şifre hatalı.");
                        break;
                    case "MissingCredentials":
                        setError("Kullanıcı adı ve şifre alanları boş bırakılamaz.");
                        break;
                    case "UserNotFound":
                        setError("Bu kullanıcı adıyla kayıtlı kullanıcı bulunamadı.");
                        break;
                    case "InvalidPassword":
                        setError("Girdiğiniz şifre hatalı.");
                        break;
                    case "AccountDisabled":
                        setError("Hesabınız devre dışı bırakılmıştır. Lütfen yöneticiyle iletişime geçin.");
                        break;
                    default:
                        setError(result.error || "Giriş yaparken bir hata oluştu.");
                        break;
                }
            } else if (result?.ok) {
                console.log("Giriş başarılı, yönlendiriliyor...");
                router.push("/admin");
            }
        } catch (err) {
            console.error("Giriş hatası:", err);
            setError("Giriş yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    };

    // URL'den hata parametrelerini kontrol et
    useEffect(() => {
        const errorParam = searchParams.get("error");
        if (errorParam) {
            switch (errorParam) {
                case "CredentialsSignin":
                    setError("Kullanıcı adı veya şifre hatalı.");
                    break;
                case "SessionRequired":
                    setError("Bu sayfaya erişmek için giriş yapmalısınız.");
                    break;
                case "AccessDenied":
                    setError("Bu sayfaya erişim izniniz yok.");
                    break;
                case "MissingCredentials":
                    setError("Kullanıcı adı ve şifre alanları boş bırakılamaz.");
                    break;
                case "UserNotFound":
                    setError("Bu kullanıcı adıyla kayıtlı kullanıcı bulunamadı.");
                    break;
                case "InvalidPassword":
                    setError("Girdiğiniz şifre hatalı.");
                    break;
                case "AccountDisabled":
                    setError("Hesabınız devre dışı bırakılmıştır. Lütfen yöneticiyle iletişime geçin.");
                    break;
                default:
                    setError("Giriş yaparken bir hata oluştu.");
                    break;
            }
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Sol taraf - Marka */}
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 bg-black bg-opacity-30">
                <div className="max-w-md mx-auto text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="relative w-48 h-48 mb-4">
                            {/* Logo placeholder - Gerçek logo ile değiştirilebilir */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-400">
                                    KUDAT
                                </div>
                            </div>
                            <div className="absolute inset-0 border-2 border-yellow-300 rounded-full opacity-20"></div>
                            <div className="absolute inset-2 border border-yellow-300 rounded-full opacity-40"></div>
                            <div className="absolute inset-4 border border-yellow-300 rounded-full opacity-60"></div>
                        </div>
                    </div>

                    <h1 className="text-3xl font-serif font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-400">
                        Kudat Steel Jewelry
                    </h1>
                    <p className="text-gray-400 mb-8">Zarafet ve kalite ile buluştuğu yer</p>

                    <div className="space-y-4">
                        <div className="flex items-center text-sm text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Güvenli Yönetim Paneli
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Yalnızca yetkili personel erişebilir
                        </div>
                    </div>
                </div>
            </div>

            {/* Sağ taraf - Giriş formu */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12">
                <div className="w-full max-w-md bg-gray-900 rounded-lg shadow-xl overflow-hidden">
                    <div className="p-8">
                        <h2 className="text-2xl font-semibold text-yellow-300 mb-2">Yönetici Girişi</h2>
                        <p className="text-gray-400 text-sm mb-6">Hesabınıza giriş yaparak yönetim paneline erişin</p>

                        {error && (
                            <div className="mb-6 rounded-md bg-red-900/30 border border-red-800 p-4 text-sm text-red-300">
                                <div className="flex">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {error}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                                    Kullanıcı Adı
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="username"
                                        type="text"
                                        {...register("username")}
                                        className="pl-10 py-3 w-full bg-gray-800 border border-gray-700 focus:border-yellow-300 rounded-md text-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-300"
                                        placeholder="admin"
                                    />
                                </div>
                                {errors.username && (
                                    <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                                    Şifre
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        {...register("password")}
                                        className="pl-10 py-3 w-full bg-gray-800 border border-gray-700 focus:border-yellow-300 rounded-md text-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-300"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-yellow-300 focus:ring-yellow-300"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                                        Beni hatırla
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="text-yellow-300 hover:text-yellow-200">
                                        Şifremi unuttum
                                    </a>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200 hover:from-yellow-300 hover:to-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 focus:ring-offset-gray-900 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Giriş yapılıyor...
                                        </div>
                                    ) : (
                                        "Giriş Yap"
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">
                                © {new Date().getFullYear()} Kudat Steel Jewelry. Tüm hakları saklıdır.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 