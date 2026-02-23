"use client";

import React, { useState, useEffect, useRef } from 'react';

interface RobotProps {
    isSpeaking?: boolean;
}

export const Robot = ({ isSpeaking = false }: RobotProps) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const robotRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (robotRef.current) {
                const rect = robotRef.current.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                setMousePos({ x, y });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            ref={robotRef}
            className="relative w-full aspect-square max-w-[200px] flex items-center justify-center cursor-pointer group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Floating Rings - Theme Aware */}
            <div className="absolute inset-0 border border-[var(--color-castleton-green)]/10 dark:border-[var(--color-saffaron)]/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
            <div className="absolute inset-3 border border-[var(--foreground)]/5 rounded-full animate-[spin_7s_linear_infinite_reverse]"></div>
            <div className="absolute inset-6 border border-[var(--color-castleton-green)]/20 dark:border-[var(--color-saffaron)]/20 rounded-full animate-pulse"></div>

            {/* Robot Head Container for 3D Sphere */}
            <div
                className="relative z-10 w-32 h-32 transition-transform duration-300 ease-out pointer-events-none"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: `perspective(1000px) rotateX(${-mousePos.y * 30}deg) rotateY(${mousePos.x * 30}deg) translateZ(10px)`
                }}
            >
                {/* Back Hemisphere / Shadow */}
                <div className="absolute inset-0 bg-gray-300 dark:bg-[#0c0c0c] rounded-full blur-[2px] opacity-60"
                    style={{ transform: 'translateZ(-10px) scale(0.95)' }}></div>

                {/* Main Sphere Body */}
                <div className="absolute inset-0 bg-white dark:bg-[#1a1a1a] border-[4px] border-[var(--color-castleton-green)]/40 dark:border-[var(--color-saffaron)]/50 rounded-full shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.1),_0_15px_35px_-10px_rgba(0,0,0,0.5)] dark:shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.4),_0_15px_35px_-10px_rgba(0,0,0,0.5)] flex items-center justify-center pointer-events-none overflow-hidden"
                    style={{ transform: 'translateZ(10px)', transformStyle: 'preserve-3d' }}>

                    {/* Inner Face Screen (Curve) */}
                    <div className="absolute inset-2 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-[#0f0f0f] dark:to-[#050505] rounded-full flex flex-col items-center justify-center border border-gray-100 dark:border-white/5 overflow-hidden shadow-[inset_0_10px_20px_rgba(0,0,0,0.05)]"
                        style={{ transform: 'translateZ(10px)' }}>

                        {/* Eyes and Mouth Container moving together with strong parallax inside */}
                        <div
                            className="flex flex-col items-center justify-center gap-3 transition-transform duration-200"
                            style={{
                                transform: `translate(${mousePos.x * 24}px, ${mousePos.y * 18}px)`
                            }}
                        >
                            {/* Eyes Container */}
                            <div className="flex justify-center gap-7 w-full px-4 mt-2">
                                {/* Left Eye Container */}
                                <div className="relative flex flex-col items-center justify-end gap-1 overflow-visible drop-shadow-sm h-10 w-6">
                                    {/* Left Eyebrow (Happy Angle) */}
                                    <div className={`w-4 h-1.5 bg-[var(--color-castleton-green)] dark:bg-[var(--color-saffaron)] rounded-full transition-transform duration-300 transform -rotate-12 ${isSpeaking ? '-translate-y-2' : ''}`}></div>
                                    {/* Left Eye */}
                                    {isSpeaking ? (
                                        <div className="w-5 h-3 mb-1 border-t-[4px] border-[var(--color-castleton-green)] dark:border-[var(--color-saffaron)] rounded-t-[50px] transition-all duration-300"></div>
                                    ) : (
                                        <div className="w-5 h-7 bg-[var(--color-castleton-green)] dark:bg-[var(--color-saffaron)] rounded-[50%] transition-all duration-300 origin-bottom animate-[blink_4s_ease-in-out_infinite] relative overflow-hidden">
                                            <div className="absolute top-[3px] right-1 w-2 h-2 bg-white rounded-full opacity-90 blur-[0.5px]"></div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Eye Container */}
                                <div className="relative flex flex-col items-center justify-end gap-1 overflow-visible drop-shadow-sm h-10 w-6">
                                    {/* Right Eyebrow (Happy Angle) */}
                                    <div className={`w-4 h-1.5 bg-[var(--color-castleton-green)] dark:bg-[var(--color-saffaron)] rounded-full transition-transform duration-300 transform rotate-12 ${isSpeaking ? '-translate-y-2' : ''}`}></div>
                                    {/* Right Eye */}
                                    {isSpeaking ? (
                                        <div className="w-5 h-3 mb-1 border-t-[4px] border-[var(--color-castleton-green)] dark:border-[var(--color-saffaron)] rounded-t-[50px] transition-all duration-300"></div>
                                    ) : (
                                        <div className="w-5 h-7 bg-[var(--color-castleton-green)] dark:bg-[var(--color-saffaron)] rounded-[50%] transition-all duration-300 origin-bottom animate-[blink_4s_ease-in-out_infinite_0.1s] relative overflow-hidden">
                                            <div className="absolute top-[3px] right-1 w-2 h-2 bg-white rounded-full opacity-90 blur-[0.5px]"></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Cute Mouth */}
                            <div className="h-6 flex items-center justify-center drop-shadow-sm">
                                {isSpeaking ? (
                                    // Speaking Animation (Opening/Closing Mouth)
                                    <div className="w-8 h-5 bg-[var(--color-castleton-green)] dark:bg-[var(--color-saffaron)] rounded-[50%] animate-[speakMouth_0.4s_ease-in-out_infinite] opacity-90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"></div>
                                ) : (
                                    // Happy Smile SVG
                                    <svg width="28" height="10" viewBox="0 0 32 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--color-castleton-green)] dark:text-[var(--color-saffaron)]">
                                        <path d="M2 2C2 2 8 10 16 10C24 10 30 2 30 2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 transition-all duration-300 group-hover:stroke-[4px]" />
                                        <circle cx="2" cy="2" r="1.5" fill="currentColor" className="opacity-40" />
                                        <circle cx="30" cy="2" r="1.5" fill="currentColor" className="opacity-40" />
                                    </svg>
                                )}
                            </div>
                        </div>

                        {/* Glass Sphere Reflection Highlight - Top arc */}
                        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 dark:from-white/10 to-transparent rounded-full transform -translate-y-4 scale-x-110 blur-[1px]"></div>
                    </div>
                </div>

                {/* Floating Add-ons outside the main sphere boundary */}
                {/* Floating Antenna on Top */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-1.5 hover:w-2 transition-all bg-[var(--color-castleton-green)]/60 dark:bg-[var(--color-saffaron)]/60 h-8 origin-bottom animate-[wiggle_3s_ease-in-out_infinite] rounded-t-full shadow-lg"
                    style={{ transform: 'translateZ(-5px)', transformStyle: 'preserve-3d' }}>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[var(--color-castleton-green)] dark:bg-[var(--color-saffaron)] shadow-[0_0_15px_currentcolor] animate-pulse" style={{ transform: 'translateZ(10px)' }}></div>
                </div>

                {/* Floating Left Holographic Earpiece */}
                <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-4 h-14 bg-gray-200 dark:bg-gray-800 rounded-lg border-2 border-[var(--color-castleton-green)]/40 dark:border-[var(--color-saffaron)]/40 shadow-[0_5px_15px_rgba(0,0,0,0.3)] flex items-center justify-center p-0.5"
                    style={{ transform: 'translateZ(-15px) rotateY(-20deg)', transformStyle: 'preserve-3d' }}>
                    <div className="w-full h-full bg-[var(--color-castleton-green)]/20 dark:bg-[var(--color-saffaron)]/20 rounded-md animate-pulse"></div>
                </div>

                {/* Floating Right Holographic Earpiece */}
                <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-4 h-14 bg-gray-200 dark:bg-gray-800 rounded-lg border-2 border-[var(--color-castleton-green)]/40 dark:border-[var(--color-saffaron)]/40 shadow-[0_5px_15px_rgba(0,0,0,0.3)] flex items-center justify-center p-0.5"
                    style={{ transform: 'translateZ(-15px) rotateY(20deg)', transformStyle: 'preserve-3d' }}>
                    <div className="w-full h-full bg-[var(--color-castleton-green)]/20 dark:bg-[var(--color-saffaron)]/20 rounded-md animate-pulse"></div>
                </div>
            </div>

            {/* Subtler Hover Glow */}
            <div className={`absolute inset-0 bg-[var(--color-castleton-green)]/10 dark:bg-[var(--color-saffaron)]/10 blur-3xl rounded-full transition-opacity duration-500 ${isHovered || isSpeaking ? 'opacity-100' : 'opacity-0'}`}></div>

            {/* Hover Caption - Cleaner */}
            <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[var(--mute-text)] text-[9px] uppercase tracking-[0.3em] font-bold transition-all duration-500 ${isHovered || isSpeaking ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
                {isSpeaking ? "Analyzing..." : "Neural Link"}
            </div>
        </div>
    );
};
