import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function PasswordCreation() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({ password: '', confirm: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if email not provided
    React.useEffect(() => {
        if (!email) navigate('/');
    }, [email, navigate]);

    const getPasswordStrength = (pwd) => {
        if (!pwd) return { label: '', color: 'bg-transparent', width: '0%', textColor: '' };

        const hasMinLength = pwd.length >= 8;
        const hasUpper = /[A-Z]/.test(pwd);
        const hasLower = /[a-z]/.test(pwd);
        const hasNumber = /\d/.test(pwd);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

        if (hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial) {
            return { label: 'Strong', color: 'bg-[#39FF14]', width: '100%', textColor: 'text-[#39FF14]' };
        } else if (hasMinLength && (hasUpper || hasLower) && (hasNumber || hasSpecial)) {
            return { label: 'Medium', color: 'bg-yellow-400', width: '66%', textColor: 'text-yellow-500' };
        } else {
            return { label: 'Weak', color: 'bg-red-500', width: '33%', textColor: 'text-red-500' };
        }
    };

    const strength = getPasswordStrength(password);

    const validateForm = () => {
        let isValid = true;
        const newErrors = { password: '', confirm: '' };

        if (!password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else {
            const hasNumber = /\d/.test(password);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            const hasUpper = /[A-Z]/.test(password);
            const hasLower = /[a-z]/.test(password);

            if (password.length < 8) {
                newErrors.password = 'Must be at least 8 characters';
                isValid = false;
            } else if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
                newErrors.password = 'Must contain uppercase, lowercase, number, and special character';
                isValid = false;
            }
        }

        if (password !== confirmPassword) {
            newErrors.confirm = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/register-patient', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');

            // Redirect to dashboard with patient ID
            navigate('/dashboard', {
                state: { patientId: data.patientId, email, isNewPatient: true }
            });
        } catch (err) {
            console.error('Registration error:', err);
            setErrors({ ...errors, password: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    if (!email) return null;

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
            {/* Background */}
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_center,_#e0f2fe_0%,_#ffffff_100%)]" />
            <div className="absolute inset-0 -z-10 opacity-5"
                style={{ backgroundImage: `linear-gradient(#93c5fd 1px, transparent 1px), linear-gradient(90deg, #93c5fd 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
            />

            {/* Fixed Header */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed top-0 left-0 p-8 flex items-center gap-4 z-50"
            >
                <img
                    src="/jeevanconnectlogo.png"
                    alt="JeevanConnect Logo"
                    className="w-20 h-20 object-contain drop-shadow-sm"
                />
                <h1 className="text-2xl font-bold tracking-tight">
                    <span className="text-[#1A3668]">Jeevan</span>
                    <span className="text-[#2D7A4D]">Connect</span>
                </h1>
            </motion.div>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_12px_48px_rgba(26,54,104,0.2)] p-8 border border-[#1A3668]/20"
            >
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-1 text-sm font-medium text-[#1A3668] hover:text-[#2D7A4D] transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" /> Back
                </button>

                <h2 className="text-2xl font-bold text-[#1A3668] mb-1">Create Password</h2>
                <p className="text-sm text-gray-500 font-medium mb-6">
                    Set a strong password for your account
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Display */}
                    <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-600 font-medium">Account Email</p>
                        <p className="text-sm font-semibold text-[#1A3668]">{email}</p>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-[#1A3668]/80">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors({ ...errors, password: '' });
                                }}
                                placeholder="••••••••"
                                className={`w-full px-4 py-2.5 pr-10 rounded-lg border bg-white/50 backdrop-blur-sm focus:ring-2 focus:outline-none transition-all ${errors.password
                                        ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                                        : 'border-[#1A3668]/20 focus:border-[#1A3668] focus:ring-[#1A3668]/20'
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#1A3668]"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password}</p>}

                        {password && (
                            <div className="mt-2">
                                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${strength.color}`}
                                        style={{ width: strength.width }}
                                    ></div>
                                </div>
                                <p className={`text-[10px] mt-1 font-semibold uppercase tracking-wider ${strength.textColor}`}>
                                    {strength.label}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-[#1A3668]/80">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if (errors.confirm) setErrors({ ...errors, confirm: '' });
                                }}
                                placeholder="••••••••"
                                className={`w-full px-4 py-2.5 pr-10 rounded-lg border bg-white/50 backdrop-blur-sm focus:ring-2 focus:outline-none transition-all ${errors.confirm
                                        ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                                        : 'border-[#1A3668]/20 focus:border-[#1A3668] focus:ring-[#1A3668]/20'
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#1A3668]"
                            >
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.confirm && <p className="text-xs text-red-500 font-medium">{errors.confirm}</p>}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 mt-6 bg-[#1A3668] text-white font-bold rounded-lg shadow-md hover:bg-[#12264a] hover:shadow-lg transition-all border border-[#1A3668]/50 focus:ring-2 focus:ring-[#2D7A4D] focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-b from-[#1A3668] to-[#12264a]"
                    >
                        {isLoading ? 'Creating Password...' : 'Complete Registration'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
