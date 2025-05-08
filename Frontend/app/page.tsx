import { redirect } from "next/navigation"

export default function Home() {
  // Redirection directe vers le tableau de bord
  redirect("/dashboard")
}
