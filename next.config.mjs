/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**'
      }
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ['yahoo-finance2'],
  },
  serverRuntimeConfig: {
    // Increase timeout to 60 seconds (adjust as needed)
    serverComponentsRenderTimeout: 60000,
  },
  typescript: {
    // This will completely ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  // This will ignore TypeScript errors during development
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

export default nextConfig;