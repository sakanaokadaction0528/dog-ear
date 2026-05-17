import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js', '@supabase/ssr'],
  },
};

export default nextConfig;
