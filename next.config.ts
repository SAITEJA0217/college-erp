import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React strict mode and SWC minification (default in Next 13)
  reactStrictMode: true,

  // Output as standalone for easier Vercel/Docker deployments
  output: "standalone",
  // Environment variables to expose at build time (placeholders – will be filled in Vercel)
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },

  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
