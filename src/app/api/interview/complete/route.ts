import { NextResponse } from "next/server";
import { verifyToken, getSheetHeaders, updateRowByEmail, updateTokenStatus } from "@/lib/google";
import { analyzeTranscript } from "@/lib/ai";

export async function POST(req: Request) {
    try {
        const { token, category: clientCategory, transcript, conversationId } = await req.json();

        console.log("=== INTERVIEW COMPLETION DEBUG ===");
        console.log("Token:", token);
        console.log("Conversation ID:", conversationId);
        console.log("Transcript Messages:", transcript?.length || 0);

        if (transcript?.length > 0) {
            console.log("Sample of last message:", transcript[transcript.length - 1]);
        }

        if (!token || !transcript) {
            return NextResponse.json({ error: "Missing token or transcript" }, { status: 400 });
        }

        // 1. Verify Token
        let email = "";
        let category = "";

        const tokenDetails = await verifyToken(token);
        if (tokenDetails) {
            email = tokenDetails.email;
            category = tokenDetails.category;

            if (tokenDetails.status === "completed") {
                return NextResponse.json({ message: "Interview already processed" });
            }
        } else {
            // Fallback for direct redirection (no tokenization)
            if (token.includes("@")) {
                email = token;
                category = clientCategory || "Other";
                console.log("Using email fallback for identification:", email, "with category:", category);
            } else {
                return NextResponse.json({ error: "Invalid token or identification" }, { status: 404 });
            }
        }

        // 2. Determine Sheet Name
        // We use the category directly as the sheet name, consistent with api/submit/route.ts
        const sheetName = category || "Sheet1";

        // 3. Get Headers
        const headers = await getSheetHeaders(sheetName);

        // Filter out non-question headers if necessary (e.g., skip Name, Email, Timestamp)
        // We'll pass the full header list to the AI and let it map what's relevant.
        // Filter out non-question metadata columns to ensure the AI only focuses on interview questions.
        const EXCLUDED_HEADERS = [
            "first name", "last name", "email", "cv link", "cv score", "cv summary",
            "interview summary", "interview_status", "token_status", "gender",
            "country", "age", "current address", "phone number", "position applied",
            "timestamp", "email sent time stamp", "interview verdict", "unique links", "schools"
        ].map(h => h.trim().toLowerCase());

        // We map the raw headers to clean questions for the AI.
        // Google Sheets has them as `Answer for "Question here"`
        const questionsMapping: { header: string, cleanQuestion: string }[] = [];

        headers.forEach(h => {
            if (!h) return;
            const normalized = h.toString().trim().toLowerCase();
            if (!EXCLUDED_HEADERS.includes(normalized)) {
                // Extract the actual question text if it's formatted as 'Answer for "..."'
                let cleanQ = h.toString().trim();
                const match = cleanQ.match(/^Answer for ["'](.*)["']$/i);
                if (match && match[1]) {
                    cleanQ = match[1];
                }
                questionsMapping.push({ header: h.toString(), cleanQuestion: cleanQ });
            }
        });

        const questions = questionsMapping.map(qm => qm.cleanQuestion);
        console.log("Filtered Questions for AI:", questions);

        // 4. Analyze Transcript
        const analysisResult = await analyzeTranscript(transcript, questions, category);
        const { answers, summary, verdict } = analysisResult;
        console.log("AI Extracted Data:", JSON.stringify(answers, null, 2));

        // 5. Update Spreadsheet
        console.log(`Attempting to update sheet: ${sheetName} for email: ${email}`);

        // Merge extracted answers with metadata updates
        // We need to map the AI's keys back to the exact sheet headers
        const updateData: Record<string, string> = {
            "Interview Summary": summary,
            "Interview_Status": "Completed",
            "Interview Verdict": verdict
        };

        // Map AI answers to proper Google Sheet headers
        for (const [aiKey, answer] of Object.entries(answers)) {
            // Find which raw header this AI key corresponds to
            const mapping = questionsMapping.find(qm => qm.cleanQuestion === aiKey);
            if (mapping) {
                updateData[mapping.header] = answer as string;
            } else {
                // Fallback: try to find a header that contains the AI key (loose matching)
                const looseMatch = questionsMapping.find(qm => qm.header.toLowerCase().includes(aiKey.toLowerCase()));
                if (looseMatch) {
                    updateData[looseMatch.header] = answer as string;
                } else {
                    console.warn(`Could not map AI answer key "${aiKey}" back to a sheet header.`);
                }
            }
        }

        await updateRowByEmail(email!, updateData, sheetName);

        // 6. Update Token Status
        await updateTokenStatus(token, "completed");

        return NextResponse.json({
            success: true,
            message: "Interview summarized and synced successfully",
            analyzedFields: Object.keys(answers).length
        });

    } catch (error: unknown) {
        console.error("Interview Completion Error:", error);
        return NextResponse.json({ error: "Failed to process interview results" }, { status: 500 });
    }
}
