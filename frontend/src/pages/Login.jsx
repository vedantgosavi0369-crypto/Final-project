import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [role, setRole] = useState('patient'); // patient, doctor, applicant, admin
    const [generatedId, setGeneratedId] = useState('');
    const [formMode, setFormMode] = useState('initial'); // 'initial', 'login', 'register', 'otp', 'success'

    // Form inputs state
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [errors, setErrors] = useState({ fullName: '', email: '', password: '', confirm: '' });

    // Validate Name (only alphabets and spaces allowed)
    const validateNameInput = (value) => {
        return /^[a-zA-Z\s]*$/.test(value);
    };

    const handleNameChange = (e) => {
        const newValue = e.target.value;
        if (validateNameInput(newValue)) {
            setFullName(newValue);
            if (errors.fullName) setErrors({ ...errors, fullName: '' });
        }
    };

    // Global helper for Real-time Password Strength calculation
    const getPasswordStrength = (pwd) => {
        if (!pwd) return { label: '', color: 'bg-transparent', width: '0%', textColor: '' };
        
        const hasMinLength = pwd.length >= 8;
        const hasUpper = /[A-Z]/.test(pwd);
        const hasLower = /[a-z]/.test(pwd);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

        if (hasMinLength && hasUpper && hasLower && hasSpecial) {
            return { label: 'Strong', color: 'bg-[#39FF14]', width: '100%', textColor: 'text-[#39FF14]' };
        } else if (hasMinLength) {
            return { label: 'Medium', color: 'bg-yellow-400', width: '66%', textColor: 'text-yellow-500' };
        } else {
            return { label: 'Weak', color: 'bg-red-500', width: '33%', textColor: 'text-red-500' };
        }
    };

    const strength = getPasswordStrength(password);

    const generatePatientId = () => {
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 900) + 100;
        const newId = `P-${year}-${randomNum}`;
        setGeneratedId(newId);
        setFormMode('success');
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { fullName: '', email: '', password: '', confirm: '' };

        if (formMode === 'register' && !fullName.trim()) {
            newErrors.fullName = 'Name is required';
            isValid = false;
        }

        // Email validation (user@domain.com)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Invalid email format';
            isValid = false;
        }

        // Password validation (min 8 chars, 1 number, 1 special char)
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
            } else if (!hasNumber || !hasSpecial || !hasUpper || !hasLower) {
                newErrors.password = 'Must contain a number, an uppercase letter, a lowercase letter and a special character';
                isValid = false;
            }
        }

        // Confirm password validation
        if (formMode === 'register' && password !== confirmPassword) {
            newErrors.confirm = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleRegister = (e) => {
        e.preventDefault();
        setFormMode('register');
    };

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        if (!fullName.trim() || !validateNameInput(fullName)) {
            setErrors({ ...errors, fullName: "Please enter a valid name (letters and spaces only)." });
            return;
        }
        
        const currentStrength = getPasswordStrength(password);
        if (currentStrength.label !== 'Strong') {
            setErrors({ ...errors, password: "Password must be at least 8 characters, with 1 uppercase, 1 lowercase, and 1 special character." });
            return;
        }

        if (validateForm()) {
            if (role === 'patient') {
                setFormMode('otp');
            } else if (role === 'doctor') {
                alert("Registered as applicant. Pending Admin verification.");
                setFormMode('initial');
                setEmail('');
                setFullName('');
                setPassword('');
                setConfirmPassword('');
            }
        }
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        if (otp.length > 0) {
            generatePatientId();
        }
    };

    const handleInitLogin = (e) => {
        e.preventDefault();
        setFormMode('login');
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // In real app, verify via Supabase Auth
            if (role === 'admin') navigate('/admin');
            else navigate('/dashboard');
        }
    };

    const handleBack = () => {
        setFormMode('initial');
        setErrors({ fullName: '', email: '', password: '', confirm: '' });
        setPassword('');
        setConfirmPassword('');
        setFullName('');
    };

    const logoVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
    };

    const pageVariants = {
        initial: { x: 50, opacity: 0 },
        in: { x: 0, opacity: 1 },
        out: { x: -50, opacity: 0 }
    };

    const pageTransition = {
        type: "tween",
        ease: "anticipate",
        duration: 0.3
    };

    const renderInput = (type, value, setter, placeholder, error, label) => (
        <div className="space-y-1">
            <label className="text-sm font-semibold text-[#1A3668]/80">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => {
                    setter(e.target.value);
                    if (error) setErrors({ ...errors, [type === 'email' ? 'email' : (label === 'Confirm Password' ? 'confirm' : 'password')]: '' });
                }}
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 rounded-lg border bg-white/50 backdrop-blur-sm focus:ring-2 focus:outline-none transition-all ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-[#1A3668]/20 focus:border-[#1A3668] focus:ring-[#1A3668]/20'
                    }`}
            />
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>
    );

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
            {/* Health-Tech Background */}
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_center,_#e0f2fe_0%,_#ffffff_100%)]" />
            <div className="absolute inset-0 -z-10 opacity-5"
                style={{ backgroundImage: `linear-gradient(#93c5fd 1px, transparent 1px), linear-gradient(90deg, #93c5fd 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
            />

            {/* Fixed Header */}
            <motion.div
                initial="hidden" animate="visible" variants={logoVariants}
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

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_12px_48px_rgba(26,54,104,0.2)] p-8 border border-[#1A3668]/20 overflow-hidden relative min-h-[460px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    {formMode === 'initial' && (
                        <motion.div
                            key="initial"
                            initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
                            className="w-full"
                        >
                            <h2 className="text-3xl font-bold text-center mb-2">
                                <span className="text-[#1A3668]">Jeevan</span>
                                <span className="text-[#2D7A4D]">Connect</span>
                            </h2>
                            <p className="text-center text-sm text-gray-500 font-medium mb-8">
                                Zero-Trust Medical Blockchain
                            </p>

                            <div className="flex relative gap-2 mb-8 bg-black/5 p-1 rounded-lg backdrop-blur-sm border border-white/20">
                                {['patient', 'doctor', 'admin'].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setRole(r)}
                                        className={`relative flex-1 py-1.5 text-sm font-semibold rounded-md capitalize transition-colors z-10 ${role === r ? 'text-white' : 'text-[#1A3668]/70 hover:text-[#1A3668]'}`}
                                    >
                                        {role === r && (
                                            <motion.div
                                                layoutId="pill"
                                                className="absolute inset-0 bg-gradient-to-r from-[#1A3668] to-[#2D7A4D] rounded-md -z-10 shadow-sm"
                                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            />
                                        )}
                                        {r}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleInitLogin} className="space-y-4">
                                {role !== 'admin' && (
                                    <button
                                        type="button"
                                        onClick={handleRegister}
                                        className="w-full py-2 bg-cyan-50/80 text-[#1A3668] font-bold rounded-lg transition-all border border-[#2D7A4D]/30 hover:bg-cyan-100/80 hover:border-[#2D7A4D]/50 flex justify-center items-center gap-2 shadow-sm backdrop-blur-sm"
                                    >
                                        <User className="w-4 h-4" />
                                        Register New {role === 'patient' ? 'Patient' : 'Applicant'}
                                    </button>
                                )}

                                <div className="h-px bg-gradient-to-r from-transparent via-[#1A3668]/20 to-transparent my-6" />

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    className="w-full py-2.5 bg-[#1A3668] text-white font-bold rounded-lg shadow-md hover:bg-[#12264a] hover:shadow-lg transition-all border border-[#1A3668]/50 focus:ring-2 focus:ring-[#2D7A4D] focus:ring-offset-2 focus:outline-none bg-gradient-to-b from-[#1A3668] to-[#12264a]"
                                >
                                    Login as {role.charAt(0).toUpperCase() + role.slice(1)}
                                </motion.button>
                            </form>
                        </motion.div>
                    )}

                    {(formMode === 'login' || formMode === 'register') && (
                        <motion.div
                            key="form"
                            initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
                            className="w-full"
                        >
                            <button onClick={handleBack} className="flex items-center gap-1 text-sm font-medium text-[#1A3668] hover:text-[#2D7A4D] transition-colors mb-6 group">
                                <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" /> Back
                            </button>

                            <h2 className="text-2xl font-bold text-[#1A3668] mb-1">
                                {formMode === 'login' ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-sm text-gray-500 font-medium mb-6">
                                {formMode === 'login' ? `Sign in to your ${role} dashboard` : `Register as a new ${role}`}
                            </p>

                            <form onSubmit={formMode === 'login' ? handleLogin : handleRegisterSubmit} className="space-y-4">
                                {formMode === 'register' && (
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-[#1A3668]/80">Full Name</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={handleNameChange}
                                            placeholder="John Doe"
                                            className={`w-full px-4 py-2.5 rounded-lg border bg-white/50 backdrop-blur-sm focus:ring-2 focus:outline-none transition-all ${errors.fullName ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-[#1A3668]/20 focus:border-[#1A3668] focus:ring-[#1A3668]/20'}`}
                                        />
                                        {errors.fullName && <p className="text-xs text-red-500 font-medium">{errors.fullName}</p>}
                                    </div>
                                )}
                                {renderInput('email', email, setEmail, 'name@example.com', errors.email, 'Email Address')}

                                <div className="space-y-1 w-full">
                                    <label className="text-sm font-semibold text-[#1A3668]/80">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) setErrors({ ...errors, password: '' });
                                        }}
                                        placeholder="••••••••"
                                        className={`w-full px-4 py-2.5 rounded-lg border bg-white/50 backdrop-blur-sm focus:ring-2 focus:outline-none transition-all ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-[#1A3668]/20 focus:border-[#1A3668] focus:ring-[#1A3668]/20'}`}
                                    />
                                    {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password}</p>}
                                    
                                    {formMode === 'register' && password && (
                                        <div className="mt-2 w-full">
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

                                {formMode === 'register' &&
                                    renderInput('password', confirmPassword, setConfirmPassword, '••••••••', errors.confirm, 'Confirm Password')
                                }

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    className="w-full py-2.5 mt-2 bg-[#1A3668] text-white font-bold rounded-lg shadow-md hover:bg-[#12264a] hover:shadow-lg transition-all border border-[#1A3668]/50 focus:ring-2 focus:ring-[#2D7A4D] focus:ring-offset-2 focus:outline-none bg-gradient-to-b from-[#1A3668] to-[#12264a]"
                                >
                                    {formMode === 'login' ? 'Sign In' : 'Complete Registration'}
                                </motion.button>
                            </form>
                        </motion.div>
                    )}

                    {formMode === 'otp' && (
                        <motion.div
                            key="otp"
                            initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
                            className="w-full"
                        >
                            <button onClick={() => setFormMode('register')} className="flex items-center gap-1 text-sm font-medium text-[#1A3668] hover:text-[#2D7A4D] transition-colors mb-6 group">
                                <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" /> Back
                            </button>

                            <h2 className="text-2xl font-bold text-[#1A3668] mb-1">Enter OTP</h2>
                            <p className="text-sm text-gray-500 font-medium mb-6">We've sent a verification code to your email.</p>

                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                {renderInput('text', otp, setOtp, 'Enter OTP', '', 'OTP Code')}

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    className="w-full py-2.5 mt-2 bg-[#1A3668] text-white font-bold rounded-lg shadow-md hover:bg-[#12264a] hover:shadow-lg transition-all border border-[#1A3668]/50 focus:ring-2 focus:ring-[#2D7A4D] focus:ring-offset-2 focus:outline-none bg-gradient-to-b from-[#1A3668] to-[#12264a]"
                                >
                                    Verify OTP
                                </motion.button>
                            </form>
                        </motion.div>
                    )}

                    {formMode === 'success' && (
                        <motion.div
                            key="success"
                            initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
                            className="w-full flex flex-col items-center text-center py-4"
                        >
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm"
                            >
                                <CheckCircle2 className="w-8 h-8 text-[#2D7A4D]" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-[#1A3668] mb-2">Registration Successful!</h2>
                            <p className="text-sm text-gray-500 font-medium mb-6">Please save your unique Patient ID.</p>

                            <div className="w-full p-4 bg-green-50/90 backdrop-blur-sm border border-green-200 rounded-xl mb-8 shadow-inner">
                                <span className="block text-xs text-[#2D7A4D] font-bold mb-2 tracking-wide uppercase">Your Patient ID</span>
                                <code className="text-2xl text-[#1A3668] font-mono font-bold">{generatedId}</code>
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setFormMode('login');
                                    setEmail('');
                                    setFullName('');
                                    setPassword('');
                                    setConfirmPassword('');
                                    setOtp('');
                                }}
                                className="w-full py-2.5 bg-[#2D7A4D] text-white font-bold rounded-lg shadow-md hover:bg-[#1e5a37] hover:shadow-lg transition-all border border-[#2D7A4D]/50 focus:ring-2 focus:ring-[#1A3668] focus:outline-none"
                            >
                                Go to Patient Login
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
