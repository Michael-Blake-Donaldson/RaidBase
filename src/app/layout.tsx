import type { Metadata } from "next";
import type { Viewport } from "next";
import { Inter, Orbitron, Sora } from "next/font/google";
import "./globals.css";

import { WebVitalsReporter } from "@/components/web-vitals-reporter";
import { ToastProvider } from "@/components/ui/toast";
import { siteConfig } from "@/lib/site-config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Raidbase | PC Gaming Squad Ecosystem",
    template: "%s | Raidbase",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "256x256" },
      { url: "/raidbaselogo-transparent.png", type: "image/png", sizes: "256x256" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "256x256", type: "image/png" }],
    shortcut: ["/icon.png"],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "Raidbase | PC Gaming Squad Ecosystem",
    description: siteConfig.description,
    siteName: siteConfig.name,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: "Raidbase | PC Gaming Squad Ecosystem",
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#07111f",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-rb-theme="day"
      suppressHydrationWarning
      className={`${inter.variable} ${sora.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('raidbase-theme');document.documentElement.dataset.rbTheme=(t==='night'||t==='day')?t:'day';}catch(e){document.documentElement.dataset.rbTheme='day';}",
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-cyan-300 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-slate-950"
        >
          Skip to content
        </a>
        <ToastProvider>
          {children}
        </ToastProvider>
        <WebVitalsReporter />
      </body>
    </html>
  );
}
