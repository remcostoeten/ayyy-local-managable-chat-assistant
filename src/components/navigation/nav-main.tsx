"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { Badge } from "../ui/badge"

interface NavMainProps {
  items: {
    title: string
    url?: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url?: string
      icon?: LucideIcon
      label?: string[]
      items?: {
        title: string
        url: string
        label?: string[]
      }[]
    }[]
  }[]
}

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          {item.url ? (
            <SidebarMenuButton
              asChild
              isActive={item.isActive || pathname === item.url}
            >
              <Link href={item.url}>
                <item.icon className="size-4" />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton
              isActive={item.isActive}
            >
              <item.icon className="size-4" />
              <span>{item.title}</span>
            </SidebarMenuButton>
          )}
          {item.items && (
            <SidebarMenuSub>
              {item.items.map((subItem) => (
                <SidebarMenuItem key={subItem.title}>
                  {subItem.url ? (
                    <SidebarMenuSubButton
                      asChild
                      isActive={pathname === subItem.url}
                    >
                      <Link href={subItem.url} className="flex items-center">
                        {subItem.icon && <subItem.icon className="mr-2 size-4" />}
                        <span>{subItem.title}</span>
                        {subItem?.label && (
                          <Badge variant="outline" className="ml-2">
                            {subItem.label.join(", ")}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuSubButton>
                  ) : (
                    <SidebarMenuSubButton
                      isActive={false}
                    >
                      <span className="flex items-center">
                        {subItem.icon && <subItem.icon className="mr-2 size-4" />}
                        <span>{subItem.title}</span>
                        {subItem?.label && (
                          <Badge variant="outline" className="ml-2">
                            {subItem.label.join(", ")}
                          </Badge>
                        )}
                      </span>
                    </SidebarMenuSubButton>
                  )}
                  {subItem.items && (
                    <SidebarMenuSub>
                      {subItem.items.map((nestedItem) => (
                        <SidebarMenuItem key={nestedItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === nestedItem.url}
                          >
                            <Link href={nestedItem.url} className="flex items-center">
                              <span>{nestedItem.title}</span>
                              {nestedItem?.label && (
                                <Badge variant="outline" className="ml-2">
                                  {nestedItem.label.join(", ")}
                                </Badge>
                              )}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
} 