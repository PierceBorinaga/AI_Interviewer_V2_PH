require('dotenv').config({ path: '.env.local' });
const { analyzeTranscript } = require('./src/lib/ai');
const { getSheetHeaders, updateRowByEmail } = require('./src/lib/google');

async function testComplete() {
    console.log("Starting test complete simulation...");
    const email = "test@example.com"; // Change to a valid email in your sheet if you have one specifically testing
    const category = "Image & Video Data Collection / Media"; // Using the first category from your CSV
    const sheetName = category;

    try {
        // 1. Get Headers
        const headers = await getSheetHeaders(sheetName);
        console.log("Raw Headers fetched:", headers.length);

        // Filter out non-question metadata columns
        const EXCLUDED_HEADERS = [
            "first name", "last name", "email", "cv link", "cv score", "cv summary",
            "interview summary", "interview_status", "token_status", "gender",
            "country", "age", "current address", "phone number", "position applied",
            "timestamp", "email sent time stamp", "interview verdict", "unique links", "schools"
        ].map(h => h.trim().toLowerCase());

        const questions = headers.filter(h => {
            if (!h) return false;
            const normalized = h.toString().trim().toLowerCase();
            return !EXCLUDED_HEADERS.includes(normalized);
        });

        console.log("\nFiltered Questions for AI:");
        questions.forEach((q, i) => console.log(`  ${i + 1}. ${q}`));

        // 2. Mock Transcript
        const mockTranscript = [
            { role: "agent", text: "Welcome to the interview. Can you describe your experience capturing or creating high-quality images or videos?" },
            { role: "user", text: "I have 5 years of experience using DSLR cameras and Adobe Premiere Pro for cinematic videography." },
            { role: "agent", text: "Great. How do you ensure proper lighting, framing, and clarity in your content?" },
            { role: "user", text: "I always use a three-point lighting setup and strictly follow the rule of thirds." }
        ];

        // 3. Analyze Transcript
        console.log("\nSending to AI for analysis...");
        const analysisResult = await analyzeTranscript(mockTranscript, questions);
        const { answers, summary, verdict } = analysisResult;
        console.log("\nAI Extracted Answers:", JSON.stringify(answers, null, 2));
        console.log("\nAI Summary:", summary);
        console.log("AI Verdict:", verdict);

        // 4. Update Spreadsheet preparation (simulating the matching logic)
        console.log(`\nSimulating spreadsheet update for ${sheetName}...`);
        const updateData = {
            ...answers,
            "Interview Summary": summary,
            "Interview_Status": "Completed",
            "Interview Verdict": verdict
        };

        const normalizedHeaders = headers.map(h => (h || "").toString().trim().toLowerCase());

        console.log("\nColumn Matching Results:");
        for (const [header, value] of Object.entries(updateData)) {
            if (!value) continue;

            const targetHeaderNormalized = header.trim().toLowerCase();
            const colIndex = normalizedHeaders.indexOf(targetHeaderNormalized);

            if (colIndex !== -1) {
                // Approximate indexToColumnLetter logic for visualization
                let letter = '';
                let tempIndex = colIndex;
                while (tempIndex >= 0) {
                    letter = String.fromCharCode((tempIndex % 26) + 65) + letter;
                    tempIndex = Math.floor(tempIndex / 26) - 1;
                }
                console.log(`✅ MATCHED: "${header}" -> Column ${letter} (Index ${colIndex})`);
            } else {
                console.log(`❌ FAILED:  "${header}" (Normalized: "${targetHeaderNormalized}") NOT FOUND in sheet headers.`);
            }
        }

    } catch (e) {
        console.error("Test failed:", e);
    }
}

testComplete();
