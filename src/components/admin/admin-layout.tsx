"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Database, BookOpen, MessageSquare, Settings, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { checkDatabaseConnection } from "@/app/actions/db"
import { checkLLMStatus } from "@/app/actions/llm"
import { NavSecondary } from "@/components/navigation/nav-secondary"
import { SidebarProvider } from "@/components/ui/sidebar"

interface StatusType {
  connected: boolean;
  error?: string;
}

interface LLMStatusType extends StatusType {
  model?: string | null;
  availableModels?: string[];
}

export default function AdminLayout({ children }: PageProps) {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [isCheckingLLM, setIsCheckingLLM] = useState(true)
  const [dbStatus, setDbStatus] = useState<StatusType>({ connected: false })
  const [llmStatus, setLLMStatus] = useState<LLMStatusType>({ connected: false })

  useEffect(() => {
    const checkLLM = async () => {
      setIsCheckingLLM(true)
      try {
        const status = await checkLLMStatus()
        setLLMStatus(status)
      } catch (error) {
        setLLMStatus({ connected: false, error: (error as Error).message })
      }
      setIsCheckingLLM(false)
    }

    checkLLM()
  }, [])

  useEffect(() => { 
    const checkConnection = async () => {
      setIsChecking(true)
      try {
        const status = await checkDatabaseConnection()
        setDbStatus({ connected: true })
      } catch (error) {
        setDbStatus({ connected: false, error: (error as Error).message })
      }
      setIsChecking(false)
    }

    checkConnection()
  }, [])

  const navItems = [
    {
      name: "Kennisbank",
      href: "/admin/knowledge",
      icon: <BookOpen size={20} />,
    },
    {
      name: "Suggesties",
      href: "/admin/suggestions",
      icon: <MessageSquare size={20} />,
    },
    {
      name: "Instellingen",
      href: "/admin/settings",
      icon: <Settings size={20} />,
    },
  ]

  return (
    <SidebarProvider>
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      {/* Mobile menu button */}
      <div className="md:hidden p-4 bg-white border-b border-neutral-200 flex justify-between items-center">
        <h1 className="font-bold text-xl">Admin Panel</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      <div
        className={`
          ${isMenuOpen ? "block" : "hidden"} 
          md:block w-full md:w-64 bg-neutral-50 border-r border-neutral-200 
          md:min-h-screen flex flex-col
        `}
      >
        <div className="p-6 flex-1">
          <h1 className="font-bold text-xl mb-6 hidden md:block">Admin Panel</h1>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm
                  ${pathname === item.href ? "bg-purple-100 text-purple-700" : "text-neutral-700 hover:bg-neutral-100"}
                `}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Secondary Navigation with Status */}
        <NavSecondary 
          items={[]} 
          dbStatus={dbStatus}
          llmStatus={llmStatus}
          isChecking={isChecking}
          isCheckingLLM={isCheckingLLM}
          className="mt-auto"
        />

        {/* User Section */}
        <div className="border-t border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-sm font-medium text-purple-700">A</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Admin</div>
              <div className="text-xs text-neutral-500">admin@example.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">{children}</div>
      </div>
    </SidebarProvider>
  )
}
