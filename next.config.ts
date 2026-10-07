import type { NextConfig } from "next";

const config: NextConfig = {
  // Parallel local dev/QC sessions must not share generated bundles or build locks.
  distDir: process.env.NACEN_NEXT_DIST_DIR || ".next",
};

export default config;
