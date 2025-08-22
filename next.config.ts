import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn-images.farfetch-contents.com",
        port: "",
        pathname: "/**", 
      },
    ],
  },
};

export default nextConfig;
