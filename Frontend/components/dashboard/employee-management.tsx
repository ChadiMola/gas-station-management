"use client"

import type React from "react"

import { useState } from "react"
import { useEmployee } from "@/context/employee-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Search, Users, Calendar, DollarSign } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

export function EmployeeManagement() {
  const { state, addEmployee, updateEmployee, deleteEmployee, getTotalSalaries } = useEmployee()
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "morning" | "night" | "both" | "active" | "inactive">("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentEmployee, setCurrentEmployee] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    shift: "morning" as "morning" | "night" | "both",
    salary: 0,
    position: "",
    hireDate: new Date(),
    status: "active" as "active" | "inactive",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "salary" ? Number(value) : value,
    }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        hireDate: date,
      }))
    }
  }

  const handleAddEmployee = () => {
    addEmployee({
      ...formData,
      hireDate: formData.hireDate.toISOString(),
    })
    setFormData({
      name: "",
      shift: "morning",
      salary: 0,
      position: "",
      hireDate: new Date(),
      status: "active",
    })
    setIsAddDialogOpen(false)
  }

  const handleEditEmployee = (employee: any) => {
    setCurrentEmployee(employee)
    setFormData({
      name: employee.name,
      shift: employee.shift,
      salary: employee.salary,
      position: employee.position,
      hireDate: new Date(employee.hireDate),
      status: employee.status,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateEmployee = () => {
    if (currentEmployee) {
      updateEmployee({
        ...currentEmployee,
        name: formData.name,
        shift: formData.shift,
        salary: formData.salary,
        position: formData.position,
        hireDate: formData.hireDate.toISOString(),
        status: formData.status,
      })
      setIsEditDialogOpen(false)
    }
  }

  const handleDeleteEmployee = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet employé?")) {
      deleteEmployee(id)
    }
  }

  // Filter employees
  const filteredEmployees = state.employees.filter((employee) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && employee.status === "active") ||
      (filter === "inactive" && employee.status === "inactive") ||
      employee.shift === filter
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Format date in French
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
    return new Date(dateString).toLocaleDateString("fr-FR", options)
  }

  // Calculate total salaries
  const totalSalaries = getTotalSalaries()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-10 w-10 text-blue-600 dark:text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nombre d'Employés Actifs</p>
                <h3 className="text-2xl font-bold">{state.employees.filter((e) => e.status === "active").length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <DollarSign className="h-10 w-10 text-green-600 dark:text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total des Salaires</p>
                <h3 className="text-2xl font-bold">{totalSalaries.toFixed(2)} TND</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-10 w-10 text-purple-600 dark:text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Équipes</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                    Matin:{" "}
                    {
                      state.employees.filter(
                        (e) => (e.shift === "morning" || e.shift === "both") && e.status === "active",
                      ).length
                    }
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                  >
                    Soir:{" "}
                    {
                      state.employees.filter(
                        (e) => (e.shift === "night" || e.shift === "both") && e.status === "active",
                      ).length
                    }
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestion des Employés</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un Employé
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un Nouvel Employé</DialogTitle>
                <DialogDescription>Remplissez les informations pour ajouter un nouvel employé.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nom
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="position" className="text-right">
                    Poste
                  </Label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="shift" className="text-right">
                    Équipe
                  </Label>
                  <Select value={formData.shift} onValueChange={(value) => handleSelectChange("shift", value)}>
                    <SelectTrigger id="shift" className="col-span-3">
                      <SelectValue placeholder="Sélectionner une équipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Matin (6h-18h)</SelectItem>
                      <SelectItem value="night">Soir (18h-6h)</SelectItem>
                      <SelectItem value="both">Les deux équipes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="salary" className="text-right">
                    Salaire (TND)
                  </Label>
                  <Input
                    id="salary"
                    name="salary"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="hireDate" className="text-right">
                    Date d'Embauche
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                          {formData.hireDate
                            ? format(formData.hireDate, "PPP", { locale: fr })
                            : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={formData.hireDate}
                          onSelect={handleDateChange}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Statut
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value as "active" | "inactive")}
                  >
                    <SelectTrigger id="status" className="col-span-3">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button onClick={handleAddEmployee}>Ajouter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row mb-6">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Rechercher par nom ou poste..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="filter">Filtrer</Label>
              <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
                <SelectTrigger id="filter">
                  <SelectValue placeholder="Filtrer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les Employés</SelectItem>
                  <SelectItem value="active">Employés Actifs</SelectItem>
                  <SelectItem value="inactive">Employés Inactifs</SelectItem>
                  <SelectItem value="morning">Équipe Matin</SelectItem>
                  <SelectItem value="night">Équipe Soir</SelectItem>
                  <SelectItem value="both">Les Deux Équipes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredEmployees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Équipe</TableHead>
                  <TableHead>Date d'Embauche</TableHead>
                  <TableHead>Salaire</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                      {employee.shift === "morning" && "Matin"}
                      {employee.shift === "night" && "Soir"}
                      {employee.shift === "both" && "Les deux équipes"}
                    </TableCell>
                    <TableCell>{formatDate(employee.hireDate)}</TableCell>
                    <TableCell>{employee.salary.toFixed(2)} TND</TableCell>
                    <TableCell>
                      <Badge
                        variant={employee.status === "active" ? "default" : "secondary"}
                        className={
                          employee.status === "active"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
                      >
                        {employee.status === "active" ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditEmployee(employee)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDeleteEmployee(employee.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Aucun employé trouvé</h3>
              <p className="text-sm text-muted-foreground">
                Essayez d'ajuster vos critères de recherche ou ajoutez de nouveaux employés.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'Employé</DialogTitle>
            <DialogDescription>Modifiez les informations de l'employé.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nom
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-position" className="text-right">
                Poste
              </Label>
              <Input
                id="edit-position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-shift" className="text-right">
                Équipe
              </Label>
              <Select value={formData.shift} onValueChange={(value) => handleSelectChange("shift", value)}>
                <SelectTrigger id="edit-shift" className="col-span-3">
                  <SelectValue placeholder="Sélectionner une équipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Matin (6h-18h)</SelectItem>
                  <SelectItem value="night">Soir (18h-6h)</SelectItem>
                  <SelectItem value="both">Les deux équipes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-salary" className="text-right">
                Salaire (TND)
              </Label>
              <Input
                id="edit-salary"
                name="salary"
                type="number"
                min="0"
                step="0.01"
                value={formData.salary}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-hireDate" className="text-right">
                Date d'Embauche
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                      {formData.hireDate ? format(formData.hireDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={formData.hireDate}
                      onSelect={handleDateChange}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Statut
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value as "active" | "inactive")}
              >
                <SelectTrigger id="edit-status" className="col-span-3">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleUpdateEmployee}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
