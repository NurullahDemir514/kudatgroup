"use client";

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

type ToastTone = "success" | "error" | "info";

type ToastPayload = {
    message: string;
    tone?: ToastTone;
};

type ToastState = Required<ToastPayload> & {
    id: number;
};

type ToastContextValue = {
    showToast: (payload: ToastPayload | string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, string> = {
    success: "bg-black text-white border-white/10",
    error: "bg-red-600 text-white border-red-400/30",
    info: "bg-[#2f2a24] text-white border-white/10",
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<ToastState | null>(null);

    const showToast = useCallback((payload: ToastPayload | string) => {
        const nextPayload =
            typeof payload === "string" ? { message: payload, tone: "success" as const } : payload;

        setToast({
            id: Date.now(),
            message: nextPayload.message,
            tone: nextPayload.tone ?? "success",
        });
    }, []);

    useEffect(() => {
        if (!toast) return;

        const timeoutId = window.setTimeout(() => setToast(null), 2600);
        return () => window.clearTimeout(timeoutId);
    }, [toast]);

    const value = useMemo(() => ({ showToast }), [showToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            {toast ? (
                <div className="pointer-events-none fixed bottom-5 right-5 z-[80] max-w-[calc(100vw-40px)]">
                    <div
                        key={toast.id}
                        role="status"
                        aria-live="polite"
                        className={`rounded-2xl border px-4 py-3 text-sm font-semibold shadow-[0_18px_55px_rgba(0,0,0,0.22)] ${toneStyles[toast.tone]}`}
                    >
                        {toast.message}
                    </div>
                </div>
            ) : null}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast, ToastProvider içinde kullanılmalıdır.");
    }

    return context;
}
