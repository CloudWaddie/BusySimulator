/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
    reactStrictMode: true, // Optional
    trailingSlash: true, // This is generally recommended for static exports like Github Pages for this insane project
    output: 'export',
    assetPrefix: isProd ? '/BusySimulator' : '',
    basePath: isProd ? '/BusySimulator' : '',
    images: {
        unoptimized: true // Disable Next.js image optimization
    },
};

export default nextConfig;
