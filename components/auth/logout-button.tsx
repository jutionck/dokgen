"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { logoutAction } from "@/lib/actions/auth";

interface LogoutButtonProps {
  variant?: "ghost" | "outline" | "default" | "destructive";
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({ variant = "ghost", className, children }: LogoutButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    if (pending) return;
    setPending(true);

    try {
      await authClient.signOut();
    } catch (err) {
      console.error("[LogoutButton] authClient.signOut error:", err);
    }

    try {
      await logoutAction();
    } catch {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <Button type="button" variant={variant} className={className} onClick={handleLogout} disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      {children || "Keluar"}
    </Button>
  );
}
