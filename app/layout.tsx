// app/layout.tsx
import type { Metadata } from 'next'
import { DM_Sans, DM_Mono, Inter } from 'next/font/google' 
import './globals.css'

const body = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
})

const display = Inter({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700'],
})

const mono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'Axon Ticketing System',
  description: 'AI-powered support ticket triage',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html 
      lang="en" 
      className={`dark ${body.variable} ${display.variable} ${mono.variable}`}
      style={{ colorScheme: 'dark', backgroundColor: '#09090b' }}
    >
      <body className="bg-zinc-900 text-ink font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
