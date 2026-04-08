/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  output: isStaticExport ? 'export' : undefined,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
