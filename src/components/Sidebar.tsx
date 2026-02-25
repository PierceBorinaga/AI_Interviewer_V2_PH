"use client";

import { FileText, HelpCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { HelpPopup } from "./HelpPopup";

export function Sidebar() {
    const [showHelp, setShowHelp] = useState(false);
    const [mounted, setMounted] = useState(false);
    const isActive = usePathname() === "/";

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            <aside className="fixed left-4 top-4 bottom-4 w-20 flex flex-col items-center py-8 gap-8 rounded-3xl glass z-50 transition-all duration-300">
                {/* Navigation */}
                <nav className="flex flex-col gap-6 w-full px-2 h-full">
                    {/* Application Button */}
                    <Link
                        href="/"
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 group relative
                            ${isActive
                                ? "bg-white dark:bg-white/10 text-[var(--color-castleton-green)] dark:text-[var(--color-saffaron)] shadow-soft scale-105"
                                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10"
                            }`}
                        title="Application"
                    >
                        <FileText size={24} strokeWidth={isActive ? 2.5 : 2} />
                        {isActive && (
                            <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--color-castleton-green)] dark:bg-[var(--color-saffaron)] rounded-full" />
                        )}
                    </Link>

                    {/* Spacer */}
                    <div className="flex-1"></div>

                    {/* Help Button */}
                    <button
                        onClick={() => setShowHelp(true)}
                        className="flex flex-col items-center justify-center p-3 rounded-2xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
                        title="Help"
                    >
                        <HelpCircle size={24} />
                    </button>
                </nav>
            </aside>

            <HelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </>
    );
}

//push 111