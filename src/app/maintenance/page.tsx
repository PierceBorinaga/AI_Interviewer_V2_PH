'use client';

import { useState, useEffect } from 'react';

export default function MaintenancePage() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover -z-10 invert"
      >
        <source src="https://www.pexels.com/download/video/10922866/" type="video/mp4" />
      </video>

      {/* Overlay for better readability */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/20 -z-10"></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <header className="mb-8 text-center animate-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Welcome to
            </h1>
            <img
              src="/lifewood-logo.png"
              alt="Lifewood Logo"
              className="h-8 w-auto object-contain"
            />
          </div>
          <p className="text-lg text-gray-200 mt-2">
            Join the world’s leading provider of AI-powered data solutions.
          </p>
          <p className="text-sm text-gray-400 mt-2 italic">
            This application is currently in beta. Please be advised that features and functionality may undergo updates during this refinement phase.
          </p>
          <p className="text-[10px] text-gray-500/80 mt-4 uppercase tracking-[0.3em] font-medium">
            Powered by Lifewood PH
          </p>
        </header>

        {/* Liquid Glass Maintenance Card */}
        <div className="w-full max-w-3xl mx-auto p-12 rounded-3xl relative overflow-hidden backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl shadow-white/10 animate-in slide-in-from-bottom-6 duration-700">
          {/* Enhanced decorative elements */}
          <div className="absolute -top-32 -right-32 w-72 h-72 bg-[var(--color-saffaron)]/15 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[var(--color-castleton-green)]/10 rounded-full mix-blend-screen filter blur-3xl opacity-30"></div>

          {/* Enhanced liquid glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-3xl rotate-180"></div>

          <div className="relative z-10 text-center">
            {/* Animated Icon */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                {/* Gear Icon with Animation */}
                <svg
                  className="w-20 h-20 text-[var(--color-castleton-green)] animate-spin"
                  style={{ animationDuration: '8s' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {/* Secondary Gear */}
                <svg
                  className="absolute -bottom-1 -right-1 w-10 h-10 text-[var(--color-saffaron)] animate-spin"
                  style={{ animationDuration: '4s', animationDirection: 'reverse' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-4xl font-bold text-white mb-4">
              Under Maintenance
            </h2>

            {/* Subtitle */}
            <p className="text-lg text-gray-300 mb-8">
              We&apos;re working hard to improve your experience{dots}
            </p>

            {/* Progress Bar Animation */}
            <div className="w-full h-2 rounded-full overflow-hidden mb-8 backdrop-blur-md bg-white/5 border border-white/20">
              <div
                className="h-full bg-gradient-to-r from-[var(--color-castleton-green)] via-[var(--color-saffaron)] to-[var(--color-earth-yellow)] rounded-full"
                style={{
                  animation: 'progressPulse 2s ease-in-out infinite',
                }}
              />
            </div>

            {/* Message Box - Liquid Glass Style */}
            <div className="p-5 rounded-xl backdrop-blur-md bg-white/5 border border-white/20 mb-8">
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Our team is performing scheduled maintenance to bring you new features and improvements.
                We apologize for any inconvenience and appreciate your patience.
              </p>
            </div>

            {/* Estimated Time */}
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm">We&apos;ll be back shortly</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Keyframe Animation */}
      <style jsx>{`
        @keyframes progressPulse {
          0%, 100% {
            width: 40%;
            opacity: 0.8;
          }
          50% {
            width: 80%;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// Push heheheheheheheh