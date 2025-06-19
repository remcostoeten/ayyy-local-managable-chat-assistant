"use client"

import * as React from "react"
import { Command } from "lucide-react"

import { NavMain, NavProjects, NavSecondary, NavUser } from "@/components/navigation"
import { navigation } from "@/components/navigation/navigation"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [isMounted, setIsMounted] = React.useState(false)

    React.useEffect(() => {
        setIsMounted(true)
    }, [])

    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">AYCL</span>
                                    <span className="truncate text-xs">AI Assistant</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navigation.navMain} />
                {isMounted && <NavProjects projects={navigation.projects} />}
                {isMounted && <NavSecondary items={navigation.navSecondary} className="mt-auto" />}
            </SidebarContent>
            <SidebarFooter>
                {isMounted && <NavUser user={navigation.user} />}
            </SidebarFooter>
        </Sidebar>
    )
} 