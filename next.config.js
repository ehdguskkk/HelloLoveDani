/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["*.preview.same-app.com"],
  images: {
    // 배포 전까지는 최적화 끔 (프로덕션에서 켤 수 있음)
    unoptimized: true,

    // 도메인 화이트리스트 (기존 + Firebase Storage 추가)
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "ext.same-assets.com",
      "ugc.same-assets.com",
      "firebasestorage.googleapis.com", // ✅ Firebase Storage
    ],

    // 원격 패턴 (기존 + Firebase Storage 추가)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ugc.same-assets.com",
        pathname: "/**",
      },
      // ✅ Firebase Storage 다운로드 URL 형태
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/**",
      },
    ],
  },
};

module.exports = nextConfig;