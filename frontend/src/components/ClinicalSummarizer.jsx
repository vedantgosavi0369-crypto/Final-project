import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClinicalSummarizer({ clinicalText }) {
    const [summary, setSummary] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading_model, generating, complete, error
    const [progress, setProgress] = useState(0);

    // We use a ref to store the pipeline so we don't recreate it
    const summarizerRef = useRef(null);

    const generateSummary = async () => {
        if (!clinicalText || clinicalText.trim().length === 0) return;

        setStatus('loading_model');
        setSummary('');

        try {
            // Dynamically import Transformers.js so it doesn't block initial page load
            const { pipeline, env } = await import('@xenova/transformers');

            // Ensure we don't use local files (forces downloading from Hub)
            env.allowLocalModels = false;
            env.useBrowserCache = true; // Use cache so it doesn't download every time

            if (!summarizerRef.current) {
                // Load the distilbart-cnn-6-6 summarizer model
                summarizerRef.current = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6', {
                    progress_callback: (info) => {
                        if (info.status === 'progress' || info.status === 'downloading') {
                            setProgress(Math.round((info.loaded / info.total) * 100) || null);
                        }
                    }
                });
            }

            setStatus('generating');

            const result = await summarizerRef.current(clinicalText, {
                max_new_tokens: 100, // clinical summary max length
                maxLength: 100,
                minLength: 30,
            });

            setSummary(result[0].summary_text);
            setStatus('complete');
        } catch (e) {
            console.error(e);
            setStatus('error');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                    <Bot className="w-5 h-5 text-[var(--color-primary-cyan)]" />
                    Edge AI Summarizer
                </div>
                <span className="text-[10px] font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Runs Locally Grid
                </span>
            </div>

            <div className="p-4 space-y-4">
                {/* Source Text Snippet */}
                <div className="text-sm text-gray-500 italic border-l-2 border-[var(--color-primary-cyan)] pl-3 line-clamp-2">
                    {clinicalText || "No clinical notes provided for summarization..."}
                </div>

                {/* Status Area */}
                <AnimatePresence mode="wait">
                    {status === 'complete' ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-[var(--color-dashboard-bg)] rounded-lg text-sm text-gray-800 leading-relaxed border border-gray-100"
                        >
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Generated Clinical Summary</h4>
                            {summary}
                        </motion.div>
                    ) : status !== 'idle' ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center p-6 space-y-3">
                            {status === 'loading_model' && (
                                <>
                                    <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
                                    <span className="text-sm font-medium text-gray-600">Loading AI Model (DistilBART-CNN) {progress ? `...${progress}%` : ''}</span>
                                    <p className="text-xs text-center text-gray-400 max-w-[250px]">
                                        Downloading model directly into your browser cache for Zero-Trust processing.
                                    </p>
                                </>
                            )}
                            {status === 'generating' && (
                                <>
                                    <Loader2 className="w-6 h-6 text-[var(--color-primary-cyan)] animate-spin" />
                                    <span className="text-sm font-medium text-gray-600">Generating Summary...</span>
                                </>
                            )}
                            {status === 'error' && (
                                <span className="text-sm font-medium text-red-500">Failed to load or generate AI summary. Try again.</span>
                            )}
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                <button
                    onClick={generateSummary}
                    disabled={status === 'loading_model' || status === 'generating' || !clinicalText}
                    className="w-full py-2.5 bg-[var(--color-primary-cyan)] hover:bg-cyan-600 text-white rounded-lg font-medium shadow-sm transition-all flex justify-center items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {status === 'complete' || status === 'error' ? 'Regenerate Summary' : 'Generate Clinical Summary'}
                </button>
            </div>
        </div>
    );
}
