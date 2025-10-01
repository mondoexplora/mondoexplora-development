/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.luxuryescapes.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig 