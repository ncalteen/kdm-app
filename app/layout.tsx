import '@/app/globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { LocalProvider } from '@/contexts/local-context'
import { Analytics } from '@vercel/analytics/next'
import { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { headers } from 'next/headers'
import { ReactElement, ReactNode } from 'react'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Kingdom Death: Monster - Archivist'
}

/**
 * Root Layout Component
 *
 * Reading `x-nonce` from the request headers opts every route into dynamic
 * rendering, which is required for Next.js to attach the per-request CSP nonce
 * (set in `lib/supabase/proxy.ts`) to its inline bootstrap scripts. Without
 * this, production routes are statically generated and the inline scripts have
 * no nonce — causing CSP to block them.
 *
 * @param props Component Properties
 * @returns Root Layout Component
 */
export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode
}>): Promise<ReactElement> {
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Analytics />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          nonce={nonce}>
          <LocalProvider>{children}</LocalProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
