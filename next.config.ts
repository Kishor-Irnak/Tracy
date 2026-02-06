import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Tracy",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
