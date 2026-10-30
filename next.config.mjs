/** @type {import('next').NextConfig} */
const nextConfig = {
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
