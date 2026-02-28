import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, UploadCloud, UserCircle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function DoctorSetup() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const [step, setStep] = useState(1); // 1: Password, 2: Profile, 3: Documents, 4: Pending
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [experience, setExperience] = useState('');
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setStep(2);
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!fullName || !specialty || !experience) {
            setError('Please fill in all fields');
            return;
        }
        setStep(3);
    };

    const handleDocumentUpload = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        // Simulate document upload delay
        await new Promise(r => setTimeout(r, 2000));
        setIsUploading(false);
        setStep(4);
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck className="w-8 h-8 text-[#1A3668]" />
                            <h2 className="text-2xl font-bold text-[#1A3668]">Secure Your Account</h2>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">Create a strong password for your verified email address ({email}).</p>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-[#1A3668]/80 mb-1 block">New Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-[#1A3668]/20 focus:border-[#1A3668] focus:ring-2 focus:ring-[#1A3668]/20 outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[#1A3668]/80 mb-1 block">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-[#1A3668]/20 focus:border-[#1A3668] focus:ring-2 focus:ring-[#1A3668]/20 outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                            <button type="submit" className="w-full py-3 bg-[#1A3668] text-white rounded-lg font-bold hover:bg-[#12264a] transition-colors mt-4 shadow-md">
                                Continue
                            </button>
                        </form>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="flex items-center gap-3 mb-6">
                            <UserCircle className="w-8 h-8 text-[#1A3668]" />
                            <h2 className="text-2xl font-bold text-[#1A3668]">Professional Profile</h2>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">Tell us about your medical background.</p>
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-[#1A3668]/80 mb-1 block">Full Name with Title</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-[#1A3668]/20 focus:border-[#1A3668] focus:ring-2 focus:ring-[#1A3668]/20 outline-none"
                                    placeholder="e.g. Dr. Jane Doe"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[#1A3668]/80 mb-1 block">Primary Specialty</label>
                                <input
                                    type="text"
                                    value={specialty}
                                    onChange={(e) => setSpecialty(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-[#1A3668]/20 focus:border-[#1A3668] focus:ring-2 focus:ring-[#1A3668]/20 outline-none"
                                    placeholder="e.g. Cardiology"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[#1A3668]/80 mb-1 block">Years of Experience</label>
                                <input
                                    type="number"
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-[#1A3668]/20 focus:border-[#1A3668] focus:ring-2 focus:ring-[#1A3668]/20 outline-none"
                                    placeholder="e.g. 10"
                                    min="0"
                                />
                            </div>
                            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                            <button type="submit" className="w-full py-3 bg-[#1A3668] text-white rounded-lg font-bold hover:bg-[#12264a] transition-colors mt-4 shadow-md">
                                Continue
                            </button>
                        </form>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="flex items-center gap-3 mb-6">
                            <UploadCloud className="w-8 h-8 text-[#1A3668]" />
                            <h2 className="text-2xl font-bold text-[#1A3668]">Credential Verification</h2>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">Please upload a valid copy of your Medical License or Certificate to verify your identity.</p>
                        <form onSubmit={handleDocumentUpload} className="space-y-6">
                            <div className="border-2 border-dashed border-[#1A3668]/30 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                                <UploadCloud className="w-12 h-12 text-[#1A3668]/50 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                                <p className="font-semibold text-[#1A3668]">Click to upload or drag and drop</p>
                                <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG (max 10MB)</p>
                            </div>

                            <button
                                type="submit"
                                disabled={isUploading}
                                className="w-full py-3 bg-[#1A3668] text-white rounded-lg font-bold hover:bg-[#12264a] transition-colors disabled:opacity-70 shadow-md flex justify-center items-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    'Submit for Verification'
                                )}
                            </button>
                        </form>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10 text-amber-600 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1A3668] mb-3">Pending Verification</h2>
                        <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                            Thank you, Dr. {fullName.replace('Dr. ', '')}. Your credentials have been submitted and are securely stored on our verification queue.
                        </p>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 text-left mb-8">
                            <p className="font-semibold mb-1">What happens next?</p>
                            <ul className="list-disc list-inside space-y-1 opacity-80">
                                <li>The platform administrator reviews your documents</li>
                                <li>Identity and medical license checks are validated</li>
                                <li>You will receive approval via email within 24-48 hours</li>
                            </ul>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="text-[#1A3668] font-semibold hover:text-[#2D7A4D] transition-colors"
                        >
                            Return to Login
                        </button>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#e0f2fe_0%,_#ffffff_100%)] -z-10" />

            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-[#1A3668]/10">
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-gray-100">
                    <div
                        className="h-full bg-gradient-to-r from-[#1A3668] to-[#2D7A4D] transition-all duration-500 ease-out"
                        style={{ width: `${(step / 4) * 100}%` }}
                    />
                </div>

                <div className="p-8 sm:p-10">
                    <AnimatePresence mode="wait">
                        {renderStep()}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
