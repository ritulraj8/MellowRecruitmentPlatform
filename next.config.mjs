/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tells Turbopack to handle database binary packages externally
  serverExternalPackages: ['pg'],
};

export default nextConfig;