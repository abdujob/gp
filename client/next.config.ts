import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
  },
  images: {
    domains: ['gp-uploads-2026.s3.us-east-1.amazonaws.com', 'gp-uploads-2026.s3.amazonaws.com'],
  },
};

export default nextConfig;
