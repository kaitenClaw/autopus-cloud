import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Standard build for Docker */
  images: {
    unoptimized: true
  }
};

export default nextConfig;
