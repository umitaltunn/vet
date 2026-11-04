import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  devIndicators: false,
  // patidostu.localhost:3000 gibi alt alan adlarindan gelistirme sunucusuna erisim
  allowedDevOrigins: ["*.localhost", "localhost", "127.0.0.1"],
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
