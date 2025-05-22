"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  BookOpen, Command, HomeIcon,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Database,
  Brain,
  BookOpenCheck,
  History
} from "lucide-react"

import { NavUser, NavMain } from "@/components/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { checkDatabaseConnection } from "@/app/actions/db"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"

const data = {
  user: {
    name: "Admin",
    email: "stoetenremco.rs@gmail.com",
    avatar: "https://pa1.aminoapps.com/6319/7f4479211e6d1cbd73f361fac0edb53c787059a5_hq.gif",
  },
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: HomeIcon,
      items: [
        {
          title: "AI chat widget",
          label: ["demo"],
          url: "/aycl",
          icon: BookOpen,
        },
        {
          title: "Chat",
          url: "/chat",
          icon: MessageSquare,
        },
      ],
    },
    {
      title: "Admin",
      url: "/admin",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/admin",
          icon: LayoutDashboard,
          items: [
            {
              title: "Knowledge Management",
              url: "/admin/knowledge",
              icon: BookOpenCheck,
              items: [
                {
                  title: "Articles",
                  url: "/admin/knowledge/articles",
                },
                {
                  title: "Categories",
                  url: "/admin/knowledge/categories",
                },
                {
                  title: "Tags",
                  url: "/admin/knowledge/tags",
                }
              ]
            },
            {
              title: "AI Management",
              url: "/admin/ai",
              icon: Brain,
              items: [
                {
                  title: "Models",
                  url: "/admin/ai/models",
                },
                {
                  title: "Training",
                  url: "/admin/ai/training",
                },
                {
                  title: "Performance",
                  url: "/admin/ai/performance",
                }
              ]
            }
          ],
        },
        {
          title: "System",
          icon: Settings,
          items: [
            {
              title: "LLM Settings",
              url: "/admin/settings",
              icon: Settings,
            },
            {
              title: "Database",
              url: "/admin/database",
              icon: Database,
            }
          ]
        },
        {
          title: "Monitoring",
          icon: History,
          items: [
            {
              title: "Chat History",
              url: "/admin/chat/history",
              icon: History,
            },
            {
              title: "Embeddings",
              url: "/admin/embeddings",
              icon: Brain,
            }
          ]
        }
      ],
    },
  ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isChecking, setIsChecking] = useState(true)
  const [isCheckingAi, setIsCheckingAi] = useState(true)
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; error?: string }>({ connected: false })
  const [aiStatus, setAiStatus] = useState<{ connected: boolean; error?: string }>({ connected: false })

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Panel</span>
                  <span className="truncate text-xs">Control Center</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ThemeSwitcher />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <div></div>
      <SidebarFooter className="border-t border-border/40">
        <div className="flex items-center justify-between py-2">
          <NavUser user={data.user} />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
} 