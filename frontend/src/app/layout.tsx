import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://job-track-kensuke.vercel.app"),
  title: {
    default: "JobTrack",
    template: "%s | JobTrack",
  },
  description:
    "求人への応募状況や選考進捗、次のアクションを一元管理できるWebアプリケーションです。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "/",
    siteName: "JobTrack",
    title: "JobTrack",
    description:
      "求人への応募状況や選考進捗、次のアクションを一元管理できるWebアプリケーションです。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JobTrack - 求人応募管理Webアプリ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JobTrack",
    description:
      "求人への応募状況や選考進捗、次のアクションを一元管理できるWebアプリケーションです。",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
