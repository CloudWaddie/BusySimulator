/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, // Optional
    trailingSlash: true, // This is generally recommended for static exports like Github Pages for this insane project
    output: 'export',
    basePath: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',
    assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',
    images: {
        unoptimized: true // Disable Next.js image optimization
    },
};

export default nextConfig;
