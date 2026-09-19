import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
      // Admin-uploaded media, served by the Express backend. The hostname
      // and port are derived from NEXT_PUBLIC_API_URL so this keeps working
      // when the API moves off localhost.
      ...apiImagePattern(),
    ],
  },
};

/**
 * next.config is evaluated at build time, so NEXT_PUBLIC_API_URL must be set
 * in the environment (see .env.local). If it's missing or unparseable, the
 * pattern is simply omitted -- uploaded images then fall back to a plain
 * <img> (see lib/utils/media.ts canUseNextImage) rather than failing.
 */
function apiImagePattern() {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) return [];
  try {
    const { protocol, hostname, port } = new URL(raw);
    return [
      {
        protocol: protocol.replace(":", ""),
        hostname,
        ...(port ? { port } : {}),
        pathname: "/uploads/**",
      },
    ];
  } catch {
    return [];
  }
}

export default withNextIntl(nextConfig);
