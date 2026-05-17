import type { Metadata, Viewport } from 'next'
import { M_PLUS_Rounded_1c } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const mPlusRounded = M_PLUS_Rounded_1c({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Dog Ear — 読書を、行動に変える',
  description: 'AI読書メモ・要約・行動提案アプリ',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Dog Ear',
  },
}

export const viewport: Viewport = {
  themeColor: '#4A6FA5',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      className={`${mPlusRounded.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://xvzpxuiqxvhwfmjiooow.supabase.co" />
        <link rel="dns-prefetch" href="https://xvzpxuiqxvhwfmjiooow.supabase.co" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
