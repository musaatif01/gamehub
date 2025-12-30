import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Handle the GitHub Pages subpath (/gamehub)
  basePath: '/gamehub',
  assetPrefix: '/gamehub',
};

export default nextConfig;
