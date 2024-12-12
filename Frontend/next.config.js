/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'assets.aceternity.com'],
  },
  experimental: {
    middlewareTracing: true, // Enables middleware tracing for debugging
  },
};

module.exports = nextConfig;
