import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PT Command - Heavy/Medium/Light Training',
  description: 'Professional strength training tracker with H/M/L protocol',
  manifest: '/manifest.json',
  themeColor: '#c89828',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-hull-950 text-navy-50 antialiased">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
