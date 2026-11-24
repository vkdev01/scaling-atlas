/**
 * Static export for GitHub Pages.
 *
 * NEXT_PUBLIC_BASE_PATH is injected by the deploy workflow with the repo name
 * (e.g. "/scaling-atlas") because a project site is served from a subpath.
 * Locally it is empty, so `npm run build && npx serve out` works at "/".
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
