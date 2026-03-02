"use client";

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
    <aside className="fixed inset-y-0 left-0 w-64 border-r border-border bg-background/80 backdrop-blur-xl flex flex-col pt-8 pb-4 px-4 z-50">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
          <span className="text-foreground font-bold text-sm">D</span>
        </div>
        <h1 className="font-semibold tracking-tight text-foreground">Tracker</h1>
      </div>

      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative outline-none"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors z-10 relative",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-sidebar-nav" 
                    className="absolute inset-0 bg-secondary border border-border rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {!isActive && (
                  <div className="absolute inset-0 bg-accent opacity-0 hover:opacity-100 rounded-lg -z-10 transition-opacity" />
                )}
                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "")} />
                {item.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* USER PROFILE OR LOGIN */}
      <div className="mt-auto border-t border-border pt-4 px-2 flex flex-col gap-2 min-h-[72px]">
        {isMounted && (
          !user ? (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(217,119,6,0.15)]"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 text-sm font-medium text-foreground hover:bg-muted/50 w-full p-2 rounded-xl transition-colors outline-none cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 overflow-hidden">
                  <span className="font-bold text-xs uppercase">{user.name.charAt(0)}</span>
                </div>
                <div className="flex flex-col flex-1 items-start min-w-0">
                  <span className="truncate w-full text-left font-semibold tracking-tight">{user.name}</span>
                  <span className="truncate w-full text-left text-[10px] text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={12} className="w-56 rounded-xl border-white/10 dark:bg-card shadow-2xl">
                <DropdownMenuLabel className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg font-medium outline-none focus:bg-primary/10 py-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg font-medium outline-none focus:bg-primary/10 py-2">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg font-medium outline-none focus:bg-primary/10 py-2">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  Theme
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5 my-1" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer gap-2 rounded-lg font-bold text-red-500 hover:text-red-500 focus:text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 py-2 outline-none"
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
