/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'miradordevillarrica.cl' },
    ],
  },
};

export default nextConfig;
