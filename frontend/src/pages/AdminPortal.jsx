import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, UserPlus, CheckCircle } from 'lucide-react';

export default function AdminPortal() {
    const [applicants, setApplicants] = useState([
        { id: '1', name: 'Dr. Emily Chen', licenseId: 'MED-78451', status: 'pending', date: '2026-02-27' },
        { id: '2', name: 'Dr. Marcus Johnson', licenseId: 'MED-90234', status: 'pending', date: '2026-02-26' }
    ]);
    const [notificationStatus, setNotificationStatus] = useState('');

    const handleVerify = (id) => {
        // Determine the doctor verified
        const dr = applicants.find(a => a.id === id);
        if (!dr) return;

        // Simulate backend Supabase verification updating profiles table `is_verified`
        setApplicants(prev => prev.map(app => app.id === id ? { ...app, status: 'verified' } : app));

        // Simulate Email Notification trigger
        setNotificationStatus(`Approving and sending secure Gmail notification to ${dr.name}...`);
        setTimeout(() => setNotificationStatus(''), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Security Portal</h1>
                        <p className="text-sm text-gray-500">Doctor Credential Verification. Login-only mode.</p>
                    </div>
                </div>

                {notificationStatus && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-[var(--color-secondary-olive)]/10 text-[var(--color-secondary-olive)] border border-[var(--color-secondary-olive)]/30 rounded-lg flex items-center gap-2 font-medium"
                    >
                        <CheckCircle className="w-5 h-5" /> {notificationStatus}
                    </motion.div>
                )}

                <div className="bg-white border text-gray-900 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 md:p-6 border-b bg-gray-50/50 flex justify-between items-center">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-gray-400" /> Pending Applicants
                        </h2>
                    </div>

                    <div className="p-0">
                        {applicants.map(app => (
                            <div key={app.id} className="flex justify-between items-center p-6 border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                                <div>
                                    <h3 className="font-bold text-lg">{app.name}</h3>
                                    <p className="text-sm text-gray-500">License: {app.licenseId} • Applied: {app.date}</p>
                                </div>
                                <div>
                                    {app.status === 'pending' ? (
                                        <button
                                            onClick={() => handleVerify(app.id)}
                                            className="px-5 py-2 bg-[var(--color-primary-cyan)] hover:bg-cyan-600 text-white rounded-lg shadow-sm font-medium transition-colors"
                                        >
                                            Verify Credentials
                                        </button>
                                    ) : (
                                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" /> Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {applicants.filter(a => a.status === 'pending').length === 0 && (
                            <div className="p-12 text-center text-gray-400 font-medium">
                                No pending applications.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
