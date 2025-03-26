import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pzxtnudhckzoieyymlhb.supabase.co',
        pathname: '/storage/v1/object/public/menu-images/**',
      },
    ],
    domains: ['pzxtnudhckzoieyymlhb.supabase.co'],
  },
};

export default nextConfig;