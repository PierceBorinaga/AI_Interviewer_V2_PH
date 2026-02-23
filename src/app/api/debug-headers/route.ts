import { NextResponse } from "next/server";
import { getSheetHeaders } from "@/lib/google";
import { CATEGORIES } from "@/config/positions";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        // Default to the first category if none provided
        const category = searchParams.get('category') || Object.keys(CATEGORIES)[0];

        console.log(`Testing headers for category: ${category}`);
        const headers = await getSheetHeaders(category);

        return NextResponse.json({
            category,
            headerCount: headers.length,
            headers: headers
        });

    } catch (error: any) {
        console.error("Debug Route Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
