/** @type {import('next').NextConfig} */
const nextConfig = {
  // cuelume ships as ESM-only; let Next transpile it for the server build.
  transpilePackages: ["cuelume"],
  // Every page negotiates HTML vs Markdown on the Accept header
  // (middleware.ts), so caches must key on it. Next overwrites `Vary` when it
  // renders a page, which drops the value middleware sets; declaring it here
  // puts it back on the HTML response as well.
  async headers() {
    return [
      {
        source: "/((?!_next/|api/|markdown(?:/|$)|.*\\..*).*)",
        headers: [
          {
            key: "Vary",
            value: "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Accept",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "k5c5brlnuchluhwp.public.blob.vercel-storage.com",
        pathname: "/trips/**",
      },
    ],
  },
};

export default nextConfig;
