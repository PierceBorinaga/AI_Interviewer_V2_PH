export interface CVEvaluation {
    score: number;
    summary: string;
}

const CATEGORY_CRITERIA: Record<string, string> = {
    "Image & Video Data Collection / Media": "Experience with high-quality media content creation, technical knowledge of lighting/framing, and ability to meet quality guidelines.",
    "Voice / Audio Data Collection": "Experience with voice/audio recording, clarity of output, and familiarity with recording equipment/software.",
    "Text / Data Collection & Curation": "Attention to detail, experience with large-scale data annotation, and ability to verify data accuracy across sources.",
    "Genealogy / Specialized Data Projects": "Deep research skills, experience with historical records, and meticulous data organization capabilities.",
    "Internships (Philippines Only)": "Academic relevance, learning agility, soft skills, and potential for growth within the AI/Data sector.",
    "Administrative / Support Roles": "Proficiency in office tools (Google Workspace, HRIS), organizational efficiency, and process improvement experience.",
    "Marketing & Research": "Content marketing strategies, social media analytics, and research methodology experience.",
};

export async function evaluateCV(cvText: string, category: string): Promise<CVEvaluation> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        console.warn("OPENROUTER_API_KEY is not set. Skipping AI evaluation.");
        return { score: 0, summary: "AI Evaluation skipped (API Key missing)" };
    }

    const criteria = CATEGORY_CRITERIA[category] || "General professional experience and skills.";

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://lifewood.com", // Optional, for OpenRouter rankings
                "X-Title": "Lifewood AI Interviewer", // Optional
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-001",
                messages: [
                    {
                        role: "system",
                        content: `You are an expert technical recruiter at Lifewood PH. Your task is to evaluate a candidate's CV based on a specific job category. 
                        
                        Category: ${category}
                        Evaluation Criteria: ${criteria}
                        
                        You must provide:
                        1. A numerical score from 0-100 based on how well the CV text matches the criteria and the role.
                        2. A concise 2-3 sentence summary of the candidate's core strengths relevant to the role.
                        
                        Return ONLY valid JSON in this format: {"score": number, "summary": "string"}`
                    },
                    {
                        role: "user",
                        content: `CV Text to evaluate:\n\n${cvText.substring(0, 10000)}` // Safeguard against extremely long texts
                    }
                ],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenRouter API error: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        return JSON.parse(content) as CVEvaluation;

    } catch (error) {
        console.error("AI Evaluation Error:", error);
        return { score: 0, summary: "AI Evaluation failed to process." };
    }
}
