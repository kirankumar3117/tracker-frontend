"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUOTES = [
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
    { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
    { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
    { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
    { text: "You don't have to be extreme, just consistent.", author: "Unknown" },
];

function RunningMan() {
    return (
        <motion.div
            animate={{ x: [0, 4, 0, -4, 0], y: [0, -6, 0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        >
            <svg
                width="64"
                height="64"
                viewBox="0 0 512 512"
                className="text-primary"
                fill="currentColor"
            >
                {/* Running person silhouette */}
                <circle cx="320" cy="64" r="48" />
                <path d="M368 160H256l-48 64 80 48-48 112h64l32-80 48 16v-80l-48-16 32-64z" />
                <path d="M208 224l-80 48v80h48v-48l48-32" />
                <path d="M288 384l-32 96h48l32-80" />
                <path d="M176 352l-48 128h48l40-96" />
            </svg>
        </motion.div>
    );
}

export function DashboardLoadingOverlay() {
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const quote = QUOTES[quoteIndex];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md bg-background/40 min-h-screen w-full"
        >
            {/* Pulsing glow ring */}
            <motion.div
                className="absolute w-24 h-24 rounded-full bg-primary/10"
                animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Running man icon */}
            <div className="relative z-10 mb-5">
                <RunningMan />
            </div>

            {/* Rotating quote */}
            <div className="relative w-full max-w-md min-h-[72px] flex items-center justify-center px-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={quoteIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="text-center"
                    >
                        <p className="text-sm font-medium text-foreground/80 leading-relaxed italic">
                            &ldquo;{quote.text}&rdquo;
                        </p>
                        <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                            — {quote.author}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Elapsed timer */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mt-4">
                <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                />
                <span>Loading your data… {elapsed}s</span>
            </div>
        </motion.div>
    );
}
