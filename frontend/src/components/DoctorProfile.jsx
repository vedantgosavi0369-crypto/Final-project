import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    User, Award, Briefcase, MapPin, Phone, Clock, Stethoscope,
    Building, Mail, CheckCircle, UploadCloud, File, X, Check, Loader2, ArrowLeft, ShieldAlert, ChevronDown, Search
} from 'lucide-react'; import { useNavigate } from 'react-router-dom';

export default function DoctorProfile() {
    const navigate = useNavigate();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showOTPBox, setShowOTPBox] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    // Country Code State
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');
    const [selectedCountry, setSelectedCountry] = useState({ code: '+91', flag: '🇮🇳', name: 'India' });
    const [phoneNumber, setPhoneNumber] = useState('');
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowCountryDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const countries = [
        { code: '+1', flag: '🇺🇸', name: 'United States' },
        { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
        { code: '+91', flag: '🇮🇳', name: 'India' },
        { code: '+61', flag: '🇦🇺', name: 'Australia' },
        { code: '+81', flag: '🇯🇵', name: 'Japan' },
        { code: '+49', flag: '🇩🇪', name: 'Germany' },
        { code: '+33', flag: '🇫🇷', name: 'France' },
        { code: '+39', flag: '🇮🇹', name: 'Italy' },
        { code: '+55', flag: '🇧🇷', name: 'Brazil' },
        { code: '+86', flag: '🇨🇳', name: 'China' },
        { code: '+971', flag: '🇦🇪', name: 'United Arab Emirates' },
        { code: '+65', flag: '🇸🇬', name: 'Singapore' },
    ];

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.code.includes(countrySearch)
    );

    // Initial state matching user requirements
    const [formData, setFormData] = useState({
        name: '',
        qualification: '',
        specialization: '',
        experience: '',
        hospital: '',
        location: '',
        contact: '',
        email: '',
        certificationNumber: '',
        availableTime: '',
        services: '',
        medicalDocument: null
    });

    const timeSlots = [
        "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM",
        "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhoneChange = (e) => {
        const val = e.target.value.replace(/\D/g, ''); // Only allow numbers
        setPhoneNumber(val);
        // Combine seamlessly for backend compatibility
        setFormData({ ...formData, contact: `${selectedCountry.code}-${val}` });
    };

    const selectCountry = (country) => {
        setSelectedCountry(country);
        setShowCountryDropdown(false);
        setCountrySearch('');
        setFormData({ ...formData, contact: `${country.code}-${phoneNumber}` });
    };

    const handleVerifyEmail = async () => {
        if (!formData.email) {
            alert("Please enter an email to verify.");
            return;
        }

        // Enter "Waiting" state
        setIsVerifying(true);

        try {
            // Trigger backend email send 
            const res = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });
            if (!res.ok) throw new Error("Failed to initiate verification");

            setIsVerifying(false);
            setShowOTPBox(true);
            alert(`An OTP has been sent to ${formData.email}. Please check your inbox and enter the 6-digit code.`);
        } catch (err) {
            console.error(err);
            alert("Error sending verification email. Please try again.");
            setIsVerifying(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (otpValue.length >= 4) {
            try {
                const res = await fetch('/api/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: formData.email, otp: otpValue })
                });
                const data = await res.json();

                if (res.ok) {
                    setEmailVerified(true);
                    setShowOTPBox(false);
                } else {
                    alert(data.error || "Invalid OTP. Please try again.");
                }
            } catch (err) {
                console.error(err);
                alert("Error verifying OTP. Please try again.");
            }
        } else {
            alert("Please enter a valid OTP.");
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFormData({ ...formData, medicalDocument: e.dataTransfer.files[0] });
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, medicalDocument: e.target.files[0] });
        }
    };

    const removeFile = () => {
        setFormData({ ...formData, medicalDocument: null });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100 max-w-lg w-full text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#1A3668]"></div>

                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm">
                        <ShieldAlert className="w-12 h-12 text-[#1A3668]" />
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted</h2>

                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6 text-left">
                        <p className="text-gray-700 leading-relaxed mb-2">
                            Dear <strong>{formData.name || 'Doctor'}</strong>, your registration application has been successfully sent to the administration team.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            For security purposes, an Admin must verify your credentials and medical documents before your account is activated. You will receive an email once your profile is verified, after which you can log in.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-[#1A3668] hover:bg-[#12264a] text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" /> Return to Login Page
                    </button>

                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center relative">
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-[#1A3668] transition-colors font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Login
            </button>

            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden shadow-blue-900/5 mt-8 md:mt-0">

                {/* Header */}
                <div className="bg-[#1A3668] px-8 py-6 text-white text-center">
                    <h2 className="text-3xl font-bold tracking-tight">Doctor Profile</h2>
                    <p className="text-blue-200 mt-2 font-medium">Register as a new healthcare practitioner</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">

                    {/* Basic Info */}
                    <div>
                        <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800 flex items-center gap-2">
                            <User className="w-5 h-5 text-[#2D7A4D]" /> Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Dr. Jane Smith"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Qualification</label>
                                <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} required placeholder="e.g. MBBS, MD"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Specialization</label>
                                <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} required placeholder="e.g. Cardiologist"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Experience</label>
                                <input type="text" name="experience" value={formData.experience} onChange={handleChange} required placeholder="e.g. 10 Years"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Certification Number</label>
                                <input type="text" name="certificationNumber" value={formData.certificationNumber} onChange={handleChange} placeholder="e.g. MED-84729"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Contact & Professional */}
                    <div>
                        <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-[#2D7A4D]" /> Professional Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Clinic / Hospital</label>
                                <input type="text" name="hospital" value={formData.hospital} onChange={handleChange} required placeholder="e.g. City General Hospital"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Location</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="e.g. New York, NY"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all" />
                            </div>
                            <div className="space-y-1 relative" ref={dropdownRef}>
                                <label className="text-sm font-semibold text-gray-700">Contact Number</label>
                                <div className="flex gap-2">
                                    {/* Country Selector Button */}
                                    <button
                                        type="button"
                                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                        className="flex items-center justify-between gap-1 px-3 py-2.5 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors shrink-0 min-w-[90px]"
                                    >
                                        <span className="text-lg">{selectedCountry.flag}</span>
                                        <span className="font-medium text-gray-700">{selectedCountry.code}</span>
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </button>

                                    {/* Phone Number Input */}
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={handlePhoneChange}
                                        required
                                        maxLength="15"
                                        placeholder="e.g. 9876543210"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Custom Dropdown */}
                                {showCountryDropdown && (
                                    <div className="absolute top-[76px] left-0 w-[280px] bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                        <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                                            <div className="relative">
                                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    placeholder="Search country or code..."
                                                    value={countrySearch}
                                                    onChange={(e) => setCountrySearch(e.target.value)}
                                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A3668]"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {filteredCountries.length > 0 ? (
                                                filteredCountries.map(c => (
                                                    <button
                                                        key={c.code + c.name}
                                                        type="button"
                                                        onClick={() => selectCountry(c)}
                                                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 transition-colors text-left"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xl">{c.flag}</span>
                                                            <span className="font-medium text-gray-700 text-sm">{c.name}</span>
                                                        </div>
                                                        <span className="text-gray-500 font-mono text-xs">{c.code}</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-sm text-gray-500">No countries found</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 flex justify-between">
                                    Email Address
                                    {emailVerified && <span className="text-green-600 text-xs flex items-center gap-1"><Check w={12} h={12} /> Verified</span>}
                                </label>
                                <div className="flex gap-2">
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="doctor@example.com"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all" />
                                    <button
                                        type="button" onClick={handleVerifyEmail}
                                        disabled={emailVerified || isVerifying}
                                        className={`px-4 py-2.5 font-semibold rounded-lg border transition-colors whitespace-nowrap flex items-center gap-2 ${emailVerified
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : isVerifying
                                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isVerifying ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : emailVerified ? (
                                            "Verified"
                                        ) : (
                                            "Verify"
                                        )}
                                    </button>
                                </div>
                            </div>
                            {showOTPBox && (
                                <div className="space-y-1 md:col-span-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100 mt-2">
                                    <label className="text-sm font-semibold text-gray-700">Enter OTP sent to Email</label>
                                    <div className="flex gap-2">
                                        <input type="text" value={otpValue} onChange={(e) => setOtpValue(e.target.value)} placeholder="000000" maxLength={6}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all tracking-widest font-mono text-center" />
                                        <button type="button" onClick={handleVerifyOTP}
                                            className="px-6 py-2.5 bg-[#1A3668] text-white font-semibold rounded-lg hover:bg-[#12264a] transition-colors whitespace-nowrap">
                                            Confirm OTP
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700">Available Time (Mon - Sat)</label>
                                <div className="relative">
                                    <select
                                        name="availableTime"
                                        value={formData.availableTime}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
                                    >
                                        <option value="" disabled>Select your shift timing</option>
                                        <option value="9:00 AM - 5:00 PM (Morning Priority)">9:00 AM - 5:00 PM (Morning Priority)</option>
                                        <option value="10:00 AM - 6:00 PM (Standard Shift)">10:00 AM - 6:00 PM (Standard Shift)</option>
                                        <option value="12:00 PM - 8:00 PM (Afternoon Shift)">12:00 PM - 8:00 PM (Afternoon Shift)</option>
                                        <option value="3:00 PM - 11:00 PM (Evening Shift)">3:00 PM - 11:00 PM (Evening Shift)</option>
                                        <option value="Flexible / By Appointment Only">Flexible / By Appointment Only</option>
                                    </select>
                                    <Clock className="w-5 h-5 text-[#1A3668] absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700">Services Offered (Comma Separated)</label>
                                <textarea name="services" value={formData.services} onChange={handleChange} placeholder="e.g. Consultations, Flu Shots, Checkups" rows={3}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all resize-none" />
                            </div>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div>
                        <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800 flex items-center gap-2">
                            <File className="w-5 h-5 text-[#2D7A4D]" /> Medical Documents
                        </h3>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Upload Identity / License Document</label>

                            <div
                                className={`mt-2 border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive ? 'border-[#1A3668] bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}`}
                                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.png,.jpg,.jpeg"
                                />

                                {formData.medicalDocument ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <File className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-900 truncate max-w-xs">{formData.medicalDocument.name}</p>
                                            <p className="text-xs text-gray-500">{(formData.medicalDocument.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeFile(); }}
                                            className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center cursor-pointer">
                                        <UploadCloud className={`w-12 h-12 mb-3 ${dragActive ? 'text-[#1A3668]' : 'text-gray-400'}`} />
                                        <p className="font-medium text-gray-700 text-lg">Click to Upload or Drag and Drop</p>
                                        <p className="text-sm text-gray-500 mt-1">PDF, PNG, JPG up to 10MB</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-[#1A3668] hover:bg-[#12264a] text-white font-bold py-3.5 rounded-xl transition-colors text-lg shadow-lg flex items-center justify-center gap-2"
                        >
                            Save Profile & Complete Registration
                        </motion.button>
                    </div>

                </form>
            </div>
        </div>
    );
}
