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

/**
 * Content Security Policy. Scripts stay 'self' + inline (Next's bootstrap)
 * without nonces, so store pages remain static and cached on the CDN.
 * Network access is limited to this site, Supabase and ImageKit.
 */
function originOf(value: string | undefined) {
  try {
    return value ? new URL(value).origin : "";
  } catch {
    return "";
  }
}
const SUPABASE_ORIGIN = originOf(process.env.NEXT_PUBLIC_SUPABASE_URL);
const IMAGEKIT_ORIGIN = originOf(process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) || "https://ik.imagekit.io";
const SITE_ORIGIN = originOf(process.env.NEXT_PUBLIC_SITE_URL);
const ADMIN_ORIGIN = originOf(process.env.NEXT_PUBLIC_ADMIN_URL);
const isDev = process.env.NODE_ENV !== "production";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${IMAGEKIT_ORIGIN} ${SITE_ORIGIN} ${ADMIN_ORIGIN}`,
  "font-src 'self'",
  `connect-src 'self' ${SUPABASE_ORIGIN} ${SUPABASE_ORIGIN.replace("https://", "wss://")} https://upload.imagekit.io${isDev ? " ws: http://localhost:* http://*.localhost:*" : ""}`,
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
]
  .map((d) => d.replace(/\s+/g, " ").trim())
  .join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

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
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
