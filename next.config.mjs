/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'miradordevillarrica.cl' },
    ],
  },
  async redirects() {
    return [
      { source: '/anotaciones', destination: '/panel/anotaciones', permanent: false },
      { source: '/anotaciones/login', destination: '/panel/login', permanent: false },
    ];
  },
};

export default nextConfig;
