"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { loginUser, registerUser, googleLogin } from "@/lib/api/auth";
import { GoogleLogin } from '@react-oauth/google';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { name: string; email: string }) => void;
}

import { useAuthStore } from "@/store/useAuthStore";

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill out all required fields.");
      return;
    }

    if (!isLogin) {
      if (!name) {
        setError("Name is required for registration.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      let data;
      if (!isLogin) {
        // Registration Flow
        data = await registerUser({ name, email, password, confirmPassword });
      } else {
        // Login Flow
        data = await loginUser({ email, password });
      }

      // Successfully authenticated
      const user = {
        name: data.user.name,
        email: data.user.email,
      };

      // Handle the token - Save in HTTP Cookie for Server/Middleware capability
      // and keep in localStorage for immediate client-side API headers
      if (data.token) {
        document.cookie = `tracker-token=${data.token}; path=/; max-age=2592000; SameSite=Lax`;
        localStorage.setItem("tracker-token", data.token);
      }

      login(user);

      onSuccess(user);
      onClose();

      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || "An error occurred during authentication.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;

    setLoading(true);
    setError("");

    try {
      const data = await googleLogin({ token: credentialResponse.credential });

      const user = {
        name: data.user.name,
        email: data.user.email,
      };

      if (data.token) {
        document.cookie = `tracker-token=${data.token}; path=/; max-age=2592000; SameSite=Lax`;
        localStorage.setItem("tracker-token", data.token);
      }

      login(user);
      onSuccess(user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred with Google login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-card border border-border p-6 rounded-3xl shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-center tracking-tight">
            {isLogin ? "Welcome back" : "Create an account"}
          </DialogTitle>
          <DialogDescription className="text-center text-sm font-medium">
            {isLogin
              ? "Enter your credentials to access your dashboard"
              : "Sign up to start tracking your habits today"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 p-2 rounded-md text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
              <div className="relative">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="pl-10 h-11 bg-background border-border rounded-xl focus-visible:ring-primary/30"
                />
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
            <div className="relative">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="pl-10 h-11 bg-background border-border rounded-xl focus-visible:ring-primary/30"
              />
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Password</label>
            <div className="relative">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 h-11 bg-background border-border rounded-xl focus-visible:ring-primary/30"
              />
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Confirm Password</label>
              <div className="relative">
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-11 bg-background border-border rounded-xl focus-visible:ring-primary/30"
                />
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(217,119,6,0.15)] transition-all mt-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? "Sign In" : "Register"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground font-bold tracking-wider">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center w-full min-h-[44px]">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError("Google authentication failed.");
            }}
            theme="filled_black"
            shape="rectangular"
            text="continue_with"
            size="large"
            width="100%"
          />
        </div>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
