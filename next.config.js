/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // La portada se sube como archivo dentro del FormData del Server Action.
      bodySizeLimit: "10mb",
    },
  },
};

module.exports = nextConfig;
