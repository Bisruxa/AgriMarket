import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Use client folder as Turbopack root (avoids wrong lockfile at repo root).
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static0.srcdn.com",
      },
    ],
  },
};

export default nextConfig;
