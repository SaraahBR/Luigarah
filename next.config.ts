import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // CDN Farfetch
      {
        protocol: "https",
        hostname: "cdn-images.farfetch-contents.com",
        port: "",
        pathname: "/**", 
      },
      // Cloudflare R2
      {
        protocol: "https",
        hostname: "pub-0307a72d067843b4bb500a3fd7669eca.r2.dev",
        port: "",
        pathname: "/**",
      },
      // Google User Content
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      // Giphy
      {
        protocol: "https",
        hostname: "media3.giphy.com",
        port: "",
        pathname: "/**",
      },
      // Elle Brasil
      {
        protocol: "https",
        hostname: "images.elle.com.br",
        port: "",
        pathname: "/**",
      },
      // SHEIN
      {
        protocol: "https",
        hostname: "img.ltwebstatic.com",
        port: "",
        pathname: "/**",
      },
      // Nuvemshop/Tiendanube
      {
        protocol: "https",
        hostname: "acdn-us.mitiendanube.com",
        port: "",
        pathname: "/**",
      },
      // Shopify CDN
      {
        protocol: "https",
        hostname: "www.pegueibode.com.br",
        port: "",
        pathname: "/cdn/**",
      },
      // Shopee Brasil
      {
        protocol: "https",
        hostname: "down-br.img.susercontent.com",
        port: "",
        pathname: "/**",
      },
      // Mercado Livre
      {
        protocol: "https",
        hostname: "http2.mlstatic.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
