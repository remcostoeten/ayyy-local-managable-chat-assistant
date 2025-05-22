"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Home, Settings, Book, Lightbulb, ArrowLeft, Menu } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { MobileNav } from "./mobile-nav"

export function AdminHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
    },
    {
      href: "/admin/knowledge",
      icon: Book,
      label: "Knowledge Base",
    },
    {
      href: "/admin/suggestions",
      icon: Lightbulb,
      label: "Suggestions",
    },
    {
      href: "/admin/settings",
      icon: Settings,
      label: "Settings",
    },
  ]

  const isSubPage = pathname !== "/admin" && pathname.startsWith("/admin")

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            {isSubPage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="mr-2"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Link href="/admin" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">Admin Dashboard</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 ${
                      isActive 
                        ? "text-foreground" 
                        : "text-foreground/60 hover:text-foreground/80"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <ThemeToggle />
            <div className="md:hidden">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMobileNavOpen(true)}
                className="relative"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      <MobileNav isOpen={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </>
  )
} 