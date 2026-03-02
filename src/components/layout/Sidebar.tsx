"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutList, User, Settings, Palette, LogOut, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/list", label: "Dashboard", icon: LayoutList },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem("tracker-user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("tracker-user");
    setUser(null);
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 border-r border-border bg-background/80 backdrop-blur-xl flex flex-col py-6 px-4 z-50">
      
      {/* LOGO AREA - FIXED WITH ABSOLUTE POSITIONING */}
      <div className="relative flex items-center h-10 px-3 mb-10">
        {/* The absolute positioning takes the tall logo out of the document flow so it won't stretch the sidebar */}
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-16 h-28 pointer-events-none">
          <Image src="/logo-dark.png" alt="D Tracker Logo" fill className="object-contain dark:hidden block ml-3" priority />
          <Image src="/logo-light.png" alt="D Tracker Logo" fill className="object-contain hidden dark:block" priority />
        </div>
        {/* We add margin-left to push the text past the floating logo */}
        <span className="text-xl font-bold tracking-tight text-foreground ml-14">Tracker</span>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-2">
        <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Overview
        </div>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative outline-none block"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors z-10 relative",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-sidebar-nav" 
                    className="absolute inset-0 bg-secondary border border-border rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {!isActive && (
                  <div className="absolute inset-0 bg-accent opacity-0 hover:opacity-100 rounded-xl -z-10 transition-opacity duration-300" />
                )}
                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "")} />
                {item.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* USER PROFILE OR LOGIN */}
      <div className="mt-auto pt-4 flex flex-col gap-2 min-h-[72px]">
        {isMounted && (
          !user ? (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="group relative flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-secondary border border-border text-foreground font-medium hover:bg-secondary/80 transition-all overflow-hidden"
            >
              <LogIn className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span>Log in to Sync</span>
            </button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 text-sm font-medium text-foreground hover:bg-muted/50 border border-transparent hover:border-border w-full p-2.5 rounded-xl transition-all outline-none cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 overflow-hidden text-primary">
                  <span className="font-bold text-xs uppercase">{user.name.charAt(0)}</span>
                </div>
                <div className="flex flex-col flex-1 items-start min-w-0">
                  <span className="truncate w-full text-left font-medium text-foreground">{user.name}</span>
                  <span className="truncate w-full text-left text-[10px] text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={12} className="w-60 rounded-xl bg-card border-border shadow-2xl p-2">
                <DropdownMenuLabel className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground mb-1 px-2">Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border my-1" />
                <DropdownMenuItem className="cursor-pointer gap-3 rounded-lg font-medium text-foreground hover:bg-muted focus:bg-muted py-2.5 px-3 transition-colors outline-none">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-3 rounded-lg font-medium text-foreground hover:bg-muted focus:bg-muted py-2.5 px-3 transition-colors outline-none">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-3 rounded-lg font-medium text-foreground hover:bg-muted focus:bg-muted py-2.5 px-3 transition-colors outline-none">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  Theme
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border my-1" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer gap-3 rounded-lg font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-500 py-2.5 px-3 transition-colors outline-none"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        )}
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={(u) => setUser(u)} 
      />
    </aside>
  );
}