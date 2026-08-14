import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "https://swasthyatap.in",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
