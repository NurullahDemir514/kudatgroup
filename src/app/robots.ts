import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://kudatgroup.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/firebase-setup/',
          '/_next/',
          '/private/',
          '/products', // Products list sayfasını engelle
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

