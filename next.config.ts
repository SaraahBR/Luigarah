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
      {
        protocol: "https",
        hostname: "pub-0307a72d067843b4bb500a3fd7669eca.r2.dev",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media3.giphy.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
