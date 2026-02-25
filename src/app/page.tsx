// ORIGINAL PAGE - COMMENTED OUT FOR MAINTENANCE MODE
// Uncomment this section and remove the MaintenancePage import to restore the application form

import { ApplicationForm } from "@/components/ApplicationForm";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto py-12">
        <header className="mb-8 animate-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Welcome to
            </h1>
            <img
              src="/lifewood-logo.png"
              alt="Lifewood Logo"
              className="h-8 w-auto object-contain"
            />
          </div>
          <p className="text-[10px] text-gray-500/80 mt-4 uppercase tracking-[0.3em] font-medium">
            Powered by Lifewood PH
          </p>
          <p className="text-lg text-gray-200 mt-2">
            Join the world’s leading provider of AI-powered data solutions.
          </p>
          <p className="text-sm text-gray-400 mt-2 italic">
            This application is currently in beta. Please be advised that features and functionality may undergo updates during this refinement phase.
          </p>
        </header>

        <ApplicationForm />
      </div>
    </div>
  );
}

// // MAINTENANCE MODE - Remove this section when ready to restore the application form
// import MaintenancePage from "./maintenance/page";

// export default function Home() {
//   return <MaintenancePage />;
// }