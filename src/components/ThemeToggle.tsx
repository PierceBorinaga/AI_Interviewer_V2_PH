"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeContext";

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, toggleTheme } = useTheme();

    // Prevent hydration mismatch by only rendering after mount
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Render a placeholder of the exact same dimensions to avoid layout shift
        return <div className="w-12 h-12" />;
    }

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-12 h-12 rounded-full glass bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all shadow-md animate-in zoom-in group"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
            {theme === "light" ? (
                <Moon size={22} className="group-hover:rotate-12 transition-transform" />
            ) : (
                <Sun size={22} className="text-[var(--color-saffaron)] group-hover:rotate-90 transition-transform duration-500" />
            )}
        </button>
    );
}
