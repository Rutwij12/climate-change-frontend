import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'compute-pressure=(self)'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'cross-origin'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          }
        ],
      }
    ];
  },
};

export default nextConfig;
