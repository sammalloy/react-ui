import { useEffect, useState } from "react"
import { Banknote, Fuel, LayoutDashboard, Moon, Sun } from "lucide-react"
import { Button } from "@backoffice/ui/button"
import { Separator } from "@backoffice/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@backoffice/ui/sidebar"
import { Toaster } from "@backoffice/ui/sonner"
import { TooltipProvider } from "@backoffice/ui/tooltip"

import { CashPage } from "./pages/cash"
import { FuelPage } from "./pages/fuel"
import { OverviewPage } from "./pages/overview"

const pages = [
  { id: "overview", title: "Overview", icon: LayoutDashboard, render: () => <OverviewPage /> },
  { id: "cash", title: "Cash", icon: Banknote, render: () => <CashPage /> },
  { id: "fuel", title: "Fuel", icon: Fuel, render: () => <FuelPage /> },
] as const

type PageId = (typeof pages)[number]["id"]

export function App() {
  const [pageId, setPageId] = useState<PageId>("overview")
  const [dark, setDark] = useState(false)
  const page = pages.find((p) => p.id === pageId)!

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="px-2 py-1.5 text-sm font-semibold">Back Office</div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Site 0142</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {pages.map((p) => (
                    <SidebarMenuItem key={p.id}>
                      <SidebarMenuButton isActive={p.id === pageId} onClick={() => setPageId(p.id)}>
                        <p.icon />
                        <span>{p.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <h1 className="text-base font-medium">{page.title}</h1>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              aria-label="Toggle theme"
              onClick={() => setDark((d) => !d)}
            >
              {dark ? <Sun /> : <Moon />}
            </Button>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{page.render()}</div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </TooltipProvider>
  )
}
