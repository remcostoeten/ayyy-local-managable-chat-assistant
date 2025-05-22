"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Settings,
  Database,
  Bot,
  MessageSquare,
  Upload,
  Brain,
  LayoutDashboard,
  FileText,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar"

export function MainNav() {
  const pathname = usePathname()

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-2">
            <Bot className="h-6 w-6" />
            <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900">
              AI Bot Admin
            </span>
          </div>
          <SidebarTrigger />
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/admin"}
                tooltip="Dashboard"
              >
                <Link href="/admin">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/admin/chat")}
                tooltip="Chat"
              >
                <Link href="/admin/chat">
                  <MessageSquare />
                  <span>Chat</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuSub>
                <SidebarMenuItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === "/admin/chat/history"}
                  >
                    <Link href="/admin/chat/history">Chat History</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuItem>
              </SidebarMenuSub>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/admin/knowledge")}
                tooltip="Knowledge Base"
              >
                <Link href="/admin/knowledge">
                  <Brain />
                  <span>Knowledge Base</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuSub>
                <SidebarMenuItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === "/admin/knowledge/embeddings"}
                  >
                    <Link href="/admin/knowledge/embeddings">Embeddings</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === "/admin/knowledge/articles"}
                  >
                    <Link href="/admin/knowledge/articles">Articles</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuItem>
              </SidebarMenuSub>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/admin/suggestions")}
                tooltip="Suggestions"
              >
                <Link href="/admin/suggestions">
                  <FileText />
                  <span>Suggestions</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/admin/settings"}
                tooltip="Settings"
              >
                <Link href="/admin/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-green-500" />
              <span className="text-xs">DB Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-green-500" />
              <span className="text-xs">LLM Ready</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}
                                                