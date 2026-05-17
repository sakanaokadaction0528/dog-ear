import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
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
      className={`${geistSans.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://xvzpxuiqxvhwfmjiooow.supabase.co" />
        <link rel="dns-prefetch" href="https://xvzpxuiqxvhwfmjiooow.supabase.co" />
      </head>
      <body className="min-h-full flex flex-col">
        <div
          id="splash"
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#ffffff', gap: '16px',
            animation: 'splashFade 0.4s ease-out 1.1s forwards',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="Dog Ear" width={80} height={80} style={{ borderRadius: '20px' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#111', letterSpacing: '-0.5px' }}>Dog Ear</div>
            <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>読書を、行動に変える</div>
          </div>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          setTimeout(function(){
            var s = document.getElementById('splash');
            if(s) s.remove();
          }, 1600);
        `}} />
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
