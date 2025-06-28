'use client';
import React from "react";
import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";

export default function ClientNavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard") || 
                     pathname.startsWith("/admin") || 
                     pathname.startsWith("/profile") || 
                     pathname.startsWith("/my-vehicles") ||
                     pathname.startsWith("/vehicles/create");
  return (
    <>
      {!isDashboard && <Navigation />}
      {children}
    </>
  );
} 