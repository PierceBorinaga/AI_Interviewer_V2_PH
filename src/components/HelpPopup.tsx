"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface HelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpPopup({ isOpen, onClose }: HelpPopupProps) {
  // Close when pressing Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close help"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-[var(--color-dark-serpent)] mb-6">
            About Your Application
          </h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[var(--color-castleton-green)]">
                Application Process
              </h3>
              <p className="text-gray-700">
                Thank you for your interest in joining our team! This application form is the first step in our hiring process.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[var(--color-castleton-green)]">
                What Happens Next?
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Your application will be reviewed by our HR team</li>
                <li>Your CV will be evaluated based on our requirements</li>
                <li>You'll receive a confirmation email with your application details</li>
                <li>Our team will contact you if your profile matches our needs</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[var(--color-castleton-green)]">
                Need Help?
              </h3>
              <p className="text-gray-700">
                If you encounter any issues or have questions, please contact us at 
                <a href="mailto:hr@lifewood.com" className="text-[var(--color-castleton-green)] hover:underline ml-1">
                  hr@lifewood.com
                </a>
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={onClose}
              className="w-full py-3 bg-[var(--color-castleton-green)] hover:bg-[var(--color-dark-serpent)] text-white font-medium rounded-xl transition-colors"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
