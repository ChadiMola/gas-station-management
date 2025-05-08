import type { Expense } from "@/context/expense-context"
import type { Pump, Transaction } from "@/context/gas-station-context"
import { jsPDF } from "jspdf"
// Import the actual plugin function
import { default as autoTable } from "jspdf-autotable"

// Extend jsPDF to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export const generateSalesReportPDF = (
  transactions: Transaction[],
  expenses: Expense[],
  startDate: string,
  endDate: string,
  shift: "morning" | "night" | "all" = "all",
  pumps: Pump[] = [],
) => {
  // Create a new PDF document
  const doc = new jsPDF()
  
  // Explicitly attach autoTable to this document with the correct method signature
  doc.autoTable = function(options) {
    autoTable(this, options);
    return this;
  };
  
  // Add title
  doc.setFontSize(18)
  doc.text("Rapport de Ventes - Station-Service", 14, 22)

  // Add period
  doc.setFontSize(12)
  const formattedStartDate = new Date(startDate).toLocaleDateString("fr-FR")
  const formattedEndDate = new Date(endDate).toLocaleDateString("fr-FR")
  const shiftText = shift === "all" ? "Toutes les Équipes" : shift === "morning" ? "Équipe Matin" : "Équipe Nuit"
  doc.text(`Période: ${formattedStartDate} à ${formattedEndDate} - ${shiftText}`, 14, 30)

  // Add date of generation
  const generationDate = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
  doc.text(`Généré le: ${generationDate}`, 14, 38)

  // Calculate totals
  const totalLiters = transactions.reduce((sum, t) => sum + t.litersDispensed, 0)
  const totalRevenue = transactions.reduce((sum, t) => sum + t.revenue, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const netRevenue = totalRevenue - totalExpenses

  // Add summary
  doc.setFontSize(14)
  doc.text("Résumé", 14, 50)

  doc.setFontSize(12)
  doc.text(`Total Litres: ${totalLiters.toFixed(2)} L`, 20, 60)
  doc.text(`Revenus Bruts: ${totalRevenue.toFixed(2)} TND`, 20, 68)
  doc.text(`Total Dépenses: ${totalExpenses.toFixed(2)} TND`, 20, 76)
  doc.text(`Revenus Nets: ${netRevenue.toFixed(2)} TND`, 20, 84)

  // Add transactions table
  doc.setFontSize(14)
  doc.text("Transactions", 14, 100)

  // Fonction pour obtenir le nom de la pompe à partir de son ID
  const getPumpName = (pumpId: string) => {
    const pump = pumps.find((p) => p.id === Number(pumpId))
    return pump ? pump.name : `Pompe ${pumpId}`
  }

  // Format transactions data for the table
  const transactionsData = transactions.map((transaction) => {
    const [pumpId] = transaction.id.split("-")
    const date = new Date(transaction.date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    const shift = transaction.shift === "morning" ? "Matin" : "Soir"
    return [
      date,
      shift,
      getPumpName(pumpId),
      transaction.previousIndex.toFixed(2),
      transaction.currentIndex.toFixed(2),
      transaction.litersDispensed.toFixed(2) + " L",
      transaction.pricePerLiter.toFixed(2) + " TND",
      transaction.revenue.toFixed(2) + " TND",
    ]
  })

  // Add transactions table
  doc.autoTable({
    startY: 105,
    head: [["Date", "Équipe", "Pompe", "Index Précédent", "Index Actuel", "Litres", "Prix/L", "Revenu"]],
    body: transactionsData,
    theme: "striped",
    headStyles: { fillColor: [66, 139, 202] },
  })

  // Add expenses table on a new page
  doc.addPage()
  doc.setFontSize(14)
  doc.text("Dépenses", 14, 22)

  // Format expenses data for the table
  const expensesData = expenses.map((expense) => {
    const date = new Date(expense.date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    let category = ""
    switch (expense.category) {
      case "fuel":
        category = "Carburant"
        break
      case "oil":
        category = "Huile"
        break
      case "filter":
        category = "Filtre"
        break
      case "salary":
        category = "Salaire"
        break
      case "maintenance":
        category = "Maintenance"
        break
      case "other":
        category = "Autre"
        break
    }
    return [date, category, expense.description, expense.amount.toFixed(2) + " TND"]
  })

  // Add expenses table
  doc.autoTable({
    startY: 30,
    head: [["Date", "Catégorie", "Description", "Montant"]],
    body: expensesData,
    theme: "striped",
    headStyles: { fillColor: [66, 139, 202] },
  })

  // Group expenses by category
  const expensesByCategory: Record<string, number> = {}
  expenses.forEach((expense) => {
    if (!expensesByCategory[expense.category]) {
      expensesByCategory[expense.category] = 0
    }
    expensesByCategory[expense.category] += expense.amount
  })

  // Format expenses by category data for the table
  const expensesByCategoryData = Object.entries(expensesByCategory).map(([category, amount]) => {
    let categoryName = ""
    switch (category) {
      case "fuel":
        categoryName = "Carburant"
        break
      case "oil":
        categoryName = "Huile"
        break
      case "filter":
        categoryName = "Filtre"
        break
      case "salary":
        categoryName = "Salaire"
        break
      case "maintenance":
        categoryName = "Maintenance"
        break
      case "other":
        categoryName = "Autre"
        break
    }
    return [categoryName, amount.toFixed(2) + " TND"]
  })

  // Add expenses by category table
  const finalY = (doc as any).lastAutoTable.finalY + 20
  doc.setFontSize(14)
  doc.text("Dépenses par Catégorie", 14, finalY)

  doc.autoTable({
    startY: finalY + 5,
    head: [["Catégorie", "Montant"]],
    body: expensesByCategoryData,
    theme: "striped",
    headStyles: { fillColor: [66, 139, 202] },
  })

  // Save the PDF
  const fileName = `Rapport-Station-Service-${startDate}-à-${endDate}-${shift}.pdf`
  doc.save(fileName)
}

