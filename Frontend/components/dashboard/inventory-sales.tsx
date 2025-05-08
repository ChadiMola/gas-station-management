"use client"

import { useState } from "react"
import { useInventory } from "@/context/inventory-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingCart, Save, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

export function InventorySales() {
  const { state, updateQuantity } = useInventory()
  const { toast } = useToast()
  const [selectedItems, setSelectedItems] = useState<{ id: string; quantity: number }[]>([])
  const [shift, setShift] = useState<"morning" | "night">("morning")
  const [filter, setFilter] = useState<"all" | "oil" | "filter">("all")

  // Filtrer les articles par catégorie
  const filteredItems = state.items.filter((item) => {
    return filter === "all" || item.category === filter
  })

  // Ajouter un article à la liste des ventes
  const addItemToSales = (id: string) => {
    // Vérifier si l'article est déjà dans la liste
    if (selectedItems.some((item) => item.id === id)) {
      return
    }

    setSelectedItems([...selectedItems, { id, quantity: 1 }])
  }

  // Mettre à jour la quantité d'un article dans la liste des ventes
  const updateSaleQuantity = (id: string, quantity: number) => {
    // Trouver l'article dans l'inventaire
    const inventoryItem = state.items.find((item) => item.id === id)

    // Vérifier si la quantité est valide
    if (!inventoryItem || quantity < 0 || quantity > inventoryItem.quantity) {
      return
    }

    setSelectedItems(selectedItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  // Supprimer un article de la liste des ventes
  const removeItemFromSales = (id: string) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== id))
  }

  // Enregistrer les ventes et mettre à jour les quantités en stock
  const saveSales = () => {
    // Vérifier s'il y a des articles à enregistrer
    if (selectedItems.length === 0) {
      toast({
        title: "Aucun article sélectionné",
        description: "Veuillez sélectionner au moins un article pour enregistrer une vente.",
        variant: "destructive",
      })
      return
    }

    // Mettre à jour les quantités en stock
    selectedItems.forEach((selectedItem) => {
      const inventoryItem = state.items.find((item) => item.id === selectedItem.id)
      if (inventoryItem) {
        const newQuantity = inventoryItem.quantity - selectedItem.quantity
        updateQuantity(selectedItem.id, newQuantity)
      }
    })

    // Afficher un message de succès
    toast({
      title: "Ventes enregistrées",
      description: `${selectedItems.length} article(s) vendu(s) pendant l'équipe de ${shift === "morning" ? "matin" : "soir"}.`,
    })

    // Réinitialiser la liste des ventes
    setSelectedItems([])
  }

  // Calculer le total des ventes
  const calculateTotal = () => {
    return selectedItems.reduce((total, selectedItem) => {
      const inventoryItem = state.items.find((item) => item.id === selectedItem.id)
      if (inventoryItem) {
        return total + inventoryItem.price * selectedItem.quantity
      }
      return total
    }, 0)
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-500" />
          Enregistrement des Ventes
        </CardTitle>
        <CardDescription>
          Enregistrez les articles vendus à la fin de chaque équipe pour mettre à jour le stock
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2">
              <Label htmlFor="shift">Équipe</Label>
              <Select value={shift} onValueChange={(value) => setShift(value as "morning" | "night")}>
                <SelectTrigger id="shift" className="mt-1.5">
                  <SelectValue placeholder="Sélectionner une équipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Matin (6h-18h)</SelectItem>
                  <SelectItem value="night">Soir (18h-6h)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-1/2">
              <Label htmlFor="filter">Filtrer par Catégorie</Label>
              <Select value={filter} onValueChange={(value) => setFilter(value as "all" | "oil" | "filter")}>
                <SelectTrigger id="filter" className="mt-1.5">
                  <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les Catégories</SelectItem>
                  <SelectItem value="oil">Huiles</SelectItem>
                  <SelectItem value="filter">Filtres</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="inventory" className="w-full">
            <TabsList>
              <TabsTrigger value="inventory">Articles en Stock</TabsTrigger>
              <TabsTrigger value="sales">Articles Sélectionnés</TabsTrigger>
            </TabsList>

            <TabsContent value="inventory">
              {filteredItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.reference}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category === "oil" ? "Huile" : "Filtre"}</TableCell>
                        <TableCell>
                          <span
                            className={
                              item.quantity <= item.threshold
                                ? "text-red-500 font-semibold"
                                : item.quantity <= item.threshold * 2
                                  ? "text-yellow-500 font-semibold"
                                  : ""
                            }
                          >
                            {item.quantity}
                          </span>
                        </TableCell>
                        <TableCell>{item.price.toFixed(2)} TND</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addItemToSales(item.id)}
                            disabled={
                              item.quantity === 0 || selectedItems.some((selectedItem) => selectedItem.id === item.id)
                            }
                          >
                            Ajouter
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Aucun article trouvé</h3>
                  <p className="text-sm text-muted-foreground">
                    Essayez d'ajuster vos critères de recherche ou ajoutez de nouveaux articles.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sales">
              {selectedItems.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Référence</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Prix Unitaire</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedItems.map((selectedItem) => {
                        const inventoryItem = state.items.find((item) => item.id === selectedItem.id)
                        if (!inventoryItem) return null

                        return (
                          <TableRow key={selectedItem.id}>
                            <TableCell>{inventoryItem.reference}</TableCell>
                            <TableCell>{inventoryItem.name}</TableCell>
                            <TableCell>{inventoryItem.price.toFixed(2)} TND</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="1"
                                  max={inventoryItem.quantity}
                                  value={selectedItem.quantity}
                                  onChange={(e) =>
                                    updateSaleQuantity(selectedItem.id, Number.parseInt(e.target.value) || 0)
                                  }
                                  className="w-20"
                                />
                                <span className="text-xs text-muted-foreground">
                                  / {inventoryItem.quantity} disponible
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{(inventoryItem.price * selectedItem.quantity).toFixed(2)} TND</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => removeItemFromSales(selectedItem.id)}>
                                Supprimer
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>

                  <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                      <span className="font-medium">Total:</span>{" "}
                      <span className="font-bold">{calculateTotal().toFixed(2)} TND</span>
                    </div>
                    <Button onClick={saveSales}>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer les ventes
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Aucun article sélectionné</h3>
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez des articles dans l'onglet "Articles en Stock" pour les ajouter à votre vente.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {selectedItems.length > 0 && (
            <Alert className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Rappel</AlertTitle>
              <AlertDescription>
                N'oubliez pas d'enregistrer vos ventes à la fin de l'équipe pour mettre à jour le stock.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
