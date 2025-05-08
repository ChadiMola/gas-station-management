"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGasStation } from "@/context/gas-station-context";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowRight,
  Calendar,
  Check,
  DollarSign,
  Edit,
  FuelIcon as GasPump,
  History,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

export function PumpGrid() {
  const {
    state,
    updatePumpIndex,
    updatePumpName,
    updatePumpPrice,
    deleteTransaction,
    editTransaction,
    addPump,
  } = useGasStation();
  const [newIndexes, setNewIndexes] = useState<{ [key: number]: string }>({});
  const [editingName, setEditingName] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [newNames, setNewNames] = useState<{ [key: number]: string }>({});
  const [editingPrice, setEditingPrice] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [newPrices, setNewPrices] = useState<{ [key: number]: string }>({});
  const [editingTransaction, setEditingTransaction] = useState<{
    pumpId: number | null;
    transactionId: string | null;
    currentIndex: string;
  }>({ pumpId: null, transactionId: null, currentIndex: "" });

  // Remplacer les états individuels par des états communs
  const [commonTransactionDate, setCommonTransactionDate] = useState<Date>(
    new Date()
  );
  const [commonTransactionShift, setCommonTransactionShift] = useState<
    "morning" | "night"
  >("morning");

  const handleIndexChange = (pumpId: number, value: string) => {
    setNewIndexes((prev) => ({ ...prev, [pumpId]: value }));
  };

  const handleSubmit = (pumpId: number) => {
    const newIndex = Number.parseFloat(newIndexes[pumpId] || "0");
    if (newIndex > state.pumps[pumpId - 1].currentIndex) {
      updatePumpIndex(
        pumpId,
        newIndex,
        commonTransactionDate,
        commonTransactionShift
      );
      setNewIndexes((prev) => ({ ...prev, [pumpId]: "" }));
    }
  };

  // Gestion du nom de la pompe
  const startEditingName = (pumpId: number) => {
    setNewNames((prev) => ({
      ...prev,
      [pumpId]:
        state.pumps.find((p) => p.id === pumpId)?.name || `Pompe ${pumpId}`,
    }));
    setEditingName((prev) => ({ ...prev, [pumpId]: true }));
  };

  const saveName = (pumpId: number) => {
    if (newNames[pumpId] && newNames[pumpId].trim() !== "") {
      updatePumpName(pumpId, newNames[pumpId]);
    }
    setEditingName((prev) => ({ ...prev, [pumpId]: false }));
  };

  const cancelEditName = (pumpId: number) => {
    setEditingName((prev) => ({ ...prev, [pumpId]: false }));
  };

  // Gestion du prix de la pompe
  const startEditingPrice = (pumpId: number) => {
    setNewPrices((prev) => ({
      ...prev,
      [pumpId]:
        state.pumps.find((p) => p.id === pumpId)?.pricePerLiter.toFixed(2) ||
        "0.00",
    }));
    setEditingPrice((prev) => ({ ...prev, [pumpId]: true }));
  };

  const savePrice = (pumpId: number) => {
    const newPrice = Number.parseFloat(newPrices[pumpId] || "0");
    if (newPrice > 0) {
      updatePumpPrice(pumpId, newPrice);
    }
    setEditingPrice((prev) => ({ ...prev, [pumpId]: false }));
  };

  const cancelEditPrice = (pumpId: number) => {
    setEditingPrice((prev) => ({ ...prev, [pumpId]: false }));
  };

  const handleDeleteTransaction = (pumpId: number, transactionId: string) => {
    deleteTransaction(pumpId, transactionId);
  };

  const startEditTransaction = (
    pumpId: number,
    transactionId: string,
    currentIndex: number
  ) => {
    setEditingTransaction({
      pumpId,
      transactionId,
      currentIndex: currentIndex.toString(),
    });
  };

  const saveTransactionEdit = () => {
    if (
      editingTransaction.pumpId !== null &&
      editingTransaction.transactionId !== null &&
      editingTransaction.currentIndex
    ) {
      const newIndex = Number.parseFloat(editingTransaction.currentIndex);
      if (!isNaN(newIndex) && newIndex > 0) {
        editTransaction(
          editingTransaction.pumpId,
          editingTransaction.transactionId,
          newIndex
        );
      }
    }

    // Reset editing state
    setEditingTransaction({
      pumpId: null,
      transactionId: null,
      currentIndex: "",
    });
  };

  // Format date in French
  const formatDate = (dateString: string) => {
    if (!dateString) return "Jamais";
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };
  console.log(state.pumps);
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Paramètres de Transaction</CardTitle>
          <CardDescription>
            Sélectionnez la date et l'équipe pour toutes les transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2">
              <Label htmlFor="transaction-date">Date de Transaction</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="transaction-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1.5"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(commonTransactionDate, "PPP", { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={commonTransactionDate}
                    onSelect={(date) => date && setCommonTransactionDate(date)}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="w-full sm:w-1/2">
              <Label htmlFor="transaction-shift">Équipe</Label>
              <Select
                value={commonTransactionShift}
                onValueChange={(value) =>
                  setCommonTransactionShift(value as "morning" | "night")
                }
              >
                <SelectTrigger id="transaction-shift" className="mt-1.5">
                  <SelectValue placeholder="Sélectionner une période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Matin (6h-18h)</SelectItem>
                  <SelectItem value="night">Soir (18h-6h)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {state.pumps.map((pump) => {
          const litersDispensed = pump.currentIndex - pump.previousIndex;
          const revenue = litersDispensed * pump.pricePerLiter;

          return (
            <Card
              key={pump.id}
              className="overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  {editingName[pump.id] ? (
                    <div className="flex items-center gap-2 w-full">
                      <Input
                        value={newNames[pump.id] || ""}
                        onChange={(e) =>
                          setNewNames((prev) => ({
                            ...prev,
                            [pump.id]: e.target.value,
                          }))
                        }
                        className="h-8"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => saveName(pump.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => cancelEditName(pump.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <CardTitle className="flex items-center gap-2">
                      <GasPump className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                      {pump.name}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEditingName(pump.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  )}
                </div>
                <CardDescription className="flex items-center justify-between">
                  {editingPrice[pump.id] ? (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-600 dark:text-green-500 mr-1" />
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={newPrices[pump.id] || ""}
                          onChange={(e) =>
                            setNewPrices((prev) => ({
                              ...prev,
                              [pump.id]: e.target.value,
                            }))
                          }
                          className="h-8 w-24"
                          autoFocus
                        />
                        <span className="ml-1 text-sm">TND/L</span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => savePrice(pump.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => cancelEditPrice(pump.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <DollarSign className="h-3 w-3 text-green-600 dark:text-green-500" />
                        Prix: {pump.pricePerLiter.toFixed(2)} TND/L
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => startEditingPrice(pump.id)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                      <div className="font-medium text-muted-foreground">
                        Index Précédent
                      </div>
                      <div className="text-lg font-semibold">
                        {pump.previousIndex.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                      <div className="font-medium text-muted-foreground">
                        Index Actuel
                      </div>
                      <div className="text-lg font-semibold">
                        {pump.currentIndex.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                      <div className="font-medium text-blue-700 dark:text-blue-300">
                        Litres Distribués
                      </div>
                      <div className="text-lg font-semibold">
                        {litersDispensed.toFixed(2)} L
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                      <div className="font-medium text-green-700 dark:text-green-300">
                        Revenu
                      </div>
                      <div className="text-lg font-semibold">
                        {revenue.toFixed(2)} TND
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex items-end gap-2 mt-2">
                      <div className="flex-1">
                        <label
                          htmlFor={`new-index-${pump.id}`}
                          className="text-sm font-medium"
                        >
                          Nouvelle Lecture d'Index
                        </label>
                        <Input
                          id={`new-index-${pump.id}`}
                          type="number"
                          min={pump.currentIndex}
                          step="0.01"
                          value={newIndexes[pump.id] || ""}
                          onChange={(e) =>
                            handleIndexChange(pump.id, e.target.value)
                          }
                          placeholder="Entrer nouvelle lecture"
                          className="mt-1"
                        />
                      </div>
                      <Button
                        onClick={() => handleSubmit(pump.id)}
                        disabled={
                          !newIndexes[pump.id] ||
                          Number.parseFloat(newIndexes[pump.id]) <=
                            pump.currentIndex
                        }
                        variant="default"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3 flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  Dernière mise à jour:{" "}
                  {pump.transactions.length > 0
                    ? formatDate(
                        pump.transactions[pump.transactions.length - 1].date
                      )
                    : "Jamais"}
                </div>

                {pump.transactions.length > 0 && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <History className="h-4 w-4 mr-1" />
                        <span className="text-xs">Historique</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>
                          Historique des Transactions - {pump.name}
                        </DialogTitle>
                        <DialogDescription>
                          Consultez et modifiez l'historique des transactions
                          pour cette pompe.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="max-h-[60vh] overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Période</TableHead>
                              <TableHead>Index Précédent</TableHead>
                              <TableHead>Index Actuel</TableHead>
                              <TableHead>Litres</TableHead>
                              <TableHead>Revenu</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pump.transactions.map((transaction) => (
                              <TableRow key={transaction.id}>
                                <TableCell>
                                  {formatDate(transaction.date)}
                                </TableCell>
                                <TableCell>
                                  {transaction.shift === "morning"
                                    ? "Matin"
                                    : transaction.shift === "night"
                                    ? "Soir"
                                    : "N/A"}
                                </TableCell>
                                <TableCell>
                                  {transaction.previousIndex.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  {transaction.currentIndex.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  {transaction.litersDispensed.toFixed(2)} L
                                </TableCell>
                                <TableCell>
                                  {transaction.revenue.toFixed(2)} TND
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() =>
                                        startEditTransaction(
                                          pump.id,
                                          transaction.id,
                                          transaction.currentIndex
                                        )
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() =>
                                        handleDeleteTransaction(
                                          pump.id,
                                          transaction.id
                                        )
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardFooter>
            </Card>
          );
        })}

        {/* Add New Pump Card */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-dashed border-2 border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full inline-block">
                <GasPump className="h-8 w-8 text-blue-600 dark:text-blue-500" />
              </div>
              <h3 className="text-lg font-medium">Ajouter une Pompe</h3>
              <p className="text-sm text-muted-foreground">
                Créer une nouvelle pompe à carburant dans le système
              </p>
              <Button
                onClick={() => addPump()}
                variant="default"
                size="lg"
                className="mt-2"
              >
                <span className="mr-2">+</span>
                Nouvelle Pompe
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dialog for editing transaction */}
        <Dialog
          open={editingTransaction.pumpId !== null}
          onOpenChange={(open) => {
            if (!open)
              setEditingTransaction({
                pumpId: null,
                transactionId: null,
                currentIndex: "",
              });
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la Transaction</DialogTitle>
              <DialogDescription>
                Corrigez l'index actuel pour cette transaction.
              </DialogDescription>
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
    </div>
  );
}
