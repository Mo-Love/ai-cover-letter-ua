/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopack: {
      resolveAlias: {
        "pdf2json": "pdf2json",
      },
    },
  },
};

export default nextConfig;