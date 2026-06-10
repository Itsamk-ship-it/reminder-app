/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_POD_URL || 'http://backend.pod:8000'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
