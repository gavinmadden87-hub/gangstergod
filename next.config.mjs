npm install
# create .env.local as shown above
npm run dev
 @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true
  }
};

export default nextConfig;
