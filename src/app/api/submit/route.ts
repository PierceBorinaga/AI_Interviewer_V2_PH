import { NextRequest, NextResponse } from "next/server";
import { uploadToDrive, appendToSheet, checkEmailExists, appendToTokenSheet } from "@/lib/google";
import { extractTextFromPDF } from "@/lib/pdf";
import { POSITION_TO_CATEGORY } from "@/config/positions";
import { evaluateCV } from "@/lib/ai";
import { sendInterviewEmail } from "@/lib/email";
import crypto from "crypto";

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
        const fullName = `${firstName} ${lastName}`;
        const fileName = `CV_${fullName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        const webViewLink = await uploadToDrive(buffer, fileName, file.type);
        console.log("Uploaded to Drive:", webViewLink);

        // 2. Generate Interview Token (Still kept for backup/internal tracking)
        const token = crypto.randomUUID();
        const origin = req.nextUrl.origin;
        const interviewLink = `${origin}/interview?email=${encodeURIComponent(email)}&category=${encodeURIComponent(categoryName)}&firstName=${encodeURIComponent(firstName)}`;
        console.log("Generated Direct Link:", interviewLink);

        // 3. AI Evaluation: Score and Summary
        const cvText = await extractTextFromPDF(buffer);
        console.log("Starting AI evaluation...");
        const aiEvaluation = await evaluateCV(cvText, categoryName);
        const { score, summary } = aiEvaluation;

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
            "", "", "", "", "", // I-M (8-12): Pre-screening Answers (Empty)
            "Pending",          // N (13): Token_Status
            gender,             // O (14): Gender
            country,            // P (15): Country
            age,                // Q (16): Age
            currentAddress,     // R (17): Current Address
            fullPhone,          // S (18): Phone Number
            positionApplied,    // T (19): Position Applied
            timestamp,          // U (20): Timestamp
            "",                 // V (21): Email Sent Time Stamp
            "",                 // W (22): Interview Verdict
            interviewLink,      // X (23): Unique Links
            school || "",       // Y (24): Schools
        ];

        // 4. Update Sheets
        await appendToSheet(rowValues, categoryName);

        // Log to "Interview Tokens" tab: [Token, Email, Category, Status, Timestamp]
        await appendToTokenSheet([token, email, categoryName, "Pending", timestamp]);

        // 5. Send Personalized Email
        let emailSentAt = "";
        try {
            await sendInterviewEmail(email, firstName, interviewLink);
            emailSentAt = new Date().toLocaleString();
            console.log("Email sent and recorded.");
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
            // We continue as the sheet is already updated, but we might want to flag this
        }

        return NextResponse.json({
            success: true,
            message: "Application processed successfully",
            interviewLink: interviewLink
        });

    } catch (error: unknown) {
        console.error("Submission Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { error: "Internal Server Error", details: errorMessage },
            { status: 500 }
        );
    }
}
