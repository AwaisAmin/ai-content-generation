/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Mock generations are served from Unsplash's CDN. `search` is left open
    // because crop/size params (w, h, fit, crop) are part of each URL; the
    // pathname still limits optimisation to Unsplash photos only.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-*" },
    ],
    qualities: [60, 75, 90],
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    rules: {
      "*.css": {
        // `as: "*.css"` would turn `*.module.css` into a global stylesheet
        // and break CSS Modules, so Tailwind only processes plain CSS files.
        condition: { not: { path: "*.module.css" } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
