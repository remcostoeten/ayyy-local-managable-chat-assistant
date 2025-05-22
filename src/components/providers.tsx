import React from 'react'
import { Toaster } from 'sonner'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { SidebarProvider } from '@/shared/ui'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    storageKey="theme-preference"
  >
      {children}
      <Toaster richColors />
    </NextThemesProvider>
  )
}


