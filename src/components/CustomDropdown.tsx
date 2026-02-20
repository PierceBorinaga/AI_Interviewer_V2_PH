"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

interface Option {
    label: string;
    value: string;
}

interface CustomDropdownProps {
    options: (string | Option)[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchable?: boolean;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

export function CustomDropdown({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    searchable = false,
    disabled = false,
    required = false,
    className = ""
}: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const normalizedOptions: Option[] = options.map(opt => 
        typeof opt === "string" ? { label: opt, value: opt } : opt
    );

    const filteredOptions = normalizedOptions.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = normalizedOptions.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            setSearchTerm("");
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/20 
                    flex items-center justify-between cursor-pointer transition-all
                    ${isOpen ? 'border-[var(--color-castleton-green)] ring-4 ring-white/20' : 'hover:bg-white/10'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <span className={`truncate ${!selectedOption ? 'text-gray-400' : 'text-white'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 rounded-xl backdrop-blur-xl bg-black/80 border border-white/20 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {searchable && (
                        <div className="p-2 border-b border-white/10">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm outline-none focus:border-[var(--color-castleton-green)]"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                    )}

                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`
                                        px-4 py-3 flex items-center justify-between cursor-pointer transition-colors
                                        ${value === option.value ? 'bg-[var(--color-castleton-green)]/30 text-white' : 'text-gray-300 hover:bg-white/10'}
                                    `}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {value === option.value && <Check className="w-4 h-4 text-[var(--color-saffaron)]" />}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                No results found
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {required && !value && (
                <input
                    type="text"
                    required
                    value=""
                    onChange={() => {}}
                    className="absolute opacity-0 pointer-events-none h-0 w-0"
                    tabIndex={-1}
                />
            )}
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}
