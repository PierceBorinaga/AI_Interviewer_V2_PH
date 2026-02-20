"use client";

import { useState } from "react";
import { FileUpload } from "./FileUpload";
import { CustomDropdown } from "./CustomDropdown";
import { Loader2, CheckCircle2, X } from "lucide-react";
import { ALL_POSITIONS, POSITION_TO_CATEGORY, CATEGORIES } from "@/config/positions";

const COUNTRY_CODES = [
    { label: "+1 (US/Canada)", value: "+1" },
    { label: "+44 (UK)", value: "+44" },
    { label: "+63 (Philippines)", value: "+63" },
    { label: "+86 (China)", value: "+86" },
    { label: "+91 (India)", value: "+91" },
    { label: "+81 (Japan)", value: "+81" },
    { label: "+61 (Australia)", value: "+61" },
    { label: "+49 (Germany)", value: "+49" },
    { label: "+33 (France)", value: "+33" },
];

const POSITIONS = [
    ...ALL_POSITIONS,
    "Other",
    "Intern (Applicable to PH Only)"
];

const INTERN_SPECIALTIES = [
    "BSIT",
    "BS Computer Engineering",
    "BS Finance/Accounting",
    "BS Psychology",
    "BSBA Marketing",
    "BSBA General Management"
];

const SCHOOLS = [
    "Asian College of Technology",
    "Bantayan Senior High School",
    "Cebu Institute of Technology - University",
    "Cebu Technological University - Argao Campus",
    "Cebu Technological University - Barili Campus",
    "Cebu Technological University - Consolacion Campus",
    "Cebu Technological University - Daanbantayan Campus",
    "Cebu Technological University - Danao Campus",
    "Cebu Technological University - Main Campus",
    "Cebu Technological University - Tabogon Extension",
    "Cebu Technological University - Tuburan Campus",
    "Southwestern University PHINMA",
    "St. Paul University - Surigao",
    "University of Cebu - Banilad Campus",
    "University of Cebu - Lapu-Lapu and Mandaue",
    "University of Cebu - Main Campus",
    "University of the Visayas - Main Campus",
    "University of the Visayas",
    "University of Lapu-Lapu and Mandaue"
];

const GENDERS = ["Male", "Female", "Prefer not to say"];

const COUNTRIES = [
    "Philippines", "United States", "United Kingdom", "Canada", "Australia",
    "China", "India", "Japan", "Germany", "France", "Singapore",
    "Malaysia", "Indonesia", "Thailand", "Vietnam", "South Korea", "Other"
];

export function ApplicationForm() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        countryCode: "+63",
        gender: "",
        country: "",
        age: "",
        currentAddress: "",
        positionApplied: "",
        selectedPositions: [] as string[],
        otherPosition: "",
        showInternSubCategory: false,
        internProgram: "",
        internSchool: "",
        school: "",
    });
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const handlePositionSelect = (position: string) => {
        if (position === "Intern (Applicable to PH Only)") {
            setFormData({
                ...formData,
                showInternSubCategory: true
            });
            return;
        }

        if (position && !formData.selectedPositions.includes(position)) {
            const newSelectedPositions = [...formData.selectedPositions, position];
            const finalPositions = newSelectedPositions.join(";");
            setFormData({
                ...formData,
                selectedPositions: newSelectedPositions,
                positionApplied: finalPositions
            });
        }
    };

    const handleInternSubCategorySelect = (subCategory: string) => {
        const internPosition = `Intern (Applicable to PH Only) ${subCategory}`;
        if (!formData.selectedPositions.includes(internPosition)) {
            const newSelectedPositions = [...formData.selectedPositions, internPosition];
            const finalPositions = newSelectedPositions.join(";");
            setFormData({
                ...formData,
                selectedPositions: newSelectedPositions,
                positionApplied: finalPositions,
                showInternSubCategory: false,
                internProgram: "",
                internSchool: ""
            });
        } else {
            setFormData({
                ...formData,
                showInternSubCategory: false,
                internProgram: "",
                internSchool: ""
            });
        }
    };


    const removePosition = (positionToRemove: string) => {
        const newSelectedPositions = formData.selectedPositions.filter(pos => pos !== positionToRemove);
        const hasIntern = newSelectedPositions.some(pos => pos.includes("Intern"));
        setFormData({
            ...formData,
            selectedPositions: newSelectedPositions,
            positionApplied: newSelectedPositions.join(";"),
            school: hasIntern ? formData.school : ""
        });
    };

    const capitalizeFirstLetter = (str: string) => {
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const handleNameChange = (field: 'firstName' | 'lastName', value: string) => {
        setFormData({ ...formData, [field]: capitalizeFirstLetter(value) });
    };

    const handleNumericChange = (field: 'phone' | 'age', value: string) => {
        const numericValue = value.replace(/\D/g, '');
        setFormData({ ...formData, [field]: numericValue });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert("Please upload your CV.");
            return;
        }

        setStatus("submitting");

        const data = new FormData();
        data.append("firstName", formData.firstName);
        data.append("lastName", formData.lastName);
        data.append("email", formData.email);
        data.append("phone", formData.phone);
        data.append("countryCode", formData.countryCode);
        data.append("gender", formData.gender);
        data.append("country", formData.country);
        data.append("age", formData.age);
        data.append("currentAddress", formData.currentAddress);
        data.append("positionApplied", formData.positionApplied);
        data.append("otherPosition", formData.otherPosition);
        data.append("school", formData.school);
        data.append("file", file);

        try {
            const res = await fetch("/api/submit", {
                method: "POST",
                body: data,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Submission failed");
            }

            setStatus("success");
        } catch (error: any) {
            console.error(error);
            setErrorMessage(error.message || "An unexpected error occurred");
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <>
                <style jsx>{`
                    @keyframes bounce {
                        0%, 100% {
                            translate: 0px 16px;
                        }
                        50% {
                            translate: 0px 26px;
                        }
                    }
                    @keyframes bounce2 {
                        0%, 100% {
                            translate: 0px 26px;
                        }
                        50% {
                            translate: 0px 36px;
                        }
                    }
                    @keyframes umbral {
                        0% {
                            stop-color: #d3a5102e;
                        }
                        50% {
                            stop-color: rgba(211, 165, 16, 0.519);
                        }
                        100% {
                            stop-color: #d3a5102e;
                        }
                    }
                    @keyframes partciles {
                        0%, 100% {
                            translate: 0px 16px;
                        }
                        50% {
                            translate: 0px 6px;
                        }
                    }
                    #particles {
                        animation: partciles 4s ease-in-out infinite;
                    }
                    #animatedStop {
                        animation: umbral 4s infinite;
                    }
                    #bounce {
                        animation: bounce 4s ease-in-out infinite;
                        translate: 0px 16px;
                    }
                    #bounce2 {
                        animation: bounce2 4s ease-in-out infinite;
                        translate: 0px 26px;
                        animation-delay: 0.5s;
                    }
                `}</style>

                <div className="w-full max-w-3xl mx-auto p-12 rounded-3xl relative overflow-hidden backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl shadow-white/10 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                    {/* Enhanced decorative elements */}
                    <div className="absolute -top-32 -right-32 w-72 h-72 bg-[var(--color-saffaron)]/15 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse"></div>
                    <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[var(--color-castleton-green)]/10 rounded-full mix-blend-screen filter blur-3xl opacity-30"></div>

                    {/* Enhanced liquid glass effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-3xl rotate-180"></div>

                    <div className="relative z-10 text-center">
                        <div className="inline-flex items-center justify-center w-24 h-24 mb-6">
                            <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="animatedStop" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#d3a5102e" />
                                        <stop offset="50%" stopColor="rgba(211, 165, 16, 0.519)" />
                                        <stop offset="100%" stopColor="#d3a5102e" />
                                    </linearGradient>
                                </defs>

                                {/* Bouncing particles */}
                                <g id="particles">
                                    <circle cx="48" cy="48" r="4" fill="url(#animatedStop)" />
                                    <circle cx="32" cy="32" r="3" fill="url(#animatedStop)" />
                                    <circle cx="64" cy="32" r="3" fill="url(#animatedStop)" />
                                    <circle cx="32" cy="64" r="3" fill="url(#animatedStop)" />
                                    <circle cx="64" cy="64" r="3" fill="url(#animatedStop)" />
                                </g>

                                {/* Bouncing checkmark */}
                                <path id="bounce" d="M30 48 L42 60 L66 36" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                <path id="bounce2" d="M30 48 L42 60 L66 36" stroke="url(#animatedStop)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-4">Application Received!</h2>
                        <div className="space-y-4 text-gray-300 max-w-md mx-auto text-lg">
                            <p>Thank you, {formData.firstName}!</p>
                            <p>We've received your application and will review it shortly.</p>
                            <p className="font-medium">You will receive an email from lifewoodph@gmail.com
                                containing your one-time interview link. Important: Please check your Spam/Junk folder as well, in case the email doesn't appear in your main inbox..</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto p-12 rounded-3xl relative overflow-hidden backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl shadow-white/10">
            {/* Enhanced decorative elements */}
            <div className="absolute -top-32 -right-32 w-72 h-72 bg-[var(--color-saffaron)]/15 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[var(--color-castleton-green)]/10 rounded-full mix-blend-screen filter blur-3xl opacity-30"></div>

            {/* Enhanced liquid glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-3xl rotate-180"></div>

            <div className="relative z-10">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Join Our Team</h1>
                    <p className="text-gray-300 text-lg">Please fill out the form below to apply.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* First Name */}
                    <div className="space-y-3">
                        <label htmlFor="firstName" className="text-sm font-medium text-white mb-2">First Name</label>
                        <input
                            required
                            type="text"
                            id="firstName"
                            placeholder="e.g. Michael"
                            value={formData.firstName}
                            onChange={(e) => handleNameChange('firstName', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/20 focus:border-[var(--color-castleton-green)] focus:ring-4 focus:ring-white/20 outline-none transition-all text-white placeholder-gray-400"
                        />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-3">
                        <label htmlFor="lastName" className="text-sm font-medium text-white mb-2">Last Name</label>
                        <input
                            required
                            type="text"
                            id="lastName"
                            placeholder="e.g. Chen"
                            value={formData.lastName}
                            onChange={(e) => handleNameChange('lastName', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/20 focus:border-[var(--color-castleton-green)] focus:ring-4 focus:ring-white/20 outline-none transition-all text-white placeholder-gray-400"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Gender */}
                        <div className="space-y-3">
                            <label htmlFor="gender" className="text-sm font-medium text-white mb-2">Gender</label>
                            <CustomDropdown
                                required
                                options={GENDERS}
                                value={formData.gender}
                                onChange={(val) => setFormData({ ...formData, gender: val })}
                                placeholder="Select gender"
                            />
                        </div>

                        {/* Age */}
                        <div className="space-y-3">
                            <label htmlFor="age" className="text-sm font-medium text-white mb-2">Age</label>
                            <input
                                required
                                type="text"
                                id="age"
                                placeholder="e.g. 24"
                                value={formData.age}
                                onChange={(e) => handleNumericChange('age', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/20 focus:border-[var(--color-castleton-green)] focus:ring-4 focus:ring-white/20 outline-none transition-all text-white placeholder-gray-400 no-spinner"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="phone" className="text-sm font-medium text-white mb-2">Phone Number</label>
                        <div className="flex gap-2">
                            <CustomDropdown
                                options={COUNTRY_CODES}
                                value={formData.countryCode}
                                onChange={(val) => setFormData({ ...formData, countryCode: val })}
                                className="w-48"
                            />
                            <input
                                required
                                type="tel"
                                id="phone"
                                placeholder="912345678"
                                value={formData.phone}
                                onChange={(e) => handleNumericChange('phone', e.target.value)}
                                className="flex-1 px-4 py-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/20 focus:border-[var(--color-castleton-green)] focus:ring-4 focus:ring-white/20 outline-none transition-all text-white placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-3">
                        <label htmlFor="email" className="text-sm font-medium text-white mb-2">Email Address</label>
                        <input
                            required
                            type="email"
                            id="email"
                            placeholder="michael@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/20 focus:border-[var(--color-castleton-green)] focus:ring-4 focus:ring-white/20 outline-none transition-all text-white placeholder-gray-400"
                        />
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                            Note: Please check your email and continue with the AI pre-screening.
                        </p>

                    </div>

                    <div className="space-y-3">
                        <label htmlFor="positionApplied" className="text-sm font-medium text-white mb-2">Position Applied</label>
                        <CustomDropdown
                            options={POSITIONS}
                            value=""
                            onChange={handlePositionSelect}
                            placeholder="Select position to add"
                            searchable
                        />

                        {/* Selected Positions Display */}
                        {formData.selectedPositions.length > 0 && (
                            <div className="mt-3 space-y-2">
                                <label className="text-sm font-medium text-white">Selected Positions:</label>
                                <div className="flex flex-wrap gap-2 p-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/20 min-h-[60px]">
                                    {formData.selectedPositions.map((position, index) => (
                                        <div key={index} className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 text-white text-sm">
                                            <span>{position}</span>
                                            <button
                                                type="button"
                                                onClick={() => removePosition(position)}
                                                className="text-red-400 hover:text-red-300 text-xs"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {formData.selectedPositions.includes("Other") && (
                            <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label htmlFor="otherPosition" className="text-sm font-medium text-white mb-1">Please specify position</label>
                                <input
                                    required
                                    type="text"
                                    id="otherPosition"
                                    placeholder="e.g. Graphic Designer"
                                    value={formData.otherPosition}
                                    onChange={(e) => setFormData({ ...formData, otherPosition: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/20 focus:border-[var(--color-castleton-green)] focus:ring-4 focus:ring-white/20 outline-none transition-all text-white placeholder-gray-400"
                                />
                            </div>
                        )}

                        {formData.showInternSubCategory && (
                            <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label htmlFor="internSubCategory" className="text-sm font-medium text-white mb-1">Select Program Specialty</label>
                                <CustomDropdown
                                    options={INTERN_SPECIALTIES}
                                    value={formData.internProgram}
                                    onChange={handleInternSubCategorySelect}
                                    placeholder="Select specialty to add"
                                />
                            </div>
                        )}
                    </div>

                    {formData.selectedPositions.some(pos => pos.includes("Intern")) && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-400">
                            <label htmlFor="school" className="text-sm font-medium text-white mb-2">Select Your School</label>
                            <CustomDropdown
                                required
                                searchable
                                options={SCHOOLS}
                                value={formData.school}
                                onChange={(val) => setFormData({ ...formData, school: val })}
                                placeholder="Select school"
                            />
                        </div>
                    )}



                    {/* Country */}
                    <div className="space-y-3">
                        <label htmlFor="country" className="text-sm font-medium text-white mb-2">Country</label>
                        <CustomDropdown
                            required
                            searchable
                            options={COUNTRIES}
                            value={formData.country}
                            onChange={(val) => setFormData({ ...formData, country: val })}
                            placeholder="Select country"
                        />
                    </div>

                    {/* Current Address */}
                    <div className="space-y-3">
                        <label htmlFor="currentAddress" className="text-sm font-medium text-white mb-2">Current Address</label>
                        <input
                            required
                            type="text"
                            id="currentAddress"
                            placeholder="e.g. Quezon City, Metro Manila"
                            value={formData.currentAddress}
                            onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/20 focus:border-[var(--color-castleton-green)] focus:ring-4 focus:ring-white/20 outline-none transition-all text-white placeholder-gray-400"
                        />
                    </div>


                    {/* File Upload */}
                    <div className="space-y-3">
                        <FileUpload
                            selectedFile={file}
                            onFileSelect={setFile}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={status === "submitting"}
                        className="w-full py-4 mt-8 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl shadow-xl shadow-white/10 hover:shadow-white/20 transform active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3"
                    >
                        {status === "submitting" ? (
                            <>
                                <Loader2 className="animate-spin" />
                                Submitting Application...
                            </>
                        ) : (
                            "Submit Application"
                        )}
                    </button>

                    {status === "error" && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                            <p className="text-red-700 text-sm text-center">
                                {errorMessage || "Something went wrong. Please try again."}
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
