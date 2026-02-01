import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "ilovehaccp.com",
          },
        ],
        destination: "https://www.ilovehaccp.com/:path*",
        permanent: true,
      },
      // SEO: Redirect alias URLs to canonical sample page
      {
        source: "/haccp-plan-example-pdf",
        destination: "/sample-haccp-plan-pdf",
        permanent: true,
      },
      {
        source: "/haccp-plan-example",
        destination: "/sample-haccp-plan-pdf",
        permanent: true,
      },
      {
        source: "/haccp-example-pdf",
        destination: "/sample-haccp-plan-pdf",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
