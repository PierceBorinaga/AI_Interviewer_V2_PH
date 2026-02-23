import { verifyToken } from "@/lib/google";
import Link from "next/link";
import { InterviewClient } from "@/components/InterviewClient";

export default async function InterviewPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string; email?: string; category?: string; firstName?: string }>;
}) {
    const params = await searchParams;
    const token = params.token;
    const email = params.email;
    const category = params.category;
    const firstName = params.firstName;

    // Use direct parameters if token is missing (simplified flow)
    if (email && category) {
        const { getInterviewStatusByEmail } = await import("@/lib/google") as { getInterviewStatusByEmail: (email: string, category: string) => Promise<string | null> };
        const status = await getInterviewStatusByEmail(email as string, category as string);

        if (status === "Completed") {
            return (
                <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center">
                        <h1 className="text-2xl font-bold text-white mb-4">Interview Already Completed</h1>
                        <p className="text-gray-400 mb-6">Our records show that you have already completed the interview for this position.</p>
                        <Link href="/" className="inline-block px-6 py-3 bg-[#004d40] text-white rounded-xl font-medium hover:bg-[#00695c] transition-colors">
                            Return Home
                        </Link>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen transition-colors duration-500">
                <main className="max-w-5xl mx-auto px-6 py-12 md:py-20 min-h-screen flex flex-col">
                    <div className="flex-1 flex flex-col justify-center">
                        <InterviewClient
                            token={token || email}
                            category={category as string}
                            firstName={firstName as string}
                        />
                    </div>
                </main>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Invalid Access</h1>
                    <p className="text-gray-400 mb-6">No interview token provided. Please check the link in your email.</p>
                    <Link href="/" className="inline-block px-6 py-3 bg-[#004d40] text-white rounded-xl font-medium hover:bg-[#00695c] transition-colors">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    const tokenDetails = await verifyToken(token);

    if (!tokenDetails) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Link Expired</h1>
                    <p className="text-gray-400 mb-6">This interview link is invalid or has expired. Please contact recruitment if you believe this is an error.</p>
                    <Link href="/" className="inline-block px-6 py-3 bg-[#004d40] text-white rounded-xl font-medium hover:bg-[#00695c] transition-colors">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    if (tokenDetails.status !== "Pending") {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Interview Already Completed</h1>
                    <p className="text-gray-400 mb-6">Our records show that this interview token (ending in ...${token.slice(-4)}) has already been used or deactivated.</p>
                    <Link href="/" className="inline-block px-6 py-3 bg-[#004d40] text-white rounded-xl font-medium hover:bg-[#00695c] transition-colors">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen transition-colors duration-500">
            {/* Ambient Background Elements - Subtler */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-transparent">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[var(--color-castleton-green)]/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-[var(--color-castleton-green)]/10 blur-[100px] rounded-full"></div>
            </div>

            <main className="max-w-5xl mx-auto px-6 py-12 md:py-20 min-h-screen flex flex-col">
                <div className="flex-1 flex flex-col justify-center">
                    <InterviewClient token={token} category={tokenDetails.category} />
                </div>

                <footer className="mt-12 py-8 border-t border-[var(--card-border)] text-gray-400 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>© 2026 Lifewood PH Recruitment • Elevating Global Talent</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-[var(--color-castleton-green)] transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-[var(--color-castleton-green)] transition-colors">Terms of Service</a>
                    </div>
                </footer>
            </main>
        </div>
    );
}
