"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutList, User, LogOut, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, signIn, useSession } from "next-auth/react";
import { motion } from "framer-motion";

const navItems = [
  { href: "/list", label: "Dashboard", icon: LayoutList },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

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

      {session?.user ? (
        <div className="mt-auto border-t border-border pt-4 px-2 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground mb-2 px-1">
            <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="truncate">{session.user.name || session.user.email}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </motion.button>
        </div>
      ) : (
        <div className="mt-auto border-t border-border pt-4 px-2 flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signIn()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign In to Save
          </motion.button>
        </div>
      )}
    </aside>
  );
}
