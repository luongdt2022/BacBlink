import type { NextConfig } from "next";

const config: NextConfig = {
  // Parallel local dev/QC sessions must not share generated bundles or build locks.
  distDir: process.env.NACEN_NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:5080/api/v1/:path*",
      },
      {
        source: "/api/v2/:path*",
        destination: "http://localhost:5080/api/v2/:path*",
      },
      {
        source: "/health",
        destination: "http://localhost:5080/health",
      },
      // NacenTech Agent Orchestrator & CR Dashboard (Port 8420)
      {
        source: "/orchestrator-app",
        destination: "http://127.0.0.1:8420/",
      },
      {
        source: "/orchestrator-app/:path*",
        destination: "http://127.0.0.1:8420/:path*",
      },
      {
        source: "/api/dag",
        destination: "http://127.0.0.1:8420/api/dag",
      },
      {
        source: "/api/autopilot",
        destination: "http://127.0.0.1:8420/api/autopilot",
      },
      {
        source: "/api/backlog",
        destination: "http://127.0.0.1:8420/api/backlog",
      },
      {
        source: "/api/backlog/:path*",
        destination: "http://127.0.0.1:8420/api/backlog/:path*",
      },
      {
        source: "/api/action/:path*",
        destination: "http://127.0.0.1:8420/api/action/:path*",
      },
      {
        source: "/api/config/:path*",
        destination: "http://127.0.0.1:8420/api/config/:path*",
      },
      {
        source: "/api/task/:path*",
        destination: "http://127.0.0.1:8420/api/task/:path*",
      },
      {
        source: "/wireframes/:path*",
        destination: "http://127.0.0.1:8420/wireframes/:path*",
      },
      {
        source: "/api/stream",
        destination: "http://127.0.0.1:8420/api/stream",
      },
    ];
  },
};

export default config;
