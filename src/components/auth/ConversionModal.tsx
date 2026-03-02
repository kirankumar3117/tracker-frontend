"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cloud, Lock, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  onSkip?: () => void;
}

export function ConversionModal({ isOpen, onClose, onLoginClick, onSkip }: ConversionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border border-border p-0 overflow-hidden rounded-3xl shadow-2xl">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col"
            >
              <div className="bg-primary/10 p-6 flex flex-col items-center justify-center border-b border-border/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50 pointer-events-none" />
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, duration: 0.6, delay: 0.1 }}
                  className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_30px_rgba(217,119,6,0.3)] relative z-10 mb-4"
                >
                  <Cloud className="w-8 h-8" />
                </motion.div>
                <DialogTitle className="text-2xl font-bold text-center tracking-tight text-foreground relative z-10">
                  Sync to the Cloud
                </DialogTitle>
                <DialogDescription className="text-center font-medium mt-1 relative z-10 text-primary/80">
                  Never lose your habits again.
                </DialogDescription>
              </div>

              <div className="p-6 flex flex-col gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-accent text-muted-foreground mt-0.5 shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      Please log in to sync your data securely across multiple devices.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-accent text-muted-foreground mt-0.5 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      If you skip this process, your data is saved temporarily on this device only. Clearing your browser cache may erase it permanently.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                  <Button 
                    onClick={() => {
                      onClose();
                      onLoginClick();
                    }}
                    className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(217,119,6,0.15)] transition-alltext-md"
                  >
                    Log In / Sign Up
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      if (onSkip) onSkip();
                      else onClose();
                    }}
                    className="w-full h-12 rounded-xl font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
                  >
                    Skip for now
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
