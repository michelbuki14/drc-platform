/** @type {import('next').NextConfig} */
import { resolve } from 'path';

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: resolve(import.meta.dirname),
  // Disable optimizeCss to avoid critters dependency issues
  experimental: {
    optimizeCss: false,
  },
};

export default nextConfig;