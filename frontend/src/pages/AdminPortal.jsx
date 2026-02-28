import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, UserPlus, CheckCircle, Loader2, Database, ShieldCheck, FileCheck, ArrowLeft, Check } from 'lucide-react';

export default function AdminPortal() {
    const navigate = useNavigate();
    const [applicants, setApplicants] = useState([
        { id: '1', name: 'Dr. Emily Chen', licenseId: 'MED-78451', status: 'pending', date: '2026-02-27', email: 'emily.chen@hospital.com' },
        { id: '2', name: 'Dr. Marcus Johnson', licenseId: 'MED-90234', status: 'pending', date: '2026-02-26', email: 'marcus.j@medcenter.org' }
    ]);
    const [notificationStatus, setNotificationStatus] = useState('');

    // Verification Sequence State
    const [verifyingId, setVerifyingId] = useState(null);
    const [verificationStep, setVerificationStep] = useState(0);

    const verificationSteps = [
        { text: "Connecting to National Medical Commission...", icon: <Database className="w-5 h-5" /> },
        { text: "Validating License & Certificates...", icon: <FileCheck className="w-5 h-5" /> },
        { text: "Verifying Hospital Affiliation...", icon: <ShieldCheck className="w-5 h-5" /> },
        { text: "Creating Secure Blockchain Identity...", icon: <CheckCircle className="w-5 h-5 text-green-400" /> }
    ];

    useEffect(() => {
        const loadLocalApps = () => {
            const stored = localStorage.getItem('adminPendingDoctors');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed.length > 0) {
                        setApplicants(prev => {
                            const existingIds = new Set(prev.map(p => p.id));
                            const newApps = parsed.filter(p => !existingIds.has(p.id));
                            return [...newApps, ...prev];
                        });
                    }
                } catch (e) { console.error(e); }
            }
        };
        loadLocalApps();
    }, []);

    const handleVerifyClick = (id) => {
        setVerifyingId(id);
        setVerificationStep(0);

        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            if (currentStep < verificationSteps.length) {
                setVerificationStep(currentStep);
            } else {
                clearInterval(interval);
                completeVerification(id);
            }
        }, 1500); // 1.5 seconds per step
    };

    const completeVerification = (id) => {
        const dr = applicants.find(a => a.id === id);

        setApplicants(prev => prev.map(app => app.id === id ? { ...app, status: 'verified' } : app));

        const stored = localStorage.getItem('adminPendingDoctors');
        if (stored) {
            try {
                let parsed = JSON.parse(stored);
                parsed = parsed.map(app => app.id === id ? { ...app, status: 'verified' } : app);
                localStorage.setItem('adminPendingDoctors', JSON.stringify(parsed));
            } catch (e) { }
        }

        setVerifyingId(null);
        setNotificationStatus(`Successfully verified credentials for ${dr?.name || 'Doctor'} and sent secure access link.`);
        setTimeout(() => setNotificationStatus(''), 4000);
    };
    const handleRunSimulation = () => {
        const demoDoctor = {
            id: `DEMO-${Date.now()}`,
            name: 'Dr. Sarah Connor',
            licenseId: 'MED-55019',
            status: 'pending',
            date: new Date().toISOString().split('T')[0],
            email: 'sarah.connor@demo-hospital.com'
        };

        setApplicants(prev => [demoDoctor, ...prev]);
        setNotificationStatus('Incoming New Doctor Registration Request Detected.');
        setTimeout(() => setNotificationStatus(''), 4000);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12 relative">
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-[#1A3668] transition-colors font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Login
            </button>

            <div className="max-w-4xl mx-auto mt-12 md:mt-0">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shadow-sm">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Security Portal</h1>
                            <p className="text-sm text-gray-500 font-medium">Doctor Credential Verification. Login-only mode.</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleRunSimulation}
                        className="py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all text-sm font-bold shadow-md hover:shadow-lg flex items-center gap-2 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/20 w-0 group-hover:w-full transition-all duration-300 ease-out"></div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                        Simulate Incoming Request
                    </button>
                </div>

                {notificationStatus && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-green-50 text-[#2D7A4D] border border-green-200 rounded-xl flex items-center gap-3 font-semibold shadow-sm"
                    >
                        <CheckCircle className="w-5 h-5" /> {notificationStatus}
                    </motion.div>
                )}

                <div className="bg-white border border-gray-100 rounded-2xl shadow-xl shadow-blue-900/5 overflow-hidden">
                    <div className="p-4 md:p-6 border-b bg-gray-50/80 flex justify-between items-center">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-[#1A3668]">
                            <UserPlus className="w-5 h-5" /> Pending Applicants
                        </h2>
                    </div>

                    <div className="p-0">
                        {applicants.map(app => (
                            <div key={app.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors gap-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{app.name}</h3>
                                    <p className="text-sm font-medium text-gray-500 mt-1">License: <span className="text-gray-700">{app.licenseId}</span> • Applied: {app.date}</p>
                                    {app.email && <p className="text-xs font-semibold text-gray-400 mt-1">{app.email}</p>}
                                </div>
                                <div className="shrink-0 w-full md:w-auto">
                                    {app.status === 'pending' ? (
                                        <button
                                            onClick={() => handleVerifyClick(app.id)}
                                            className="w-full md:w-auto px-5 py-2.5 bg-[#1A3668] hover:bg-[#12264a] text-white rounded-xl shadow-sm font-bold transition-all hover:shadow-md flex items-center justify-center gap-2"
                                        >
                                            <ShieldCheck className="w-4 h-4" /> Verify Credentials
                                        </button>
                                    ) : (
                                        <span className="w-full md:w-auto px-4 py-2.5 bg-green-50 text-[#2D7A4D] border border-green-200 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> Verified Identity
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {applicants.filter(a => a.status === 'pending').length === 0 && (
                            <div className="p-12 text-center text-gray-400 font-medium bg-gray-50/50">
                                No pending applications ready for review.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Verification Sequence Modal */}
            <AnimatePresence>
                {verifyingId && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-[#1A3668] to-[#2D7A4D]"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${((verificationStep) / verificationSteps.length) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>

                            <div className="text-center mb-8 mt-2">
                                <div className="w-20 h-20 bg-blue-50 text-[#1A3668] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md relative">
                                    <Loader2 className="w-10 h-10 animate-spin opacity-50 absolute" />
                                    <ShieldCheck className="w-8 h-8 relative z-10" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Establishing Identity</h3>
                                <p className="text-sm text-gray-500 mt-1 font-medium">Cross-referencing global medical databases...</p>
                            </div>

                            <div className="space-y-4">
                                {verificationSteps.map((step, idx) => (
                                    <div key={idx} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-500 ${idx < verificationStep ? 'bg-green-50/80 border-green-200 opacity-100' : idx === verificationStep ? 'bg-blue-50/80 border-blue-200 opacity-100 shadow-sm shadow-blue-900/5' : 'bg-gray-50/50 border-gray-100 opacity-50'}`}>
                                        <div className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 ${idx < verificationStep ? 'bg-green-100 text-[#2D7A4D]' : idx === verificationStep ? 'bg-[#1A3668] text-white shadow-md' : 'bg-gray-200 text-gray-400'}`}>
                                            {idx < verificationStep ? <Check className="w-5 h-5" /> : step.icon}
                                        </div>
                                        <span className={`text-sm font-bold ${idx < verificationStep ? 'text-[#2D7A4D]' : idx === verificationStep ? 'text-[#1A3668]' : 'text-gray-400'}`}>
                                            {step.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
