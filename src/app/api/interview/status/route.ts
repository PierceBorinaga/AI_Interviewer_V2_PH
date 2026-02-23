import { NextResponse } from "next/server";
import { verifyToken, getInterviewStatusByEmail } from "@/lib/google";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const category = searchParams.get("category");

    if (!token) {
        return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // 1. Check Token Sheet Status
    const tokenDetails = await verifyToken(token);
    if (tokenDetails) {
        return NextResponse.json({ status: tokenDetails.status.toLowerCase() });
    }

    // 2. Fallback to Email Check if token looks like an email or wasn't found in Token Sheet
    if (token.includes("@") && category) {
        const status = await getInterviewStatusByEmail(token, category);
        return NextResponse.json({ status: status?.toLowerCase() || "pending" });
    }

    return NextResponse.json({ status: "not_found" });
}
