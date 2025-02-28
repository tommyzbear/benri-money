/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['cwzvtcflgnlmbsluzfsd.supabase.co', 'media3.giphy.com'],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
