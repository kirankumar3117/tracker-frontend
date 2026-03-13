"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
        const baseUrl = apiUrl.replace('/api/v1', '');
        await fetch(baseUrl);
      } catch (error) {
        console.error("Failed to wake up server:", error);
      }
    };

    wakeUpServer();
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
