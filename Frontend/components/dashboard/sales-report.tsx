"use client"

import { useState, useEffect } from "react"
import { useGasStation } from "@/context/gas-station-context"
import { useExpense } from "@/context/expense-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, FileBarChart, Edit, Trash2, FileText } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateSalesReportPDF } from "@/utils/pdf-export"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// Update the component to include expense integration and PDF export
export function SalesReport() {
  const { state, getFilteredTransactions, deleteTransaction, editTransaction } = useGasStation()
  const { getFilteredExpenses } = useExpense()
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [shift, setShift] = useState<"all" | "morning" | "night">("all")
  const [transactions, setTransactions] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [editingTransaction, setEditingTransaction] = useState<{
    pumpId: number | null
    transactionId: string | null
    currentIndex: string
  }>({ pumpId: null, transactionId: null, currentIndex: "" })
  const [activeTab, setActiveTab] = useState<"transactions" | "expenses" | "summary">("transactions")

  // Initialiser les données au chargement du composant
  useEffect(() => {
    setTransactions(getFilteredTransactions(startDate, endDate))
    setExpenses(getFilteredExpenses(startDate, endDate))
  }, [getFilteredTransactions, getFilteredExpenses, startDate, endDate])

  const handleSearch = () => {
    setTransactions(getFilteredTransactions(startDate, endDate, shift))
    setExpenses(getFilteredExpenses(startDate, endDate))
  }

  // Filter transactions based on shift
  const filteredTransactions = transactions.filter((transaction) => shift === "all" || transaction.shift === shift)

  // Calculate totals based on filtered transactions and expenses
  const totalLiters = filteredTransactions.reduce((sum, t) => sum + t.litersDispensed, 0)
  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.revenue, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const netRevenue = totalRevenue - totalExpenses

  const handleDownloadPDF = () => {
    generateSalesReportPDF(filteredTransactions, expenses, startDate, endDate, shift, state.pumps)
  }

  // Format date in French
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString("fr-FR", options)
  }

  // Fonction pour obtenir le nom de la pompe à partir de son ID
  const getPumpName = (pumpId: string) => {
    const pump = state.pumps.find((p) => p.id === Number(pumpId))
    return pump ? pump.name : `Pompe ${pumpId}`
  }

  const handleDeleteTransaction = (transactionId: string) => {
    const [pumpId, actualTransactionId] = transactionId.split("-")
    if (pumpId && actualTransactionId) {
      deleteTransaction(Number.parseInt(pumpId), actualTransactionId)
      // Refresh the transactions list
      setTransactions(getFilteredTransactions(startDate, endDate))
    }
  }

  const startEditTransaction = (transactionId: string, currentIndex: number) => {
    const [pumpId, actualTransactionId] = transactionId.split("-")
    if (pumpId && actualTransactionId) {
      setEditingTransaction({
        pumpId: Number.parseInt(pumpId),
        transactionId: actualTransactionId,
        currentIndex: currentIndex.toString(),
      })
    }
  }

  const saveTransactionEdit = () => {
    if (
      editingTransaction.pumpId !== null &&
      editingTransaction.transactionId !== null &&
      editingTransaction.currentIndex
    ) {
      const newIndex = Number.parseFloat(editingTransaction.currentIndex)
      if (!isNaN(newIndex) && newIndex > 0) {
        editTransaction(editingTransaction.pumpId, editingTransaction.transactionId, newIndex)
        // Refresh the transactions list
        setTransactions(getFilteredTransactions(startDate, endDate))
      }
    }

    // Reset editing state
    setEditingTransaction({ pumpId: null, transactionId: null, currentIndex: "" })
  }

  // Group expenses by category for summary
  const expensesByCategory = expenses.reduce(
    (acc, expense) => {
      const category = expense.category
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Rapport de Ventes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="start-date" className="text-sm font-medium">
                Date de Début
              </label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="end-date" className="text-sm font-medium">
                Date de Fin
              </label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="shift" className="text-sm font-medium">
                Équipe
              </label>
              <Select value={shift} onValueChange={(value) => setShift(value as "all" | "morning" | "night")}>
                <SelectTrigger id="shift">
                  <SelectValue placeholder="Sélectionner équipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les Équipes</SelectItem>
                  <SelectItem value="morning">Matin (6h-18h)</SelectItem>
                  <SelectItem value="night">Nuit (18h-6h)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle>Résultats Financiers</CardTitle>
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={filteredTransactions.length === 0}
            >
              <FileText className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground">Total Litres</div>
                <div className="text-2xl font-bold">{totalLiters.toFixed(2)} L</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground">Revenus Bruts</div>
                <div className="text-2xl font-bold text-green-600">{totalRevenue.toFixed(2)} TND</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground">Dépenses</div>
                <div className="text-2xl font-bold text-red-600">{totalExpenses.toFixed(2)} TND</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground">Revenus Nets</div>
                <div className={`text-2xl font-bold ${netRevenue >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {netRevenue.toFixed(2)} TND
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="expenses">Dépenses</TabsTrigger>
              <TabsTrigger value="summary">Résumé</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions">
              {filteredTransactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Heure</TableHead>
                      <TableHead>Équipe</TableHead>
                      <TableHead>Pompe</TableHead>
                      <TableHead>Index Précédent</TableHead>
                      <TableHead>Index Actuel</TableHead>
                      <TableHead>Litres</TableHead>
                      <TableHead>Prix/L</TableHead>
                      <TableHead>Revenu</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => {
                      // Extract pump ID from the transaction ID
                      const [pumpId] = transaction.id.split("-")

                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatDate(transaction.date)}</TableCell>
                          <TableCell>{transaction.shift === "morning" ? "Matin" : "Soir"}</TableCell>
                          <TableCell>{getPumpName(pumpId)}</TableCell>
                          <TableCell>{transaction.previousIndex.toFixed(2)}</TableCell>
                          <TableCell>{transaction.currentIndex.toFixed(2)}</TableCell>
                          <TableCell>{transaction.litersDispensed.toFixed(2)} L</TableCell>
                          <TableCell>{transaction.pricePerLiter.toFixed(2)} TND</TableCell>
                          <TableCell>{transaction.revenue.toFixed(2)} TND</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => startEditTransaction(transaction.id, transaction.currentIndex)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteTransaction(transaction.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileBarChart className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Aucune transaction trouvée</h3>
                  <p className="text-sm text-muted-foreground">
                    Essayez d'ajuster votre plage de dates ou sélection d'équipe pour voir plus de résultats.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="expenses">
              {expenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {expense.category === "fuel" && "Carburant"}
                            {expense.category === "oil" && "Huile"}
                            {expense.category === "filter" && "Filtre"}
                            {expense.category === "salary" && "Salaire"}
                            {expense.category === "maintenance" && "Maintenance"}
                            {expense.category === "other" && "Autre"}
                          </Badge>
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell className="text-right">{expense.amount.toFixed(2)} TND</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileBarChart className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Aucune dépense trouvée</h3>
                  <p className="text-sm text-muted-foreground">
                    Essayez d'ajuster votre plage de dates pour voir plus de résultats.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="summary">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Résumé des Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Nombre de transactions:</span>
                        <span className="font-bold">{filteredTransactions.length}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span>Total litres distribués:</span>
                        <span className="font-bold">{totalLiters.toFixed(2)} L</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span>Revenus bruts:</span>
                        <span className="font-bold text-green-600">{totalRevenue.toFixed(2)} TND</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Résumé des Dépenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Nombre de dépenses:</span>
                        <span className="font-bold">{expenses.length}</span>
                      </div>
                      <Separator />
                      {Object.entries(expensesByCategory).map(([category, amount]) => (
                        <div key={category} className="flex justify-between">
                          <span>
                            {category === "fuel" && "Carburant"}
                            {category === "oil" && "Huile"}
                            {category === "filter" && "Filtre"}
                            {category === "salary" && "Salaire"}
                            {category === "maintenance" && "Maintenance"}
                            {category === "other" && "Autre"}:
                          </span>
                          <span className="font-bold text-red-600">{amount.toFixed(2)} TND</span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between">
                        <span>Total dépenses:</span>
                        <span className="font-bold text-red-600">{totalExpenses.toFixed(2)} TND</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Résultat Net</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-lg">Revenus Nets (Revenus - Dépenses):</span>
                      <span className={`text-2xl font-bold ${netRevenue >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {netRevenue.toFixed(2)} TND
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog for editing transaction */}
      <Dialog
        open={editingTransaction.pumpId !== null}
        onOpenChange={(open) => {
          if (!open) setEditingTransaction({ pumpId: null, transactionId: null, currentIndex: "" })
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la Transaction</DialogTitle>
            <DialogDescription>Corrigez l'index actuel pour cette transaction.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="current-index" className="text-right">
                Nouvel Index:
              </label>
              <Input
                id="current-index"
                type="number"
                step="0.01"
                value={editingTransaction.currentIndex}
                onChange={(e) =>
                  setEditingTransaction((prev) => ({
                    ...prev,
                    currentIndex: e.target.value,
                  }))
                }
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={saveTransactionEdit}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
