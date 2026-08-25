import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the default webpack bundler for Windows reliability
  // (Turbopack + next/font had module resolution failures locally).
};

export default nextConfig;
