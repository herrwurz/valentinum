import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["172.17.48.1"],
  output: "standalone",
};

export default nextConfig;
