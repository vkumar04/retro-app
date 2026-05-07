import type { Metadata, Viewport } from 'next'
import { Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono"
})

export const metadata: Metadata = {
  title: 'BIOMONITOR v2.4 // WEYLAND-YUTANI CORP',
  description: 'Personal biometric monitoring system',
}

export const viewport: Viewport = {
  themeColor: '#00ff80',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${geistMono.variable} font-mono antialiased`}>
        <div className="scanlines" />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
