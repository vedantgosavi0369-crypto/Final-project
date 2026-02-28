import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClinicalSummarizer({ clinicalText }) {
    const [summary, setSummary] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading_model, generating, complete
    const [progress, setProgress] = useState(0);

    const mockupSummary = "Patient presents with classical signs of acute bronchitis characterized by a productive cough and mild pyrexia. No signs of consolidation on auscultation. Recommended course includes hydration, rest, and antipyretics. Follow up if symptoms worsen or persist beyond 7 days.";

    const generateSummary = async () => {
        if (!clinicalText || clinicalText.trim().length === 0) return;

        setStatus('loading_model');
        setSummary('');
        setProgress(0);

        // Simulate Model Loading
        const loadInterval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(loadInterval);
                    return 100;
                }
                return p + Math.floor(Math.random() * 15) + 5;
            });
        }, 150);

        await new Promise(r => setTimeout(r, 2000));
        clearInterval(loadInterval);

        setStatus('generating');

        await new Promise(r => setTimeout(r, 600));

        // Simulate Typewriter Effect Generation
        setStatus('complete');
        let i = 0;
        setSummary('');
        const typeInterval = setInterval(() => {
            if (i < mockupSummary.length) {
                setSummary(prev => prev + mockupSummary.charAt(i));
                i++;
            } else {
                clearInterval(typeInterval);
            }
        }, 30);
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-[#1A3668]/10 overflow-hidden group">
            <div className="p-4 border-b border-[#1A3668]/5 flex justify-between items-center bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                <div className="flex items-center gap-2 text-[#1A3668] font-bold">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                        <Bot className="w-5 h-5 text-indigo-600" />
                    </div>
                    Edge AI Summarizer
                </div>
                <span className="text-[10px] font-bold px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full flex items-center gap-1.5 shadow-sm border border-indigo-200">
                    <Sparkles className="w-3 h-3 text-purple-500" /> LOCAL INFERENCE
                </span>
            </div>

            <div className="p-5 space-y-5">
                {/* Source Text Snippet */}
                <div className="text-sm text-gray-500 italic border-l-4 border-indigo-500/30 pl-4 py-1 bg-gray-50/50 rounded-r-lg relative">
                    <div className="absolute top-1 right-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Input</div>
                    <p className="line-clamp-2 mt-2">{clinicalText || "No clinical notes provided for summarization..."}</p>
                </div>

                {/* Status Area */}
                <AnimatePresence mode="wait">
                    {status === 'complete' && summary.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="p-5 bg-gradient-to-br from-indigo-50/80 to-blue-50/80 rounded-xl text-sm text-[#1A3668] leading-relaxed border border-indigo-100 relative shadow-inner overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                            <div className="flex items-center gap-2 mb-3 border-b border-indigo-200/50 pb-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">AI Synthesis Result</h4>
                            </div>
                            <p className="font-medium">{summary}</p>
                            {/* Blinking cursor effect while typing */}
                            {summary.length < mockupSummary.length && (
                                <span className="inline-block w-1.5 h-4 bg-indigo-500 ml-1 animate-pulse"></span>
                            )}
                        </motion.div>
                    ) : status !== 'idle' ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center p-8 space-y-4 bg-gray-50/50 rounded-xl border border-gray-100 border-dashed">
                            {status === 'loading_model' && (
                                <>
                                    <div className="relative w-12 h-12 flex items-center justify-center">
                                        <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-ping opacity-20"></div>
                                        <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">Loading DistilBART Model</span>

                                    <div className="w-full max-w-xs space-y-2 mt-2">
                                        <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                                            <span>Downloading Weights</span>
                                            <span>{Math.min(progress, 100)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            {status === 'generating' && (
                                <>
                                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                    <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 animate-pulse">Processing Neural Output...</span>
                                </>
                            )}
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                <button
                    onClick={generateSummary}
                    disabled={status === 'loading_model' || status === 'generating' || !clinicalText}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white rounded-xl font-bold transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                    <Sparkles className="w-4 h-4" />
                    {status === 'complete' ? 'Regenerate Analysis' : 'Run AI Analysis'}
                </button>
            </div>
        </div>
    );
}
