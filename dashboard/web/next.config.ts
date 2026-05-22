import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // pdf-parse uses Node.js built-ins not handled by webpack — exclude from bundling
  serverExternalPackages: ['pdf-parse'],
};

export default nextConfig;
