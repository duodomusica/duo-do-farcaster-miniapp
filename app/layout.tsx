import React from "react"
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/wagmi-provider'
import './globals.css'

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-serif"
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans"
});

// Use the deployed URL or fallback
const appUrl = "https://v0-duodomusica.vercel.app"

const miniapp = {
  version: "1",
  imageUrl: `${appUrl}/images/duo-do-cuadrada.jpeg`,
  button: {
    title: "Road to FarCon Rome",
    action: {
      type: "launch_miniapp",
      url: appUrl,
      name: "Dúo Dø at FarCon Rome",
      splashImageUrl: `${appUrl}/images/duo-do-cuadrada.jpeg`,
      splashBackgroundColor: "#1a1a2e"
    }
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'Dúo Dø - Road to FarCon Rome',
  description: 'Genre-free & in-motion music. A 45-minute onchain acoustic performance.',
  generator: 'v0.app',
  openGraph: {
    title: 'Dúo Dø - Road to FarCon Rome',
    description: 'Genre-free & in-motion music. An onchain acoustic performance.',
    type: 'website',
    images: [{
      url: '/images/duo-do-cuadrada.jpeg',
      width: 1200,
      height: 1200,
      type: 'image/jpeg',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dúo Dø - Road to FarCon Rome',
    description: 'Genre-free & in-motion music. A 45-minute onchain acoustic performance.',
    images: ['/images/duo-do-cuadrada.jpeg'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  other: {
    'fc:frame': JSON.stringify(miniapp),
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
