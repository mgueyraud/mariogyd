/** @type {import('next').NextConfig} */
const nextConfig = {
  // cuelume ships as ESM-only; let Next transpile it for the server build.
  transpilePackages: ["cuelume"],
};

export default nextConfig;
