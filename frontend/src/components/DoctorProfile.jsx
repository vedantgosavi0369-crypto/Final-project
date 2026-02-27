import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    User, Award, Briefcase, MapPin, Phone, Clock, Stethoscope,
    Building, Mail, CheckCircle, UploadCloud, File, X, Check, Loader2
} from 'lucide-react';

export default function DoctorProfile() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showOTPBox, setShowOTPBox] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    // Initial state matching user requirements
    const [formData, setFormData] = useState({
        name: 'Dr. Rahul Sharma',
        qualification: 'MBBS, MD (General Medicine)',
        specialization: 'General Physician',
        experience: '8 Years',
        hospital: 'Sunshine Care Clinic',
        location: 'Mumbai',
        contact: '+91-9XXXXXXXXX',
        email: '',
        certificationNumber: '',
        availableTime: '10:00 AM – 6:00 PM (Mon–Sat)', // Reverting to plain string to avoid backend breakages
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
            <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-50 to-indigo-50 -z-10"></div>

                        <div className="w-32 h-32 bg-white rounded-full p-2 shadow-md">
                            <div className="w-full h-full bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                <User size={56} strokeWidth={1.5} />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{formData.name}</h1>
                                <CheckCircle className="text-blue-500 w-6 h-6" />
                            </div>
                            <p className="text-lg text-gray-600 font-medium mb-4">{formData.specialization}</p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <span className="flex items-center gap-1.5 text-sm font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                                    <Award className="w-4 h-4" /> {formData.qualification}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm font-medium bg-green-50 text-green-700 px-3 py-1 rounded-full">
                                    <Briefcase className="w-4 h-4" /> {formData.experience} Experience
                                </span>
                                {formData.certificationNumber && (
                                    <span className="flex items-center gap-1.5 text-sm font-medium bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                                        <Award className="w-4 h-4" /> Cert: {formData.certificationNumber}
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="absolute top-6 right-6 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Edit Profile
                        </button>
                    </motion.div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Clinic Info */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Building className="text-blue-500" /> Clinic Details
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                            <Building className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Clinic Name</p>
                                            <p className="text-gray-900 font-semibold">{formData.hospital}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Location</p>
                                            <p className="text-gray-900 font-semibold">{formData.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 border-t border-gray-100 pt-6">
                                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Availability (Mon-Sat)</p>
                                            <p className="text-gray-900 font-semibold">{formData.availableTime}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Contact Info */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Phone className="text-blue-500" /> Contact Info
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Phone</p>
                                            <p className="text-gray-900 font-semibold">{formData.contact}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Email</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-gray-900 font-semibold">{formData.email || 'Not provided'}</p>
                                                {emailVerified && <CheckCircle className="w-4 h-4 text-green-500" />}
                                            </div>
                                        </div>
                                    </div>
                                    {formData.medicalDocument && (
                                        <div className="flex gap-4 border-t border-gray-100 pt-6">
                                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                                <File className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Medical Document</p>
                                                <p className="text-gray-900 font-semibold">{formData.medicalDocument.name}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Services */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Stethoscope className="text-blue-500" /> Services Offered
                            </h3>
                            {formData.services ? (
                                <div className="flex flex-wrap gap-3">
                                    {formData.services.split(',').map((service, idx) => {
                                        const srv = service.trim();
                                        if (!srv) return null;
                                        return (
                                            <div key={idx} className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                {srv}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No services listed yet.</p>
                            )}
                        </div>
                    </motion.div>

                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden shadow-blue-900/5">

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
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Qualification</label>
                                <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Specialization</label>
                                <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Experience</label>
                                <input type="text" name="experience" value={formData.experience} onChange={handleChange} required
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
                                <input type="text" name="hospital" value={formData.hospital} onChange={handleChange} required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Location</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Contact Number</label>
                                <input type="text" name="contact" value={formData.contact} onChange={handleChange} required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all" />
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
                                    <input
                                        type="text"
                                        name="availableTime" value={formData.availableTime} onChange={handleChange} required
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all pr-10"
                                    />
                                    <Clock className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
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
