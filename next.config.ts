import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.imweb.me",
      },
      {
        protocol: "https",
        hostname: "cdn-optimized.imweb.me",
      },
      {
        protocol: "https",
        hostname: "scontent-nrt1-1.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev",
      },
    ],
  },
};

export default nextConfig;
