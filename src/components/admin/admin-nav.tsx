'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Database, MessageSquare, Settings, BookOpen, BrainCircuit } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ModelStatusCheck } from '@/components/admin/ModelStatusCheck'

const adminRoutes = [
  {
    href: '/',
    label: 'Home',
    icon: Home
  },
  {
    href: '/admin/knowledge',
    label: 'Knowledge Base',
    icon: BookOpen
  },
  {
    href: '/admin/knowledge/embeddings',
    label: 'Embeddings',
    icon: BrainCircuit
  },
  {
    href: '/admin/chat/history',
    label: 'Chat History',
    icon: MessageSquare
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: Settings
  }
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 flex flex-col h-screen w-64 border-r bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 border-b">
          <div className="flex items-center space-x-4">
            <Database className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Admin Dashboard</h2>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-1 p-2">
          {adminRoutes.map((route) => {
            const Icon = route.icon
            const isActive = pathname === route.href || pathname?.startsWith(route.href + '/')

            return (
              <Button
                key={route.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2",
                  isActive && "bg-muted"
                )}
                asChild
              >
                <Link href={route.href}>
                  <Icon className="h-4 w-4" />
                  {route.label}
                </Link>
              </Button>
            )
          })}
        </div>
      </div>
      <div className="p-2 border-t bg-background">
        <ModelStatusCheck />
      </div>
    </nav>
  )
} 