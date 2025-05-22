import { MainNav } from "./nav-main"

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <MainNav />
      <main className="flex-1">{children}</main>
    </div>
  )
}