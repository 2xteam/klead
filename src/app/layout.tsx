import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";

export const metadata: Metadata = {
  title: "클리드 : 뷰티양성교육기관",
  description: "Beauty Mastery Academy",
  keywords: ["클리드", "뷰티양성교육기관", "왁싱", "두피관리", "페이스디자인"],
  openGraph: {
    title: "클리드 : 뷰티양성교육기관",
    description: "Beauty Mastery Academy",
    url: "https://klead.kr",
    siteName: "클리드",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "https://pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev/klead/assets/ce858212a2ff7.png",
        width: 1200,
        height: 627,
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#7407ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
