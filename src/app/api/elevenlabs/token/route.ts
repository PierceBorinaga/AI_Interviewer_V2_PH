import { NextResponse } from "next/server";
import { CATEGORIES } from "@/config/positions";

export async function POST(req: Request) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const defaultAgentId = process.env.ELEVENLABS_AGENT_ID;

    if (!apiKey) {
        return NextResponse.json(
            { error: "ElevenLabs API key missing" },
            { status: 500 }
        );
    }

    try {
        const { category: categoryName } = await req.json();

        // Find the category config to get the agentKey
        const categoryConfig = CATEGORIES[categoryName];
        let agentId = defaultAgentId;

        if (categoryConfig?.agentKey) {
            const envKey = `ELEVENLABS_AGENT_ID_${categoryConfig.agentKey}`;
            const specificAgentId = process.env[envKey];

            if (specificAgentId) {
                console.log(`Using specific agent ID for ${categoryName}: ${specificAgentId} (from ${envKey})`);
                agentId = specificAgentId;
            } else {
                console.log(`No specific agent ID found for ${categoryName} (looked for ${envKey}), falling back to default.`);
            }
        }

        if (!agentId) {
            return NextResponse.json(
                { error: "ElevenLabs Agent ID missing for this category" },
                { status: 500 }
            );
        }

        const response = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
            {
                method: "GET",
                headers: {
                    "xi-api-key": apiKey,
                },
            }
        );

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json(
                { error: "Failed to fetch token", details: error },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("ElevenLabs Token Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
