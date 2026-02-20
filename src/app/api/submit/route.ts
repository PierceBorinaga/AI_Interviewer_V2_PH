import { NextRequest, NextResponse } from "next/server";
import { uploadToDrive, appendToSheet, checkEmailExists } from "@/lib/google";
import { extractTextFromPDF } from "@/lib/pdf";
import { triggerWebhook } from "@/lib/n8n";
import { POSITION_TO_CATEGORY } from "@/config/positions";
import { evaluateCV } from "@/lib/ai";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const countryCode = formData.get("countryCode") as string;
        const gender = formData.get("gender") as string;
        const country = formData.get("country") as string;
        const age = formData.get("age") as string;
        const currentAddress = formData.get("currentAddress") as string;
        const positionApplied = formData.get("positionApplied") as string;
        const otherPosition = formData.get("otherPosition") as string;
        const school = formData.get("school") as string;
        const language = formData.get("language") as string;
        const file = formData.get("file") as File;

        if (!firstName || !lastName || !email || !phone || !gender || !country || !age || !currentAddress || !positionApplied || !file) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Determine Category and Sheet Name
        const positionList = positionApplied.split(";").map(pos => pos.trim());
        const primaryPosition = positionList[0];
        const categoryName = POSITION_TO_CATEGORY[primaryPosition] || "Sheet1";

        // Check if email already exists
        const emailExists = await checkEmailExists(email, categoryName);
        if (emailExists) {
            return NextResponse.json({
                error: `This email has already been used to submit an application for ${categoryName}. If you need assistance, please contact lifewoodph@gmail.com`
            }, { status: 409 });
        }

        console.log(`Processing application for: ${firstName} ${lastName}`);

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 1. Upload CV to Google Drive
        // Using a timestamp to avoid name collisions if needed, but Drive allows same names. 
        // Ideally we might want unique names: `CV_${name}_${Date.now()}.pdf`
        const fullName = `${firstName} ${lastName}`;
        const fileName = `CV_${fullName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        const webViewLink = await uploadToDrive(buffer, fileName, file.type);
        console.log("Uploaded to Drive:", webViewLink);

        // 2. Append to Google Sheets (A:First Name, B:Last Name, C:Email, D:CV Link, T:Phone, U:Position, P:Gender, Q:Country, R:Age, S:Current Address, Z:School)
        // Format positions: split by semicolon and replace "Other" with otherPosition if present
        let finalPosition = positionList.map(pos => pos === "Other" && otherPosition ? otherPosition : pos).join(";");

        // Pre-screening Answers (Columns I-M, indices 8-12) will be empty
        const qAnswers = ["", "", "", "", ""];

        // 3. Extract Text from PDF
        const cvText = await extractTextFromPDF(buffer);
        console.log("Extracted PDF Text length:", cvText.length);

        // 4. AI Evaluation: Score and Summary
        console.log("Starting AI evaluation...");
        const aiEvaluation = await evaluateCV(cvText, categoryName);
        const { score, summary } = aiEvaluation;
        console.log(`AI Evaluation complete. Score: ${score}`);

        const fullPhone = `${countryCode}${phone}`;
        const timestamp = new Date().toLocaleString();

        const rowValues = [
            firstName,          // A (0): First Name
            lastName,           // B (1): Last Name
            email,              // C (2): Email
            webViewLink || "Upload Failed", // D (3): CV Link
            score.toString(),   // E (4): CV Score
            summary,            // F (5): CV Summary
            "",                 // G (6): Interview Summary
            "",                 // H (7): Interview_Status
            ...qAnswers,        // I-M (8-12): Pre-screening Answers (Empty)
            "",                 // N (13): Token_Status
            gender,             // O (14): Gender
            country,            // P (15): Country
            age,                // Q (16): Age
            currentAddress,     // R (17): Current Address
            fullPhone,          // S (18): Phone Number
            finalPosition,      // T (19): Position Applied
            timestamp,          // U (20): Timestamp
            "",                 // V (21): Email Sent Time Stamp
            "",                 // W (22): Interview Verdict
            "",                 // X (23): Unique Links
            school || "",       // Y (24): Schools
        ];

        await appendToSheet(rowValues, categoryName);

        // 5. Trigger n8n Webhook
        const webhookPayload = {
            name: fullName,
            email,
            language,
            school,
            cv_url: webViewLink,
            cv_text: cvText,
            cv_score: score,
            cv_summary: summary,
            submittedAt: new Date().toISOString(),
        };

        await triggerWebhook(webhookPayload);
        console.log("Webhook triggered");

        return NextResponse.json({ success: true, message: "Application processed successfully" });

    } catch (error: any) {
        console.error("Submission Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
