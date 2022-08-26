/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: ".",
  reactStrictMode: false,
  swcMinify: true,
  env: {
    API_END_POINT: "https://zstwm5j3xg.execute-api.ap-east-1.amazonaws.com/prod",
    AU_IMAGE_CDN_ENDPOINT: "https://d3n6kp4zubwtv4.cloudfront.net/products/au/images/",
    JP_IMAGE_CDN_ENDPOINT: "https://d3n6kp4zubwtv4.cloudfront.net/products/jp/images/"
  }
}

module.exports = nextConfig
