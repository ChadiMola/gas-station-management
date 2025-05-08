"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Save, User, Shield, Bell, Database, Download, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useGasStation } from "@/context/gas-station-context"
import { useInventory } from "@/context/inventory-context"
import { useExpense } from "@/context/expense-context"
import { useEmployee } from "@/context/employee-context"
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

export function Settings() {
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const { resetData: resetGasStation } = useGasStation()
  const { resetData: resetInventory } = useInventory()
  const { resetData: resetExpense } = useExpense()
  const { resetData: resetEmployee } = useEmployee()

  const handleSave = () => {
    // Simuler une sauvegarde
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleResetAllData = () => {
    // Réinitialiser toutes les données
    resetGasStation()
    resetInventory()
    resetExpense()
    resetEmployee()

    // Fermer la boîte de dialogue
    setIsResetDialogOpen(false)

    // Afficher un message de succès
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)

    // Supprimer également les données du localStorage
    localStorage.removeItem("gasStationState")
    localStorage.removeItem("inventoryState")
    localStorage.removeItem("expenseState")
    localStorage.removeItem("employeeState")
  }

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="bg-gray-100 dark:bg-gray-800 p-1">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Profil</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>Sécurité</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span>Notifications</span>
        </TabsTrigger>
        <TabsTrigger value="data" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span>Données</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card className="shadow-sm">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
            <CardTitle>Profil</CardTitle>
            <CardDescription>Gérez vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {saveSuccess && (
              <Alert className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Vos modifications ont été enregistrées avec succès.</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" defaultValue="Utilisateur" className="bg-white dark:bg-gray-800" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue="utilisateur@station.com"
                className="bg-white dark:bg-gray-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Input id="role" defaultValue="Administrateur" className="bg-muted/50" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t p-6">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer les modifications
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card className="shadow-sm">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
            <CardTitle>Sécurité</CardTitle>
            <CardDescription>Gérez vos paramètres de sécurité</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mot de passe actuel</Label>
              <Input id="current-password" type="password" className="bg-white dark:bg-gray-800" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input id="new-password" type="password" className="bg-white dark:bg-gray-800" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input id="confirm-password" type="password" className="bg-white dark:bg-gray-800" />
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">Authentification à deux facteurs</Label>
                <p className="text-sm text-muted-foreground">
                  Activez l'authentification à deux facteurs pour une sécurité renforcée
                </p>
              </div>
              <Switch id="two-factor" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t p-6">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer les modifications
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card className="shadow-sm">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configurez vos préférences de notification</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Notifications par email</Label>
                <p className="text-sm text-muted-foreground">
                  Recevez des notifications par email pour les rapports quotidiens
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="price-alerts">Alertes de changement de prix</Label>
                <p className="text-sm text-muted-foreground">
                  Recevez des alertes lorsque les prix du carburant changent
                </p>
              </div>
              <Switch id="price-alerts" defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="low-stock">Alertes de stock bas</Label>
                <p className="text-sm text-muted-foreground">
                  Recevez des alertes lorsque le stock de carburant est bas
                </p>
              </div>
              <Switch id="low-stock" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t p-6">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer les préférences
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="data">
        <Card className="shadow-sm">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
            <CardTitle>Gestion des données</CardTitle>
            <CardDescription>Gérez les données de votre station-service</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {saveSuccess && (
              <Alert className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Les données ont été réinitialisées avec succès.</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Exportation des données</h3>
              <p className="text-sm text-muted-foreground">
                Exportez toutes les données de votre station-service au format CSV
              </p>
              <Button variant="outline" className="mt-2 bg-white dark:bg-gray-800">
                <Download className="h-4 w-4 mr-2" />
                Exporter toutes les données
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Sauvegarde des données</h3>
              <p className="text-sm text-muted-foreground">Créez une sauvegarde complète de toutes vos données</p>
              <Button variant="outline" className="mt-2 bg-white dark:bg-gray-800">
                <Database className="h-4 w-4 mr-2" />
                Créer une sauvegarde
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Zone de danger</h3>
              <p className="text-sm text-muted-foreground">Attention: ces actions sont irréversibles</p>

              <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="mt-2">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Réinitialiser toutes les données
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-red-600">Confirmation de réinitialisation</DialogTitle>
                    <DialogDescription>
                      Êtes-vous sûr de vouloir réinitialiser toutes les données? Cette action est irréversible et
                      supprimera:
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4 space-y-2">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Toutes les transactions des pompes</li>
                      <li>Tous les articles d'inventaire</li>
                      <li>Toutes les dépenses enregistrées</li>
                      <li>Toutes les données des employés</li>
                    </ul>

                    <Alert variant="destructive" className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Cette action ne peut pas être annulée. Toutes les données seront perdues.
                      </AlertDescription>
                    </Alert>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Annuler</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={handleResetAllData}>
                      Confirmer la réinitialisation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
