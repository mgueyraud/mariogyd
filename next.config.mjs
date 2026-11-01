/** @type {import('next').NextConfig} */
const nextConfig = {
  // `*.dev.tsx` routes (the /playground scratch canvas) only exist under
  // `next dev`, so production never builds them or bundles their dev tools.
  pageExtensions:
    process.env.NODE_ENV === "development"
      ? ["dev.tsx", "tsx", "ts", "jsx", "js"]
      : ["tsx", "ts", "jsx", "js"],
  // cuelume ships as ESM-only; let Next transpile it for the server build.
  transpilePackages: ["cuelume"],
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
