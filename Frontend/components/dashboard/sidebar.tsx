"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/context/auth-context"
import { ChevronRight, GaugeCircle, Menu, FileBarChart, Settings, Package, Receipt, Users, LogOut } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { logout, user } = useAuth()

  // Émettre un événement personnalisé lorsque l'état de la barre latérale change
  useEffect(() => {
    const event = new CustomEvent("sidebarToggle", { detail: { isCollapsed } })
    window.dispatchEvent(event)
  }, [isCollapsed])

  const routes = [
    {
      label: "Tableau de bord",
      icon: GaugeCircle,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Inventaire",
      icon: Package,
      href: "/dashboard/inventory",
      active: pathname === "/dashboard/inventory",
    },
    {
      label: "Dépenses",
      icon: Receipt,
      href: "/dashboard/expenses",
      active: pathname === "/dashboard/expenses",
    },
    {
      label: "Rapports",
      icon: FileBarChart,
      href: "/dashboard/reports",
      active: pathname === "/dashboard/reports",
    },
    {
      label: "Employés",
      icon: Users,
      href: "/dashboard/employees",
      active: pathname === "/dashboard/employees",
    },
    {
      label: "Paramètres",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
  ]

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40 lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="flex h-full flex-col">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Station Service</h2>
              {user && <p className="text-sm text-muted-foreground">Connecté en tant que {user.name}</p>}
            </div>
            <ScrollArea className="flex-1">
              <div className="px-2 py-4">
                <nav className="flex flex-col gap-1">
                  {routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        route.active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                      )}
                    >
                      <route.icon className="h-5 w-5" />
                      {route.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </ScrollArea>
            <div className="border-t p-4 flex justify-between items-center">
              <ModeToggle />
              <Button variant="outline" size="sm" onClick={logout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col border-r bg-background transition-all duration-300",
          isCollapsed ? "w-20" : "w-64",
          className,
        )}
      >
        <div className={cn("flex h-14 items-center border-b px-4", isCollapsed && "justify-center")}>
          {isCollapsed ? (
            <GaugeCircle className="h-6 w-6" />
          ) : (
            <div>
              <h2 className="text-lg font-semibold">Station Service</h2>
              {user && <p className="text-xs text-muted-foreground">Connecté en tant que {user.name}</p>}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("absolute right-2", isCollapsed && "rotate-180")}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className={cn("px-2 py-4", isCollapsed && "flex flex-col items-center px-0")}>
            <nav className={cn("flex flex-col gap-1", isCollapsed && "items-center")}>
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    route.active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    isCollapsed && "flex-col justify-center h-14 w-14 px-0",
                  )}
                >
                  <route.icon className={cn("h-5 w-5", isCollapsed && "h-6 w-6")} />
                  {!isCollapsed && route.label}
                </Link>
              ))}
            </nav>
          </div>
        </ScrollArea>
        <div className={cn("border-t p-4", isCollapsed ? "flex justify-center" : "flex justify-between items-center")}>
          <ModeToggle />
          {!isCollapsed && (
            <Button variant="outline" size="sm" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          )}
          {isCollapsed && (
            <Button variant="ghost" size="icon" onClick={logout} className="mt-2" title="Déconnexion">
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
