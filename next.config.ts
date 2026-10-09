import path from "node:path";
import type { NextConfig } from "next";

type HostCondition = { type: "host"; value: string };
type RedirectRule = {
  source: string;
  destination: string;
  permanent: boolean;
  has?: HostCondition[];
  missing?: HostCondition[];
};

/**
 * One app, two hosts.
 *   imperiodascapinhas.com.br        -> loja (store)
 *   admin.imperiodascapinhas.com.br  -> painel (/admin)
 *
 * Host routing lives in `redirects`, which Vercel resolves at the edge
 * routing layer without invoking a function (free-tier friendly).
 * Before a domain exists, the admin simply works at /admin on the same host.
 */
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, "");
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
const ADMIN_HOST_PATTERN = "admin\\..*";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: { root: path.resolve(".") },
  poweredByHeader: false,
  images: {
    // Photos are already resized/compressed in the browser and served by
    // ImageKit. Vercel image optimization stays off to protect the quota.
    unoptimized: true,
  },
  async redirects() {
    const rules: RedirectRule[] = [
      // admin.<domain>/ -> admin.<domain>/admin
      {
        source: "/",
        has: [{ type: "host", value: ADMIN_HOST_PATTERN }],
        destination: "/admin",
        permanent: false,
      },
    ];

    if (SITE_URL) {
      // Store pages requested on the admin host go back to the store.
      rules.push({
        source: "/:path((?!admin|api|_next|favicon|brand|loja).*)",
        has: [{ type: "host", value: ADMIN_HOST_PATTERN }],
        destination: `${SITE_URL}/:path`,
        permanent: false,
      });
    }

    if (ADMIN_URL) {
      // /admin on the store host moves to the admin subdomain.
      rules.push({
        source: "/admin/:path*",
        missing: [{ type: "host", value: ADMIN_HOST_PATTERN }],
        destination: `${ADMIN_URL}/admin/:path*`,
        permanent: false,
      });
    }

    return rules;
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
