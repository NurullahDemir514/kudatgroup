"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
    const router = useRouter();

    useEffect(() => {
        // Sayfayı 404'e yönlendir
        router.replace('/404');
    }, [router]);

    return null;
}
