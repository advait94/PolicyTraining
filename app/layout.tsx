import type { Metadata } from 'next'
import { Outfit, Raleway, Rubik } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const raleway = Raleway({ subsets: ['latin'], variable: '--font-raleway' })
const rubik = Rubik({ subsets: ['latin'], variable: '--font-rubik' })

export const metadata: Metadata = {
  title: 'Policy Training Platform',
  description: 'Secure, multi-tenant corporate training',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn(
        outfit.variable,
        raleway.variable,
        rubik.variable,
        "font-sans antialiased"
      )}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
