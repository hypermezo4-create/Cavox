/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/shop',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      { source: '/shop', destination: '/store/shop' },
      { source: '/men', destination: '/store/men' },
      { source: '/women', destination: '/store/women' },
      { source: '/kids', destination: '/store/kids' },
      { source: '/offers', destination: '/store/offers' },
      { source: '/about', destination: '/store/about' },
      { source: '/contact', destination: '/store/contact' },
      { source: '/privacy-policy', destination: '/store/privacy-policy' },
      { source: '/terms-of-service', destination: '/store/terms-of-service' },
      { source: '/cart', destination: '/store/cart' },
      { source: '/checkout', destination: '/store/checkout' },
      { source: '/products', destination: '/store/products' },
      { source: '/products/:path*', destination: '/store/products/:path*' },
      { source: '/order-confirmation/:path*', destination: '/store/order-confirmation/:path*' },
    ];
  },
};

module.exports = nextConfig;
