"use client";

import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { useState, useRef } from "react";

interface FileUploadProps {
    onFileSelect: (file: File | null) => void;
    selectedFile: File | null;
}

export function FileUpload({ onFileSelect, selectedFile }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === "application/pdf") {
                onFileSelect(file);
            } else {
                alert("Only PDF files are allowed.");
            }
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === "application/pdf") {
                onFileSelect(file);
            } else {
                alert("Only PDF files are allowed.");
            }
        }
    };

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFileSelect(null);
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-white mb-2">
                Upload CV (PDF)
            </label>

            {!selectedFile ? (
                <div
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative h-40 w-full rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
            ${isDragging
                            ? "border-accent-purple bg-purple-50 scale-[1.02]"
                            : "border-gray-300 hover:border-accent-purple hover:bg-gray-50"
                        }`}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleChange}
                        accept=".pdf"
                        className="hidden"
                    />
                    <div className="p-4 rounded-full bg-purple-100 text-accent-purple mb-3">
                        <UploadCloud size={24} />
                    </div>
                    <p className="text-sm text-gray-300 font-medium">
                        Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        PDF only (max. 10MB)
                    </p>
                </div>
            ) : (
                <div className="relative h-20 w-full rounded-2xl bg-white border border-gray-200 flex items-center px-4 shadow-sm animate-in fade-in zoom-in duration-300">
                    <div className="p-2 rounded-lg bg-red-100 text-red-500 mr-4">
                        <FileIcon size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">
                            {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-300">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                    <button
                        onClick={removeFile}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
