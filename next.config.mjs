/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Vercel için output: 'standalone' gerekli değil (otomatik optimize eder)
  // DigitalOcean için gerekirse manuel olarak eklenebilir
}

export default nextConfig 