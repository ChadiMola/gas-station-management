"use client"

import { useState } from "react"
import { useGasStation } from "@/context/gas-station-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { generateCSV, downloadCSV, filterTransactionsByShift } from "@/utils/csv-export"

export function AutoReportGenerator() {
  const { getFilteredTransactions } = useGasStation()
  const [date, setDate] = useState<Date | undefined>(new Date())

  const generateDailyReports = () => {
    if (!date) return

    const formattedDate = format(date, "yyyy-MM-dd")
    const allTransactions = getFilteredTransactions(formattedDate, formattedDate)

    // Generate morning shift report (6AM-6PM)
    const morningTransactions = filterTransactionsByShift(allTransactions, "morning")
    if (morningTransactions.length > 0) {
      const morningCsv = generateCSV(morningTransactions)
      const morningFilename = `Rapport-Station-Service-${formattedDate}-Équipe-Matin.csv`
      downloadCSV(morningCsv, morningFilename)
    }

    // Generate night shift report (6PM-6AM)
    const nightTransactions = filterTransactionsByShift(allTransactions, "night")
    if (nightTransactions.length > 0) {
      const nightCsv = generateCSV(nightTransactions)
      const nightFilename = `Rapport-Station-Service-${formattedDate}-Équipe-Nuit.csv`
      downloadCSV(nightCsv, nightFilename)
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          Rapports d'Équipe Quotidiens
        </CardTitle>
        <CardDescription>Générer des rapports d'équipe matin et nuit pour un jour spécifique</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Sélectionner Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal bg-white dark:bg-gray-800",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={fr}
                  className="bg-white dark:bg-gray-800"
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={generateDailyReports} disabled={!date} variant="default">
            <Download className="h-4 w-4 mr-2" />
            Générer Rapports d'Équipe
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
