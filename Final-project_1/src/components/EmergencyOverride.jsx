import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { logAccessReason } from '../utils/blockchain';
import { AlertOctagon, Key, Unlock } from 'lucide-react';

export default function EmergencyOverride({ patientId, onOverrideSuccess }) {
    const [isOpen, setIsOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [legalChecked, setLegalChecked] = useState(false);
    const [status, setStatus] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleEmergencyTrigger = async (e) => {
        e.preventDefault();
        if (!password) {
            setErrorMsg("Step-Up Authentication required.");
            return;
        }
        if (!legalChecked) {
            setErrorMsg("You must accept legal responsibility.");
            return;
        }

        try {
            setStatus('authenticating');
            // Mock Step-Up Auth
            await new Promise(res => setTimeout(res, 800));

            setStatus('logging');
            // 🚨 Log the emergency access to blockchain
            await logAccessReason(`EMERGENCY_${patientId}`, "Emergency Override - Life Packet");

            setStatus('success');
            setTimeout(() => {
                setIsOpen(false);
                onOverrideSuccess();
            }, 1000);

        } catch (error) {
            setStatus('error');
            setErrorMsg("Override failed: " + error.message);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-bold transition-colors border border-red-200"
            >
                <AlertOctagon className="w-5 h-5" />
                Emergency Override (Life Packet Only)
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-900/40 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border-2 border-red-500"
            >
                <div className="flex items-center gap-3 mb-4 text-red-600">
                    <AlertOctagon className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">Emergency Break-Glass</h2>
                </div>

                <p className="text-sm text-gray-700 mb-4 bg-red-50 p-3 rounded border border-red-100">
                    <strong>WARNING:</strong> You are invoking the Emergency Override protocol.
                    This will unlock the <b>Life Packet</b> (Blood Group, Allergies, Meds, Emergency Contacts) ONLY. <br /><br />
                    “The Vault” remains inaccessible. Every click is logged to the blockchain as "Emergency".
                </p>

                <form onSubmit={handleEmergencyTrigger} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                            <Key className="w-4 h-4 text-[var(--color-secondary-olive)]" />
                            Step-Up Authentication
                        </label>
                        <input
                            type="password"
                            placeholder="Re-enter your password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="flex items-start gap-2">
                        <input
                            type="checkbox"
                            id="legal"
                            checked={legalChecked}
                            onChange={(e) => { setLegalChecked(e.target.checked); setErrorMsg(''); }}
                            className="mt-1 w-4 h-4 text-red-600 rounded focus:ring-red-500 border-gray-300"
                        />
                        <label htmlFor="legal" className="text-sm text-gray-600 cursor-pointer">
                            I sign and take full legal responsibility for accessing this patient's emergency records without explicit standard consent at this time.
                        </label>
                    </div>

                    {errorMsg && <p className="text-sm text-red-600 font-medium">{errorMsg}</p>}

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={status !== 'idle' && status !== 'error'}
                            className="flex-1 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                        >
                            {status === 'idle' && <><Unlock className="w-4 h-4" /> Unlock Life Packet</>}
                            {status === 'authenticating' && "Authenticating..."}
                            {status === 'logging' && "Logging to Blockchain..."}
                            {status === 'success' && "Unlocked!"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
