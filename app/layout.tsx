import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "まちがいさがし",
  description: "ちいさな こどもが たのしめる まちがいさがし！ 30もんの えほんのような せかいで あそぼう！",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#fff0f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="まちがいさがし" />
      </head>
      <body>
        <div className="sparkle-bg" aria-hidden="true" />
        <div className="app-root">{children}</div>
      </body>
    </html>
  );
}
