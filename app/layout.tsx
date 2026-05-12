import type { Metadata } from 'next'
import { Outfit, Raleway, Rubik, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { OrganizationProvider } from "@/components/providers/organization-provider"
import { cn } from '@/lib/utils'

import { AuthSync } from '@/components/feature/auth/auth-sync'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const raleway = Raleway({ subsets: ['latin'], variable: '--font-raleway' })
const rubik = Rubik({ subsets: ['latin'], variable: '--font-rubik' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Policy Training Platform',
  description: 'Secure, multi-tenant corporate training',
  icons: {
    icon: '/aaplus_logo.png',
    shortcut: '/aaplus_logo.png',
    apple: '/aaplus_logo.png',
  },
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
        playfair.variable,
        "font-sans antialiased"
      )}>
        <OrganizationProvider>
          <AuthSync />
          {children}
          <Toaster position="top-center" richColors />
        </OrganizationProvider>
      </body>
    </html>
  )
}
