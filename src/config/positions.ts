export interface Category {
    name: string;
    questions: string[];
}

export const CATEGORIES: Record<string, Category> = {
    "Image & Video Data Collection / Media": {
        name: "Image & Video Data Collection / Media",
        questions: [
            "Can you describe your experience capturing or creating high-quality images or videos?",
            "How do you ensure proper lighting, framing, and clarity in your content?",
            "How do you follow guidelines or instructions when producing media content?",
            "Can you share a time when you had to meet a tight deadline while maintaining quality?",
            "How do you handle feedback or revisions during content creation?"
        ]
    },
    "Voice / Audio Data Collection": {
        name: "Voice / Audio Data Collection",
        questions: [
            "Can you describe any experience you have with voice or audio recording?",
            "How do you ensure clarity and consistency in your recordings?",
            "How do you follow a script or instructions during a voice session?",
            "Can you describe a time when you had to complete a session under strict quality requirements?",
            "How do you troubleshoot technical or environmental issues (e.g., noise, device problems) during recording?"
        ]
    },
    "Text / Data Collection & Curation": {
        name: "Text / Data Collection & Curation",
        questions: [
            "Can you describe your experience with text data collection or annotation?",
            "How do you ensure accuracy and consistency when working with large volumes of text?",
            "What strategies do you use to verify data from multiple sources?",
            "How do you follow detailed guidelines or templates when curating data?",
            "How do you manage deadlines while maintaining data quality?"
        ]
    },
    "Genealogy / Specialized Data Projects": {
        name: "Genealogy / Specialized Data Projects",
        questions: [
            "Can you describe your experience with genealogical research or historical data?",
            "How do you ensure the reliability and accuracy of genealogical records?",
            "How do you handle sensitive or private information responsibly?",
            "How do you document and organize genealogical data to maintain consistency?",
            "How do you coordinate tasks or lead a team in a data curation project?"
        ]
    },
    "Internships (Philippines Only)": {
        name: "Internships (Philippines Only)",
        questions: [
            "What motivates you to apply for this internship and this field?",
            "Can you describe relevant coursework, projects, or experiences that prepare you for this role?",
            "How do you handle multiple tasks or deadlines in a learning environment?",
            "How do you approach learning a new skill or tool quickly?",
            "How do you ensure accuracy and attention to detail in your work?"
        ]
    },
    "Administrative / Support Roles": {
        name: "Administrative / Support Roles",
        questions: [
            "Can you describe your experience performing administrative tasks, such as scheduling, record-keeping, or payroll?",
            "How do you ensure accuracy when handling sensitive information?",
            "How do you prioritize tasks when managing multiple responsibilities?",
            "How do you use office tools like Excel, Google Workspace, or HRIS in your work?",
            "Can you share a time you suggested improvements to existing administrative processes?"
        ]
    },
    "Marketing & Research": {
        name: "Marketing & Research",
        questions: [
            "Can you describe your experience with social media campaigns, content creation, or marketing research?",
            "How do you analyze data to inform marketing strategies?",
            "How do you manage deadlines while maintaining quality in content or research?",
            "How do you adapt messaging for different audiences or platforms?",
            "Can you share an example of using analytics or reports to improve results?"
        ]
    }
};

export const POSITION_TO_CATEGORY: Record<string, string> = {
    // Category 1
    "Casual Video Models (Video Data Collection)": "Image & Video Data Collection / Media",
    "Image Data Collector (Capturing Text – Rich Items)": "Image & Video Data Collection / Media",
    "Image Data Collector (Capturing Home Dishes and Menu)": "Image & Video Data Collection / Media",
    "AI Video Creator/Editor": "Image & Video Data Collection / Media",

    // Category 2
    "Moderator & Voice Participants (Voice Data Collection)": "Voice / Audio Data Collection",
    "Voice Recording Participants (Short Sentences Recording)": "Voice / Audio Data Collection",
    "Voice Recording Participants (FaceTime Audio Recording Session)": "Voice / Audio Data Collection",
    "Data Annotator (iPhone User – audio annotation tasks)": "Voice / Audio Data Collection",

    // Category 3
    "Text Data Collector (Gemini User)": "Text / Data Collection & Curation",
    "Data Scraper/Crawler (Int’l Text)": "Text / Data Collection & Curation",
    "Data Curation (Genealogy Project – entry-level)": "Text / Data Collection & Curation",

    // Category 4
    "Data Curation (Genealogy Project – advanced/entry-level distinction)": "Genealogy / Specialized Data Projects",
    "Genealogy Project Team Leader": "Genealogy / Specialized Data Projects",

    // Category 5
    "Intern (Applicable to PH Only) BSIT": "Internships (Philippines Only)",
    "Intern (Applicable to PH Only) BS Computer Engineering": "Internships (Philippines Only)",
    "Intern (Applicable to PH Only) BS Finance/Accounting": "Internships (Philippines Only)",
    "Intern (Applicable to PH Only) BS Psychology": "Internships (Philippines Only)",
    "Intern (Applicable to PH Only) BSBA Marketing": "Internships (Philippines Only)",
    "Intern (Applicable to PH Only) BSBA General Management": "Internships (Philippines Only)",

    // Category 6
    "Admin Accounting": "Administrative / Support Roles",
    "Admin HR": "Administrative / Support Roles",
    "Operation Manager": "Administrative / Support Roles",

    // Category 7
    "Social Media Content Marketing": "Marketing & Research",
    "Marketing Researcher": "Marketing & Research",
    "Marketing & Sales Executive": "Marketing & Research"
};

export const ALL_POSITIONS = Object.keys(POSITION_TO_CATEGORY);
