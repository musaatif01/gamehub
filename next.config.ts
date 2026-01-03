import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/gamehub',
  assetPrefix: '/gamehub',
};

export default nextConfig;
