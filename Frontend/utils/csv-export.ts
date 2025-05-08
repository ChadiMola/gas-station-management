import type { Transaction, Pump } from "@/context/gas-station-context"

export type Shift = "morning" | "night" | "all"

export function filterTransactionsByShift(transactions: Transaction[], shift: Shift): Transaction[] {
  if (shift === "all") return transactions

  return transactions.filter((transaction) => {
    const date = new Date(transaction.date)
    const hours = date.getHours()

    // Morning shift: 6:00 AM to 5:59 PM
    // Night shift: 6:00 PM to 5:59 AM
    if (shift === "morning") {
      return hours >= 6 && hours < 18
    } else {
      return hours >= 18 || hours < 6
    }
  })
}

export function generateCSV(transactions: Transaction[], pumps: Pump[] = []): string {
  // CSV header - in French
  let csv = "Date,Heure,Pompe,Index Précédent,Index Actuel,Litres Distribués,Prix par Litre,Revenu\n"

  // Fonction pour obtenir le nom de la pompe à partir de son ID
  const getPumpName = (pumpId: string) => {
    const pump = pumps.find((p) => p.id === Number(pumpId))
    return pump ? pump.name : `Pompe ${pumpId}`
  }

  // Add each transaction as a row
  transactions.forEach((transaction) => {
    const date = new Date(transaction.date)
    // Format date in French format
    const dateStr = date.toLocaleDateString("fr-FR")
    const timeStr = date.toLocaleTimeString("fr-FR")

    // Find the pump ID from the transaction
    const [pumpId] = transaction.id.split("-") || "Inconnu"

    // Use comma as decimal separator for French format
    const formatNumber = (num: number) => num.toFixed(2).replace(".", ",")

    csv += `${dateStr},${timeStr},${getPumpName(pumpId)},${formatNumber(transaction.previousIndex)},${formatNumber(transaction.currentIndex)},${formatNumber(transaction.litersDispensed)},${formatNumber(transaction.pricePerLiter)},${formatNumber(transaction.revenue)}\n`
  })

  return csv
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
