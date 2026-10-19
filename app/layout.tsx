import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { MotionProvider } from '@/components/motion-provider'
import './globals.css'

const sans = Geist({ subsets: ['latin'], variable: '--font-sans' })
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: { default: 'CreatorPulse — Creator analytics & money tracker', template: '%s · CreatorPulse' },
  description: 'Track your TikTok growth over time and every pound you earn and spend as a creator, in one private dashboard.',
}

export const viewport: Viewport = {
  themeColor: '#0a0b10',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans">
        <MotionProvider>{children}</MotionProvider>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            className: '!bg-surface-2 !border-border !text-foreground !rounded-xl',
          }}
        />
      </body>
    </html>
  )
}
