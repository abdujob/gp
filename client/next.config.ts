import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gp-uploads-2026.s3.us-east-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'gp-uploads-2026.s3.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
