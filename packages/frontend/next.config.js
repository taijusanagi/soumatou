/** @type {import('next').NextConfig} */

const nextConfig = {
  // reactStrictMode: true, // this is diabled for webgl
  swcMinify: true,
  experimental: {
    externalDir: true,
    esmExternals: "loose",
    reactStrictMode: false,
  },
};

module.exports = nextConfig;
