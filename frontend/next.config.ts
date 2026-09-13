import type { NextConfig } from "next";

const backendApiUrl = process.env.BACKEND_API_URL;

const nextConfig: NextConfig = {
  ...(process.env.VERCEL ? {} : { output: "standalone" }),

  async rewrites() {
    if (!backendApiUrl) {
      return [];
    }

    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendApiUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
