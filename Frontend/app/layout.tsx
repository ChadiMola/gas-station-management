import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { GasStationProvider } from "@/context/gas-station-context"
import { InventoryProvider } from "@/context/inventory-context"
import { ExpenseProvider } from "@/context/expense-context"
import { EmployeeProvider } from "@/context/employee-context"
import { AuthProvider } from "@/context/auth-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gestion de Station-Service",
  description: "Tableau de bord pour suivre la distribution de carburant de six pompes",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            <GasStationProvider>
              <InventoryProvider>
                <ExpenseProvider>
                  <EmployeeProvider>
                    {children}
                    <Toaster />
                  </EmployeeProvider>
                </ExpenseProvider>
              </InventoryProvider>
            </GasStationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
