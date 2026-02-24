import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

import { ThemeProvider } from "@/components/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Application",
  description: "Apply for your dream job",
  icons: {
    icon: "/lifewood.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased min-h-screen transition-colors duration-300`}
      >
        <ThemeProvider>
          <div className="flex min-h-screen relative overflow-x-hidden">
            {/* Removed Liquid glass background overlay */}

            {/* Video Background */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="fixed top-0 left-0 w-full h-full object-cover -z-20 transition-all duration-300 dark:opacity-80 opacity-60"
            >
              <source src="https://www.pexels.com/download/video/10922866/" type="video/mp4" />
            </video>

            {/* Removed Overlay for better readability */}

            <Sidebar />
            <main className="flex-1 ml-28 p-8 transition-all duration-300 relative z-20">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
