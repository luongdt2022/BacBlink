import type { NextConfig } from "next";

const config: NextConfig = {
  // Parallel local dev/QC sessions must not share generated bundles or build locks.
  distDir: process.env.NACEN_NEXT_DIST_DIR || ".next",
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:5080/api/v1/:path*",
      },
    ];
  },
};

export default config;

