"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutList, User, Settings, Palette, LogOut, LogIn, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
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

import { useAuthStore } from "@/store/useAuthStore";

const navItems = [
  { href: "/list", label: "Dashboard", icon: LayoutList },
];

// Shared inner markup — rendered directly (not as a nested component) to avoid
// React unmounting on every render and swallowing click events.
function NavContent({
  pathname,
  isMounted,
  user,
  onLinkClick,
  onLoginClick,
  onLogout,
}: {
  pathname: string;
  isMounted: boolean;
  user: { name: string; email: string } | null;
  onLinkClick: () => void;
  onLoginClick: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      {/* LOGO AREA */}
      <div className="relative flex items-center h-10 px-3 mb-10">
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-16 h-28 pointer-events-none">
          <Image src="/logo-dark.png" alt="D Tracker Logo" fill className="object-contain dark:hidden block ml-3" priority />
          <Image src="/logo-light.png" alt="D Tracker Logo" fill className="object-contain hidden dark:block" priority />
        </div>
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
              onClick={onLinkClick}
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
              onClick={onLoginClick}
              className="group relative flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-secondary border border-border text-foreground font-medium hover:bg-secondary/80 transition-all overflow-hidden"
            >
              <LogIn className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span>Log in to Sync</span>
            </button>
          ) : (
            <>
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
                    onClick={onLogout}
                    className="cursor-pointer gap-3 rounded-lg font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-500 py-2.5 px-3 transition-colors outline-none"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* Direct logout button – always visible on mobile where DropdownMenu portals can fail */}
              <button
                onClick={onLogout}
                className="md:hidden relative z-50 flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </>
          )
        )}
      </div>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => { setIsMounted(true); }, []);

  // Close on route change
  useEffect(() => { setIsMobileOpen(false); }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  const handleLogout = () => {
    window.dispatchEvent(new Event('request-logout'));
    setIsMobileOpen(false);
  };

  useEffect(() => {
    const executeLogout = () => {
      document.cookie = "tracker-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      localStorage.removeItem("tracker-token");
      logout();
    };
    window.addEventListener('execute-logout', executeLogout);
    return () => window.removeEventListener('execute-logout', executeLogout);
  }, []);

  const sharedProps = {
    pathname,
    isMounted,
    user,
    onLinkClick: () => setIsMobileOpen(false),
    onLoginClick: () => { setIsAuthModalOpen(true); setIsMobileOpen(false); },
    onLogout: handleLogout,
  };

  return (
    <>
      {/* ── Hamburger — mobile only ── */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-md border border-border shadow-md text-foreground"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── Desktop sidebar — hidden on mobile ── */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 border-r border-border bg-background/80 backdrop-blur-xl flex-col py-6 px-4 z-50">
        <NavContent {...sharedProps} />
      </aside>

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.aside
              key="sidebar-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden fixed inset-y-0 left-0 w-72 z-[70] bg-background border-r border-border flex flex-col py-6 px-4 shadow-2xl"
            >
              {/* Close button — rendered directly, NOT inside NavContent */}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>

              <NavContent {...sharedProps} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => { }}
      />
    </>
  );
}