"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { IProduct } from "@/models/Product";
import { ChromaGrid } from "@/components/ChromaGrid";
import InfiniteMenu from "@/components/InfiniteMenu";
import LightRays from "@/components/LightRays";
import { motion, useMotionValue, useSpring } from "motion/react";

// TiltedCard Wrapper Component
function TiltedCardWrapper({ href, children }: { href: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(0, { damping: 30, stiffness: 100, mass: 2 });
  const rotateY = useSpring(0, { damping: 30, stiffness: 100, mass: 2 });
  const scale = useSpring(1, { damping: 30, stiffness: 100, mass: 2 });

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -14;
    const rotationY = (offsetX / (rect.width / 2)) * 14;

    rotateX.set(rotationX);
    rotateY.set(rotationY);
  }

  function handleMouseEnter() {
    scale.set(1.05);
  }

  function handleMouseLeave() {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <Link href={href}>
      <motion.div
        ref={ref}
        className="relative"
        style={{ perspective: '800px' }}
        onMouseMove={handleMouse}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
            scale,
            transformStyle: 'preserve-3d',
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </Link>
  );
}

export default function Home() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [collectionImages, setCollectionImages] = useState<string[]>([]);
  const [heroImagesVisible, setHeroImagesVisible] = useState({
    img1: false,
    img2: false,
    img3: false,
    img4: false,
    img5: false,
    img6: false,
  });
  // Ürünleri getir
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          // Görseli olan ürünleri filtrele ve ilk 8-10 tanesini al
          const productsWithImages = result.data
            .filter((product: IProduct) => product.image)
            .slice(0, 10);
          setProducts(productsWithImages);
        }
      } catch (err) {
        console.error('Ürünler yüklenirken hata:', err);
      }
    };

    fetchProducts();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    const productImages = products.length > 0 && products.filter((product) => product.image).length > 0
      ? products.filter((product) => product.image).slice(0, 10)
      : Array(4).fill(null);
    
    const totalSlides = Math.ceil(productImages.length / 4);
    if (totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
    }, 5000); // 5 saniyede bir otomatik geçiş

    return () => clearInterval(interval);
  }, [products]);

  // Hero images scroll animation
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const imageId = entry.target.getAttribute('data-image-id');
          if (imageId) {
            setHeroImagesVisible((prev) => ({
              ...prev,
              [imageId]: true,
            }));
          }
        }
      });
    }, observerOptions);

    // Observe all hero images
    const imageElements = document.querySelectorAll('[data-image-id]');
    imageElements.forEach((el) => observer.observe(el));

    return () => {
      imageElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Stats animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStatsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    const statsElement = document.getElementById('stats-section');
    if (statsElement) {
      observer.observe(statsElement);
    }

    return () => {
      if (statsElement) {
        observer.unobserve(statsElement);
      }
    };
  }, []);

  // Hero görsellerini Firebase Storage'dan çek
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const response = await fetch('/api/hero-images');
        const result = await response.json();
        if (result.success && Array.isArray(result.images)) {
          // En fazla 6 görsel al
          const images = result.images.slice(0, 6);
          setHeroImages(images);
          
          // Preload için link tag'leri oluştur
          images.forEach((url: string) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = url;
            link.fetchPriority = 'high';
            document.head.appendChild(link);
          });
        } else {
          // Fallback: Eğer Firebase'den gelmezse statik görselleri kullan
          setHeroImages([
            '/products/1.jpg',
            '/products/2.jpg',
            '/products/3.jpg',
            '/products/4.jpg',
            '/products/5.jpg',
            '/products/6.jpg',
          ]);
        }
      } catch (err) {
        console.error('Hero görselleri yüklenirken hata:', err);
        // Fallback: Statik görselleri kullan
        setHeroImages([
          '/products/1.jpg',
          '/products/2.jpg',
          '/products/3.jpg',
          '/products/4.jpg',
          '/products/5.jpg',
          '/products/6.jpg',
        ]);
      }
    };

    fetchHeroImages();
  }, []);

  // Collection görsellerini Firebase Storage'dan çek
  useEffect(() => {
    const fetchCollectionImages = async () => {
      try {
        const response = await fetch('/api/collection-images');
        const result = await response.json();
        if (result.success && Array.isArray(result.images)) {
          setCollectionImages(result.images);
        }
      } catch (err) {
        console.error('Collection görselleri yüklenirken hata:', err);
      }
    };

    fetchCollectionImages();
  }, []);

  return (
    <>
      {/* Override body background for this page */}
      <style dangerouslySetInnerHTML={{
        __html: `
          body {
            background-color: #ffffff !important;
          }
          html {
            background-color: #ffffff !important;
          }
        `
      }} />
      <main 
        className="min-h-screen flex flex-col relative" 
        style={{ 
          backgroundColor: '#ffffff',
          minHeight: '100vh',
          position: 'relative',
        }}
      >
      {/* Animated SVG Background Pattern */}
      <div 
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{ 
          backgroundColor: '#ffffff',
          zIndex: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom right, #fafafa 0%, #ffffff 50%, #fafafa 100%)',
          zIndex: 1,
        }} />
        
        {/* Minimal Jewelry-Inspired SVG Pattern */}
        <svg 
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="none"
          style={{ 
            opacity: 0.4,
            zIndex: 2,
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="dotPattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="1.5" fill="#d4d4d4" opacity="0.5" />
            </pattern>
            <pattern id="linePattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="200" y2="200" stroke="#d4d4d4" strokeWidth="0.8" opacity="0.4" />
              <line x1="200" y1="0" x2="0" y2="200" stroke="#d4d4d4" strokeWidth="0.8" opacity="0.4" />
            </pattern>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#dotPattern)" />
          <rect width="100%" height="100%" fill="url(#linePattern)" />
          
          {/* Minimal geometric accents - diamond shapes */}
          <g opacity="0.3">
            <path d="M 300,200 L 350,250 L 300,300 L 250,250 Z" fill="none" stroke="#c4c4c4" strokeWidth="1.2">
              <animate attributeName="opacity" values="0.3;0.5;0.3" dur="20s" repeatCount="indefinite" />
            </path>
            <path d="M 1600,800 L 1700,900 L 1600,1000 L 1500,900 Z" fill="none" stroke="#c4c4c4" strokeWidth="1.2">
              <animate attributeName="opacity" values="0.3;0.5;0.3" dur="18s" begin="3s" repeatCount="indefinite" />
            </path>
            <path d="M 100,800 L 200,850 L 150,950 L 50,900 Z" fill="none" stroke="#c4c4c4" strokeWidth="1">
              <animate attributeName="opacity" values="0.25;0.45;0.25" dur="15s" begin="5s" repeatCount="indefinite" />
            </path>
          </g>
          
          {/* Subtle light reflection lines */}
          <g opacity="0.25">
            <line x1="150" y1="150" x2="450" y2="450" stroke="#d4d4d4" strokeWidth="1">
              <animate attributeName="opacity" values="0.25;0.4;0.25" dur="25s" repeatCount="indefinite" />
            </line>
            <line x1="1770" y1="930" x2="1470" y2="630" stroke="#d4d4d4" strokeWidth="1">
              <animate attributeName="opacity" values="0.25;0.4;0.25" dur="22s" begin="2s" repeatCount="indefinite" />
            </line>
          </g>
        </svg>
        
        {/* Subtle light rays effect */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{
          background: 'radial-gradient(circle, rgba(250, 250, 250, 0.4) 0%, transparent 70%)',
          zIndex: 3,
        }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl" style={{
          background: 'radial-gradient(circle, rgba(250, 250, 250, 0.4) 0%, transparent 70%)',
          zIndex: 3,
        }} />
        
        {/* Diagonal dark gradient overlay - 45 degrees - Köşegenlerde koyu dolgu */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(45deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.15) 15%, rgba(0,0,0,0.05) 30%, transparent 50%, rgba(0,0,0,0.05) 70%, rgba(0,0,0,0.15) 85%, rgba(0,0,0,0.25) 100%)',
          zIndex: 4,
          pointerEvents: 'none',
        }} />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(-45deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.15) 15%, rgba(0,0,0,0.05) 30%, transparent 50%, rgba(0,0,0,0.05) 70%, rgba(0,0,0,0.15) 85%, rgba(0,0,0,0.25) 100%)',
          zIndex: 4,
          pointerEvents: 'none',
        }} />
      </div>
      {/* iOS-style Header */}
      <header className="fixed w-full z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center md:justify-between h-24 px-6">
            <Link href="/" className="flex items-center">
              <Image 
                src="/icon.png" 
                alt="Kudat Group" 
                width={500} 
                height={166}
                className="h-40 md:h-44 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop Menu */}
            <nav className="flex items-center absolute right-6">
              <Link 
                href="/bulten-kayit" 
                className="px-6 py-2.5 bg-gray-900 text-white text-sm font-light rounded-full hover:bg-gray-800 transition-colors"
              >
                Bülten
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Bleed */}
      <section className="flex items-center justify-center min-h-screen relative z-10 overflow-hidden w-full" style={{ minHeight: '100vh' }}>
        {/* LightRays Effect */}
        <div className="absolute inset-0 w-full h-full z-1 pointer-events-none" style={{ zIndex: 1 }}>
          <LightRays
            raysOrigin="top-center"
            raysColor="#ffffff"
            raysSpeed={0.8}
            lightSpread={1.2}
            rayLength={2.5}
            pulsating={true}
            fadeDistance={1.2}
            saturation={0.6}
            followMouse={true}
            mouseInfluence={0.15}
            noiseAmount={0.0}
            distortion={0.1}
          />
        </div>
        
        {/* Background Images - Hero Only */}
        <div 
          className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none"
          style={{ 
            backgroundColor: '#fafafa',
            background: 'linear-gradient(to bottom right, #fafafa 0%, #ffffff 50%, #fafafa 100%)'
          }}
        >
          {/* Top Row - 3 images */}
          <div className="absolute top-0 left-0 w-full h-[50vh] flex">
            {heroImages.slice(0, 3).map((imageUrl, index) => (
              <div key={index} className="w-1/3 h-full" style={{ opacity: 0.3 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={`Hero Background ${index + 1}`}
                  className="w-full h-full object-cover"
                  style={{ width: '100%', height: '100%', borderRadius: '0' }}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  onError={(e) => {
                    // Fallback to static image
                    const target = e.target as HTMLImageElement;
                    target.src = `/products/${index + 1}.jpg`;
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* Bottom Row - 3 images */}
          <div className="absolute bottom-0 left-0 w-full h-[50vh] flex">
            {heroImages.slice(3, 6).map((imageUrl, index) => (
              <div key={index + 3} className="w-1/3 h-full" style={{ opacity: 0.3 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={`Hero Background ${index + 4}`}
                  className="w-full h-full object-cover"
                  style={{ width: '100%', height: '100%', borderRadius: '0' }}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  onError={(e) => {
                    // Fallback to static image
                    const target = e.target as HTMLImageElement;
                    target.src = `/products/${index + 4}.jpg`;
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        {/* Full width container - no max-width constraint */}
        <div className="w-full relative">
          {/* Center Column - Hero Content */}
          <div className="text-center w-full relative z-10 px-6 lg:px-8 max-w-6xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-light tracking-wider mb-8 leading-[1.1] drop-shadow-lg" style={{ fontFamily: 'var(--font-cinzel), serif', letterSpacing: '0.15em' }}>
              <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent drop-shadow-md">Zamansız</span>
              <span className="block bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent mt-2 drop-shadow-md" style={{ letterSpacing: '0.2em' }}>İhtişam</span>
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-semibold drop-shadow-lg">
              <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent">
                Çelik takı koleksiyonumuzla tarzınızı yansıtın. Dayanıklılık ve estetiğin buluştuğu özel tasarımlar.
              </span>
            </p>

          {/* Statistics / Features */}
          <div 
            id="stats-section"
            className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mb-16"
          >
            <div className="text-center">
              <div 
                className="text-3xl md:text-4xl font-light text-gray-900 mb-2 transition-all duration-1000 drop-shadow-md"
                style={{
                  opacity: statsVisible ? 1 : 0,
                  transform: statsVisible ? 'translateY(0)' : 'translateY(20px)',
                }}
              >
                100+
              </div>
              <div className="text-sm text-gray-700 font-light">Ürün Çeşidi</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-gray-300" />
            <div className="text-center">
              <div 
                className="text-3xl md:text-4xl font-light text-gray-900 mb-2 transition-all duration-1000 delay-200 drop-shadow-md"
                style={{
                  opacity: statsVisible ? 1 : 0,
                  transform: statsVisible ? 'translateY(0)' : 'translateY(20px)',
                }}
              >
                1000+
              </div>
              <div className="text-sm text-gray-700 font-light">Mutlu Müşteri</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-gray-300" />
            <div className="text-center">
              <div 
                className="text-3xl md:text-4xl font-light text-gray-900 mb-2 transition-all duration-1000 delay-400 drop-shadow-md"
                style={{
                  opacity: statsVisible ? 1 : 0,
                  transform: statsVisible ? 'translateY(0)' : 'translateY(20px)',
                }}
              >
                10+
              </div>
              <div className="text-sm text-gray-700 font-light">Yıl Deneyim</div>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            <div className="flex items-center gap-2 text-gray-800 text-sm font-medium bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Ücretsiz Kargo</span>
            </div>
            <div className="flex items-center gap-2 text-gray-800 text-sm font-medium bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Güvenli Ödeme</span>
            </div>
            <div className="flex items-center gap-2 text-gray-800 text-sm font-medium bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Kalite Garantisi</span>
            </div>
            <div className="flex items-center gap-2 text-gray-800 text-sm font-medium bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Özel Tasarım</span>
            </div>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Wholesale Card */}
            <TiltedCardWrapper href="/toptan-satis">
              <div className="group relative overflow-hidden bg-white/90 backdrop-blur-md hover:bg-white rounded-[2rem] p-6 text-left transition-all duration-500 shadow-xl hover:shadow-2xl border border-white/50">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50 to-transparent rounded-full -mr-20 -mt-20 opacity-50" />
                
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-900 to-gray-700 rounded-[1.2rem] flex items-center justify-center mb-6 shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Toptan Satış</h3>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed font-light">
                    İşletmeniz için özel fiyatlar ve toplu alım avantajları
                  </p>
                  
                  <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                    <span>Detayları Gör</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </TiltedCardWrapper>

            {/* Retail Card */}
            <TiltedCardWrapper href="/perakende-satis">
              <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-md hover:from-gray-900 hover:to-gray-800 rounded-[2rem] p-6 text-left transition-all duration-500 shadow-xl hover:shadow-2xl border border-gray-800/50">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-20 -mt-20" />
                
                <div className="relative">
                  <div className="w-14 h-14 bg-white rounded-[1.2rem] flex items-center justify-center mb-6 shadow-lg">
                    <svg className="w-7 h-7 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Perakende Satış</h3>
                  <p className="text-sm text-gray-300 mb-6 leading-relaxed font-light">
                    Özenle tasarlanmış koleksiyonumuzu keşfedin
                  </p>
                  
                  <div className="inline-flex items-center text-sm font-semibold text-white">
                    <span>Ürünleri İncele</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </TiltedCardWrapper>
          </div>
          </div>
        </div>
      </section>

      {/* Products Collection - Infinite Menu */}
      <section className="py-32 relative z-10 overflow-hidden w-full" style={{ backgroundColor: '#ffffff' }}>
        <div className="w-full" style={{ backgroundColor: '#ffffff' }}>
          {/* Section Header */}
          <div className="text-center mb-20 px-6">
            <h2 className="text-5xl md:text-7xl font-light text-gray-900 tracking-tight mb-6">
              Koleksiyonumuz
            </h2>
            <p className="text-lg md:text-xl text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">
              Zarif çelik takı tasarımlarımızı keşfedin
            </p>
          </div>

          <div className="w-full h-[80vh] min-h-[600px] max-h-[900px] px-6" style={{ backgroundColor: '#ffffff' }}>
            {(() => {
              // InfiniteMenu için items formatına dönüştür
              const productNames = [
                'Aurora', 'Luna', 'Nova', 'Stella', 'Vega', 'Lyra', 'Orion', 'Atlas', 'Phoenix', 'Aria',
                'Echo', 'Zenith', 'Celeste', 'Sage', 'Iris', 'Jade', 'Ruby', 'Pearl', 'Diamond', 'Opal'
              ];

              const productDescriptions = [
                'Özel tasarım çelik bileklik koleksiyonu',
                'Zarif çelik kolye modelleri',
                'Dayanıklı çelik yüzük koleksiyonu',
                'Şık çelik küpe tasarımları',
                'Elegant çelik takı setleri',
                'Premium çelik aksesuar koleksiyonu',
                'Modern çelik bileklik serisi',
                'Klasik çelik kolye modelleri',
                'Özel tasarım çelik yüzükler',
                'Zarif çelik küpe koleksiyonu',
                'Lüks çelik takı setleri',
                'Premium çelik bileklik modelleri',
                'Şık çelik kolye tasarımları',
                'Dayanıklı çelik yüzük serisi',
                'Elegant çelik küpe modelleri',
                'Modern çelik takı koleksiyonu',
                'Klasik çelik aksesuar serisi',
                'Özel tasarım çelik bileklikler',
                'Zarif çelik kolye koleksiyonu',
                'Premium çelik yüzük modelleri',
              ];

              // Rastgele sıralama için shuffle fonksiyonu
              const shuffleArray = <T,>(array: T[]): T[] => {
                const shuffled = [...array];
                for (let i = shuffled.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                return shuffled;
              };

              const shuffledNames = shuffleArray(productNames);

              // Önce collection görsellerini kullan, yoksa ürün görsellerini kullan
              const infiniteMenuItems: Array<{
                image: string;
                link: string;
                title: string;
                description: string;
              }> = collectionImages.length > 0
                ? collectionImages.map((img: any, index: number) => {
                    // Eğer metadata varsa kullan, yoksa fallback
                    const title = img.title || shuffledNames[index % shuffledNames.length];
                    const code = img.code || `KT-${String(index + 1).padStart(3, '0')}`;
                    const description = img.description || productDescriptions[index % productDescriptions.length];
                    
                    return {
                      image: img.url || img,
                      link: `/products/${index + 1}`,
                      title: `${title} ${code}`,
                      description: description,
                    };
                  })
                : products.length > 0 && products.filter((product) => product.image).length > 0
                  ? products
                      .filter((product) => product.image)
                      .slice(0, 20)
                      .map((product, index) => {
                        const productCode = `KT-${String(index + 1).padStart(3, '0')}`;
                        return {
                          image: product.image!,
                          link: `/products/${product._id || ''}`,
                          title: `${shuffledNames[index % shuffledNames.length]} ${productCode}`,
                          description: product.description || productDescriptions[index % productDescriptions.length],
                        };
                      })
                  : [
                      // Statik görseller (fallback)
                      { id: '1', img: '/products/1.jpg', url: '/products/1' },
                      { id: '2', img: '/products/2.jpg', url: '/products/2' },
                      { id: '3', img: '/products/3.jpg', url: '/products/3' },
                      { id: '4', img: '/products/4.jpg', url: '/products/4' },
                      { id: '5', img: '/products/5.jpg', url: '/products/5' },
                      { id: '6', img: '/products/6.jpg', url: '/products/6' },
                      { id: '7', img: '/products/WhatsApp Image 2025-11-05 at 14.17.07.jpeg', url: '/products/7' },
                      { id: '8', img: '/products/WhatsApp Image 2025-11-05 at 14.17.08 (1).jpeg', url: '/products/8' },
                      { id: '9', img: '/products/WhatsApp Image 2025-11-05 at 14.17.08 (2).jpeg', url: '/products/9' },
                      { id: '10', img: '/products/WhatsApp Image 2025-11-05 at 14.17.08 (3).jpeg', url: '/products/10' },
                    ].map((item, index) => {
                      const productCode = `KT-${String(index + 1).padStart(3, '0')}`;
                      return {
                        image: item.img,
                        link: item.url,
                        title: `${shuffledNames[index % shuffledNames.length]} ${productCode}`,
                        description: productDescriptions[index % productDescriptions.length],
                      };
                    });

              return <InfiniteMenu items={infiniteMenuItems as any} />;
            })()}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
            {/* Brand Section */}
            <div className="md:col-span-5">
              <h3 className="text-gray-900 text-2xl font-light mb-6 tracking-tight">Kudat Steel Jewelry</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
                Zarif çelik takı koleksiyonumuzla tarzınızı yansıtın.
              </p>
              <div className="flex flex-col gap-4">
                <a 
                  href="mailto:kurumsal@kudatgroup.com" 
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-light"
                >
                  kurumsal@kudatgroup.com
                </a>
                <a 
                  href="tel:+905443576214" 
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-light"
                >
                  +90 (544) 357 62 14
                </a>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="md:col-span-3">
              <nav className="flex flex-col gap-4">
                <Link href="/products" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-light">
                  Ürünler
                </Link>
                <Link href="/perakende-satis" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-light">
                  Perakende Satış
                </Link>
                <Link href="/toptan-satis" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-light">
                  Toptan Satış
                </Link>
                <Link href="/bulten-kayit" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-light">
                  Bülten Kaydı
                </Link>
              </nav>
            </div>

            {/* Legal Links */}
            <div className="md:col-span-4">
              <nav className="flex flex-col gap-4">
                <Link href="/privacy-policy" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-light">
                  Gizlilik Politikası
                </Link>
                <Link href="/terms-of-service" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-light">
                  Kullanım Koşulları
                </Link>
                <Link href="/data-deletion" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-light">
                  Veri Silme Talebi
                </Link>
              </nav>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8">
            <p className="text-gray-400 text-xs font-light">
              © {new Date().getFullYear()} Kudat Group
            </p>
          </div>
        </div>
      </footer>
      </main>
    </>
  );
}
