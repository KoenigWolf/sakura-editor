/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // 静的エクスポート時に動的ルートを無効化
  trailingSlash: true,
};

module.exports = nextConfig;
