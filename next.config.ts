import type { NextConfig } from "next";

const config: NextConfig = {
  distDir: ".next",
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
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
  async redirects() {
    return [
      {
        source: "/trien-lam",
        destination: "/tin-tuc",
        permanent: false,
      },
      {
        source: "/assessments/buyer",
        destination: "/nhu-cau-cong-nghe",
        permanent: false,
      },
      {
        source: "/assessments/tt17",
        destination: "/portal",
        permanent: false,
      },
      {
        source: "/assessments/tt17/:path*",
        destination: "/portal",
        permanent: false,
      },
      {
        source: "/assessments",
        destination: "/dich-vu-khac",
        permanent: false,
      },
      {
        source: "/assessments/:path*",
        destination: "/dich-vu-khac",
        permanent: false,
      },
      {
        source: "/dieu-tra-trinh-do-nang-luc",
        destination: "/doanh-nghiep-dmst",
        permanent: false,
      },
      {
        source: "/khao-sat-nhu-cau",
        destination: "/nhu-cau-cong-nghe",
        permanent: false,
      },
      {
        source: "/khao-sat-doanh-nghiep",
        destination: "/nhu-cau-cong-nghe",
        permanent: false,
      },
      {
        source: "/khao-sat-cong-nghe",
        destination: "/chao-ban-cong-nghe",
        permanent: false,
      },
      {
        source: "/khao-sat-dmst",
        destination: "/doanh-nghiep-dmst",
        permanent: false,
      },
      {
        source: "/admin/assessments",
        destination: "/admin",
        permanent: false,
      },
      {
        source: "/admin/assessments/:path*",
        destination: "/admin",
        permanent: false,
      },
      {
        source: "/admin/org-tree",
        destination: "/admin",
        permanent: false,
      },
      {
        source: "/gov",
        destination: "/",
        permanent: false,
      },
      {
        source: "/gov/:path*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/governance",
        destination: "/",
        permanent: false,
      },
      {
        source: "/governance/:path*",
        destination: "/",
        permanent: false,
      },
    ];
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
        source: "/files/:path*",
        destination: "http://localhost:5080/files/:path*",
      },
      {
        source: "/health",
        destination: "http://localhost:5080/health",
      },
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
        source: "/static/uploads/:path*",
        destination: "http://127.0.0.1:8420/static/uploads/:path*",
      },
      {
        source: "/api/stream",
        destination: "http://127.0.0.1:8420/api/stream",
      },
    ];
  },
};

export default config;
