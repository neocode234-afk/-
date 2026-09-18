import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  // Keep dev hot-reload output separate from production builds.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    if (process.env.NODE_ENV !== "production") return [];

    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Content-Security-Policy", value: "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'" },
      ],
    }, {
      source: "/images/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }];
  },
};
export default nextConfig;
