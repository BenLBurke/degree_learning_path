/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lint is enforced in development; don't fail production builds on lint rules
  // (e.g. no-explicit-any, unescaped entities) for this demo deploy.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
