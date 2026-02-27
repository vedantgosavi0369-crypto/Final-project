import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logAccessReason } from '../utils/blockchain';
import { Lock, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

export default function ZeroTrustGatekeeper({ recordHash, onDecryptSuccess, onClose }) {
    const [reason, setReason] = useState('');
    const [status, setStatus] = useState('idle'); // idle, signing, decrypting, success, error
    const [errorMsg, setErrorMsg] = useState('');

    const handleAccessRequest = async (e) => {
        e.preventDefault();
        if (reason.trim().length < 5) {
            setErrorMsg("Please provide a valid reason (min 5 characters).");
            return;
        }

        try {
            setStatus('signing');
            // 1. Sign Blockchain Transaction
            const tx = await logAccessReason(recordHash, reason);

            setStatus('decrypting');
            // 2. Mock Decryption wait (assuming Web Crypto API is called in parent or here)
            await new Promise(res => setTimeout(res, 1000));

            setStatus('success');
            setTimeout(() => {
                onDecryptSuccess();
            }, 1000);

        } catch (error) {
            console.error(error);
            setStatus('error');
            setErrorMsg("Failed to gain access: " + error.message);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-100"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3 text-red-600">
                            <ShieldAlert className="w-6 h-6" />
                            <h2 className="text-xl font-bold text-gray-900">Zero-Trust Gatekeeper</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>

                    <p className="text-sm text-gray-600 mb-6">
                        You are attempting to access an encrypted medical record (<code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{recordHash.substring(0, 8)}...</code>).
                        Access requires an immutable blockchain log.
                    </p>

                    <form onSubmit={handleAccessRequest} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Access (Immutable)</label>
                            <textarea
                                value={reason}
                                onChange={(e) => { setReason(e.target.value); setErrorMsg(''); }}
                                placeholder="e.g. Routine Checkup, Emergency ER Admission..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-cyan)] focus:border-transparent outline-none resize-none"
                                rows="3"
                                disabled={status !== 'idle' && status !== 'error'}
                            />
                            {errorMsg && <p className="mt-1 text-sm text-red-600">{errorMsg}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={status !== 'idle' && status !== 'error'}
                            className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium text-white transition-all
                ${(status !== 'idle' && status !== 'error') ? 'bg-gray-400 cursor-not-allowed' : 'bg-[var(--color-primary-cyan)] hover:bg-cyan-600 shadow-md hover:shadow-lg'}`}
                        >
                            {status === 'idle' && <><Lock className="w-4 h-4" /> Sign & Decrypt Document</>}
                            {status === 'signing' && <><span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span> Signing Transaction...</>}
                            {status === 'decrypting' && <><FileText className="w-4 h-4 animate-pulse" /> Decrypting via Web Crypto...</>}
                            {status === 'success' && <><CheckCircle2 className="w-4 h-4 text-green-300" /> Access Granted</>}
                            {status === 'error' && <><ShieldAlert className="w-4 h-4" /> Try Again</>}
                        </button>
                    </form>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
