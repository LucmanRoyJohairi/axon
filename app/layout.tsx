import type { Metadata } from 'next'
// 1. Replace Playfair_Display with Inter
import { DM_Sans, DM_Mono, Inter } from 'next/font/google' 
import './globals.css'

const body = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
})

// 2. Configure Inter to manage your display variable instead
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
    <html lang="en" className={`${body.variable} ${display.variable} ${mono.variable}`}>
      <body className="bg-bg text-ink font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
