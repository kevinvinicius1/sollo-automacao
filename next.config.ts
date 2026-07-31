import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    // export estático não tem servidor de otimização; imagens são
    // redimensionadas pelo scraper antes do build
    unoptimized: true,
  },
};

export default nextConfig;
