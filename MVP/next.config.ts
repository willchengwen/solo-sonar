import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-4ba7c50944fc4853bf2ef049f7e8da7f.r2.dev',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
