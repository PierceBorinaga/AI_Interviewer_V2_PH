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

export interface TranscriptAnalysis {
    answers: Record<string, string>;
    summary: string;
    verdict: string;
}

function getCategoryRubric(category: string): string {
    const defaultRubric = "General well-rounded evaluation combining communication, clarity, and professionalism.";

    // Normalize category for easier matching
    const cat = category.toLowerCase();

    if (cat.includes("sales") || cat.includes("marketing")) {
        return "Heavy emphasis on persuasion, confidence, clear communication, and goal orientation.";
    }
    if (cat.includes("customer service") || cat.includes("support")) {
        return "Emphasis on empathy, patience, problem-solving under pressure, and clear spoken English.";
    }
    if (cat.includes("technical") || cat.includes("it") || cat.includes("developer")) {
        return "Emphasis on logical problem-solving, technical accuracy, concise explanations, and structured thinking.";
    }
    if (cat.includes("admin") || cat.includes("operations") || cat.includes("accounting") || cat.includes("finance") || cat.includes("hr")) {
        return "Emphasis on attention to detail, organization, process-orientation, and reliability.";
    }
    if (cat.includes("english") || cat.includes("content") || cat.includes("voice") || cat.includes("text") || cat.includes("data collection")) {
        return "Extreme emphasis on grammar, vocabulary, articulation, reading comprehension, and flawless language delivery.";
    }

    return defaultRubric;
}

export async function analyzeTranscript(transcript: { role: string, text: string }[], questions: string[], category: string = "Default"): Promise<TranscriptAnalysis> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        console.warn("OPENROUTER_API_KEY is not set. Cannot analyze transcript.");
        return { answers: {}, summary: "AI Analysis skipped (API Key missing)", verdict: "N/A" };
    }

    const transcriptText = transcript.map(m => `${m.role.toUpperCase()}: ${m.text}`).join("\n");

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-001",
                messages: [
                    {
                        role: "system",
                        content: `You are an AI assistant tasked with analyzing an interview transcript for Lifewood PH. 
                        Given a list of question titles, extract the candidate's answers and also provide an overall evaluation.
                        
                        Rules:
                        1. For each question title provided, extract the core substance of the candidate's answer.
                        2. If a question was not answered, return an empty string for that title.
                        3. Provide an "interview_summary": A concise 2-3 sentence overview of the candidate's communicative style, demeanor, and overall impression (e.g. "Candidate was articulate and professional, showing strong technical knowledge").
                        4. CRITICAL: The "interview_summary" MUST NOT contain the specific answers to the questions. Keep it as a high-level assessment.
                        5. Provide an "interview_verdict": A clear recommendation (e.g., "Highly Recommended", "Potential Fit", "Follow-up Required", or "Not Recommended") based STRICTLY on the following specific criteria for their role:
                           --> Role Category: ${category}
                           --> Grading Rubric: ${getCategoryRubric(category)}
                        
                        Return ONLY valid JSON in this format:
                        {
                            "answers": {"Question Title": "Answer text", ...},
                            "interview_summary": "Overall impression ONLY...",
                            "interview_verdict": "Verdict recommendation"
                        }
                        
                        Question Titles:
                        ${questions.join("\n")}`
                    },
                    {
                        role: "user",
                        content: `Interview Transcript:\n\n${transcriptText}`
                    }
                ],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.statusText}`);
        }

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);

        return {
            answers: content.answers || {},
            summary: content.interview_summary || "No summary generated.",
            verdict: content.interview_verdict || "No verdict provided."
        };

    } catch (error) {
        console.error("Transcript Analysis Error:", error);
        return { answers: {}, summary: "AI Analysis failed to process.", verdict: "Error" };
    }
}
