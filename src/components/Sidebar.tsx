"use client";

import { FileText, HelpCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HelpPopup } from "./HelpPopup";

export function Sidebar() {
    const [showHelp, setShowHelp] = useState(false);
    const isActive = usePathname() === "/";

    return (
        <>
            <aside className="fixed left-4 top-4 bottom-4 w-20 flex flex-col items-center py-8 gap-8 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl shadow-white/10 z-50">
                {/* Navigation */}
                <nav className="flex flex-col gap-6 w-full px-2">
                    {/* Application Button */}
                    <Link
                        href="/"
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 group relative
                            ${isActive
                                ? "bg-white text-[var(--color-castleton-green)] shadow-soft scale-105"
                                : "text-gray-400 hover:text-gray-600 hover:bg-white/10"
                            }`}
                        title="Application"
                    >
                        <FileText size={24} strokeWidth={isActive ? 2.5 : 2} />
                        {isActive && (
                            <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--color-castleton-green)] rounded-full" />
                        )}
                    </Link>

                    {/* Spacer to push help button to bottom */}
                    <div className="flex-1"></div>

                    {/* Help Button */}
                    <button
                        onClick={() => setShowHelp(true)}
                        className="flex flex-col items-center justify-center p-3 rounded-2xl text-gray-400 hover:text-gray-600 hover:bg-white/10 transition-colors group"
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