"use client";

import { useConversation } from "@elevenlabs/react";
import { useCallback, useState, useRef, useEffect } from "react";
import { Robot } from "@/components/Robot";
import { Loader2, Mic, MicOff } from "lucide-react";

interface InterviewClientProps {
    token: string;
    category: string;
    firstName?: string;
}

export function InterviewClient({ token, category, firstName }: InterviewClientProps) {
    const [isConnecting, setIsConnecting] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'agent', text: string }[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [textInput, setTextInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasStarted, setHasStarted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesRef = useRef<{ role: 'user' | 'agent', text: string }[]>([]);
    const hasProcessed = useRef(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Keep messagesRef in sync with state
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const handleInterviewCompletion = useCallback(async (conversationId: string | undefined) => {
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        try {
            setIsProcessing(true);
            const transcript = messagesRef.current;
            console.log("Processing interview completion:", { conversationId, messagesCount: transcript.length });

            const res = await fetch("/api/interview/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    category,
                    transcript,
                    conversationId: conversationId
                }),
            });

            if (!res.ok) throw new Error("Processing failed");

            console.log("Interview results processed successfully");

            setTimeout(() => {
                window.location.reload();
            }, 3000);
        } catch (error) {
            console.error("Failed to process interview results:", error);
            setIsProcessing(false);
            alert("Interview completed, but there was an error saving the full transcript. Our team will review the logs.");
        }
    }, [token, category]);

    const conversation = useConversation({
        micMuted: isMuted,
        onConnect: () => {
            setIsConnecting(false);
            setError(null);
            console.log("Connected to ElevenLabs");
        },
        onDisconnect: () => {
            console.log("Disconnected from ElevenLabs (AI or System)");
            const conversationId = conversation.getId();
            handleInterviewCompletion(conversationId);
        },
        onError: (err) => {
            setIsConnecting(false);
            setError("Connection error. Please check your internet and microphone.");
            console.error("ElevenLabs Error:", err);
        },
        onMessage: (message: { source: string; message: string }) => {
            if (message.source === 'ai' && message.message) {
                setMessages(prev => [...prev, { role: 'agent', text: message.message }]);
            } else if (message.source === 'user' && message.message) {
                setMessages(prev => [...prev, { role: 'user', text: message.message }]);
            }
        },
    });

    const isConnected = conversation.status === "connected";

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const toggleMute = useCallback(async () => {
        setIsMuted(prev => !prev);
    }, []);

    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!textInput.trim() || !isConnected) return;

        try {
            setMessages(prev => [...prev, { role: 'user', text: textInput }]);
            conversation.sendUserMessage(textInput);
            setTextInput("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    }, [textInput, isConnected, conversation]);

    const startInterview = useCallback(async () => {
        if (!category) return;

        setIsConnecting(true);
        setError(null);
        setHasStarted(true);

        try {
            const checkResponse = await fetch(`/api/interview/status?token=${token}&category=${category}`);
            const statusData = await checkResponse.json();

            if (statusData.status === "completed" || statusData.status === "Completed") {
                setError("This interview has already been completed.");
                setIsConnecting(false);
                return;
            }

            console.log("Requesting microphone access...");
            await navigator.mediaDevices.getUserMedia({ audio: true });

            const response = await fetch("/api/elevenlabs/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get session token");
            }

            // Start the 10-minute timer
            setTimeLeft(600);
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        endInterview();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            const data = await response.json();
            const signedUrl = data.signed_url || data.signedUrl;
            const conversationToken = data.conversation_token || data.token;

            if (signedUrl) {
                await conversation.startSession({
                    signedUrl: signedUrl,
                    dynamicVariables: { first_name: firstName || "Candidate", position: category }
                });
            } else if (conversationToken) {
                await conversation.startSession({
                    conversationToken: conversationToken,
                    dynamicVariables: { first_name: firstName || "Candidate", position: category }
                });
            } else {
                throw new Error("No session token received");
            }
        } catch (err: any) {
            setIsConnecting(false);
            setHasStarted(false);
            setError(err.message || "Failed to start interview. Please ensure you have given microphone permissions.");
            console.error(err);
        }
    }, [token, category, firstName, conversation]);

    const endInterview = useCallback(async () => {
        try {
            if (timerRef.current) clearInterval(timerRef.current);
            const conversationId = conversation.getId();
            await conversation.endSession();
            handleInterviewCompletion(conversationId);
        } catch (error) {
            console.error("Failed to end interview gracefully:", error);
        }
    }, [conversation, handleInterviewCompletion]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 relative">

            {isProcessing && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white p-4">
                    <Loader2 className="h-16 w-16 animate-spin text-[var(--color-saffaron)] mb-6" />
                    <h2 className="text-2xl font-bold mb-2">Processing Interview Results...</h2>
                    <p className="text-lg text-center max-w-md">Please wait while we analyze your responses and save the data.</p>
                </div>
            )}

            <header className="mb-10 text-center md:text-left mt-12 md:mt-0">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4 text-[var(--color-castleton-green)] dark:text-[var(--color-saffaron)] font-semibold tracking-widest uppercase text-xs">
                    <span className="w-6 h-[1px] bg-current opacity-50"></span>
                    AI Interviewer Platform
                    <span className="ml-2 opacity-60 normal-case font-normal text-[10px] tracking-normal italic">
                        powered by Lifewood PH
                    </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-[var(--foreground)]">
                    {firstName ? `Welcome, ${firstName}` : "Welcome Candidate"}
                </h1>
                <p className="text-base md:text-lg text-[var(--mute-text)] max-w-2xl leading-relaxed">
                    {isConnected ? "Live interview in progress." : <>Position: <span className="text-[var(--foreground)] font-semibold">{category}</span></>}
                </p>
            </header>

            {error && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8 mb-10 items-start">
                <div className="md:col-span-1 flex flex-col gap-6">
                    <div className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center shadow-xl">
                        <Robot isSpeaking={conversation.isSpeaking} />
                        {isConnected && (
                            <div className="mt-6 flex flex-col items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-castleton-green)]/10 text-[var(--color-castleton-green)] dark:text-[var(--color-saffaron)] rounded-full text-[10px] font-bold tracking-tighter uppercase border border-[var(--color-castleton-green)]/20">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                                    Live Session
                                </div>
                                <div className="text-3xl font-mono font-black tracking-widest text-[var(--color-castleton-green)] dark:text-[var(--color-saffaron)] drop-shadow-md">
                                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                </div>
                                <button
                                    onClick={toggleMute}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border ${isMuted ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-black/5 dark:bg-white/5 text-[var(--mute-text)] border-current/10'}`}
                                >
                                    {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
                                    {isMuted ? 'Muted' : 'Mute Mic'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    {hasStarted ? (
                        <div className="glass-card p-6 rounded-3xl h-[450px] flex flex-col shadow-2xl relative border-t-4 border-t-[var(--color-castleton-green)] dark:border-t-[var(--color-saffaron)] overflow-hidden">
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-none mb-4">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                        <Loader2 className="animate-spin mb-4" />
                                        <p className="text-xs italic">Connecting...</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => (
                                        <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-[var(--color-castleton-green)] text-white' : 'bg-black/5 dark:bg-white/5 text-[var(--foreground)]'}`}>
                                                <p>{msg.text}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="mt-auto flex gap-2 pt-4 border-t border-current/5">
                                <input
                                    type="text"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder="Type your response..."
                                    className="flex-1 bg-black/5 dark:bg-white/5 border border-current/10 rounded-2xl px-4 py-3 text-sm"
                                />
                                <button type="submit" disabled={!textInput.trim() || !isConnected} className="bg-[var(--color-castleton-green)] text-white px-6 py-3 rounded-2xl font-bold text-sm">Send</button>
                            </form>
                        </div>
                    ) : (
                        <div className="glass-card p-10 rounded-3xl flex flex-col h-full justify-between min-h-[400px]">
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-[var(--foreground)]">Interview Guidelines</h3>
                                <p className="text-[var(--mute-text)] leading-relaxed">
                                    Answer questions clearly and naturally. You can use your voice or the text chat.
                                </p>
                                <ul className="text-[var(--mute-text)] text-sm space-y-2 list-disc pl-4">
                                    <li><strong className="text-[var(--foreground)] font-semibold">Quiet Environment:</strong> Please ensure your surroundings are silent and free from distractions.</li>
                                    <li><strong className="text-[var(--foreground)] font-semibold">Stable Internet:</strong> A strong, high-speed connection is required.</li>
                                    <li><strong className="text-[var(--foreground)] font-semibold">Audio Check:</strong> Ensure your microphone is clear and working properly.</li>
                                    <li><strong className="text-[var(--foreground)] font-semibold">Device:</strong> Laptop or desktop recommended.</li>
                                </ul>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-current/5">
                                        <div className="text-[var(--color-castleton-green)] dark:text-[var(--color-saffaron)] font-bold text-lg">5-7</div>
                                        <div className="text-[10px] text-[var(--mute-text)] uppercase font-bold">Questions</div>
                                    </div>
                                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-current/5">
                                        <div className="text-[var(--color-castleton-green)] dark:text-[var(--color-saffaron)] font-bold text-lg">Real-time</div>
                                        <div className="text-[10px] text-[var(--mute-text)] uppercase font-bold">AI Support</div>
                                    </div>
                                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-current/5">
                                        <div className="text-red-500 font-bold text-lg">10 Mins</div>
                                        <div className="text-[10px] text-[var(--mute-text)] uppercase font-bold">Max Time</div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={startInterview}
                                disabled={isConnecting || (!!error && error.includes("completed"))}
                                className="w-full mt-8 px-10 py-5 bg-[var(--color-castleton-green)] dark:bg-[var(--color-saffaron)] text-white dark:text-black rounded-2xl font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {isConnecting ? <><Loader2 className="animate-spin" /> Preparing...</> : "Start Interview Now"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-[var(--mute-text)] font-semibold uppercase tracking-widest">
                <div className="flex gap-4">
                    <span>Secure-Edge-01</span>
                    <span>PH-MNL</span>
                </div>
                {isConnected && <button onClick={endInterview} className="text-red-500 underline">End Session</button>}
            </div>
        </div>
    );
}
