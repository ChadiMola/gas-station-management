"use client";

import type React from "react";

import { Sidebar } from "@/components/dashboard/sidebar";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    console.log("user", user);
    console.log("isLoading", isLoading);
    // Si l'utilisateur n'est pas authentifié et que le chargement est terminé, rediriger vers la page de connexio
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Écouter un événement personnalisé pour le changement d'état de la barre latérale
  useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent) => {
      setIsCollapsed(e.detail.isCollapsed);
    };

    window.addEventListener("sidebarToggle" as any, handleSidebarToggle as any);

    return () => {
      window.removeEventListener(
        "sidebarToggle" as any,
        handleSidebarToggle as any
      );
    };
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        } min-h-screen`}
      >
        <main className="container mx-auto p-4 pt-16 lg:pt-4">{children}</main>
      </div>
    </div>
  );
}
