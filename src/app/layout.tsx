import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "CreateFlow — Create Everything. Publish Everywhere.",
  description: "The AI-powered platform for creators — generate images, video, music & copy, then publish to all platforms in one click.",
  openGraph: {
    title: "CreateFlow",
    description: "The AI-powered creative platform for creators and brands.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  )
}
