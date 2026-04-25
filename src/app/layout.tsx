import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import CookieConsent from "@/components/cookie-consent"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thearmansheikh.co"

export const metadata: Metadata = {
  title: {
    default: "CreateFlow — Create Everything. Publish Everywhere.",
    template: "%s | CreateFlow",
  },
  description: "The AI-powered platform for creators — generate images, video, music & copy, then publish to all platforms in one click.",
  keywords: ["AI content creation", "AI image generation", "AI video creation", "social media scheduler", "content management", "AI music generator"],
  authors: [{ name: "CreateFlow" }],
  creator: "CreateFlow",
  publisher: "CreateFlow",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    siteName: "CreateFlow",
    title: "CreateFlow — Create Everything. Publish Everywhere.",
    description: "The AI-powered platform for creators — generate images, video, music & copy, then publish to all platforms in one click.",
    url: siteUrl,
    locale: "en_GB",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "CreateFlow — AI-powered creative platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CreateFlow — Create Everything. Publish Everywhere.",
    description: "The AI-powered platform for creators — generate images, video, music & copy, then publish to all platforms in one click.",
    images: ["/api/og"],
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CreateFlow",
    url: siteUrl,
    description: "AI-powered creative content management studio for creators and brands.",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
    },
  }

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-screen bg-background antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground focus:outline-none"
        >
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
