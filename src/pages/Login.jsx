import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, User } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [role, setRole] = useState('patient'); // patient, doctor, applicant, admin
    const [generatedId, setGeneratedId] = useState('');

    const generatePatientId = () => {
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 900) + 100;
        const newId = `P-${year}-${randomNum}`;
        setGeneratedId(newId);
    };

    const handleRegister = (e) => {
        e.preventDefault();
        if (role === 'patient') {
            generatePatientId();
        } else if (role === 'doctor') {
            alert("Registered as applicant. Pending Admin verification.");
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        // In real app, verify via Supabase Auth
        if (role === 'admin') navigate('/admin');
        else navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-dashboard-bg)] p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            >
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-[var(--color-primary-cyan)] text-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Health Record System</h2>
                <p className="text-center text-sm text-gray-500 mb-8">Zero-Trust Medical Blockchain</p>

                <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                    {['patient', 'doctor', 'admin'].map(r => (
                        <button
                            key={r}
                            onClick={() => setRole(r)}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${role === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {role !== 'admin' && (
                        <button
                            type="button"
                            onClick={handleRegister}
                            className="w-full py-2 bg-blue-50 text-[var(--color-primary-cyan)] font-semibold rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 flex justify-center items-center gap-2"
                        >
                            <User className="w-4 h-4" />
                            Register New {role === 'patient' ? 'Patient' : 'Applicant'}
                        </button>
                    )}

                    {generatedId && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                            <span className="block text-xs text-green-700 font-bold mb-1">Your Patient ID is:</span>
                            <code className="text-lg text-[var(--color-secondary-olive)] font-mono">{generatedId}</code>
                        </motion.div>
                    )}

                    <div className="h-px bg-gray-200 my-4" />

                    <button
                        type="submit"
                        className="w-full py-2.5 bg-gray-900 text-white font-semibold rounded-lg shadow-md hover:bg-black transition-colors"
                    >
                        Login as {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                </form>

            </motion.div>
        </div>
    );
}
