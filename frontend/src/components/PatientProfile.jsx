import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Activity, AlertCircle, Phone, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';

export default function PatientProfile() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        bloodGroup: '',
        allergies: '',
        chronicConditions: '',
        emergencyContactName: '',
        emergencyContactNumber: ''
    });

    React.useEffect(() => {
        try {
            const stored = localStorage.getItem('patientProfileData');
            if (stored) {
                const parsed = JSON.parse(stored);
                setFormData(prev => ({ ...prev, ...parsed }));
            }
        } catch (e) { }
    }, []);

    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulating a backend save delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Save the comprehensive data to local storage for the demo
        // In reality, this would be an upsert to the `patients` table in Supabase
        localStorage.setItem('patientProfileData', JSON.stringify(formData));

        setIsSaving(false);
        // Pass the patient role to the dashboard so they land on their own dashboard natively
        navigate('/dashboard', { state: { role: 'patient' } });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden shadow-blue-900/5 mt-8 md:mt-0">

                {/* Header */}
                <div className="bg-[#1A3668] px-8 py-8 text-white text-center relative overflow-hidden">
                    <HeartPulse className="absolute -right-6 -bottom-6 w-32 h-32 text-white opacity-10" />
                    <h2 className="text-3xl font-bold tracking-tight">Health Profile Setup</h2>
                    <p className="text-blue-200 mt-2 font-medium">Complete your medical data for the Zero-Trust QR Generation</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">

                    {/* Basic Health Vitals */}
                    <div>
                        <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-[#2D7A4D]" /> Basic Vitals
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="e.g. John Doe"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Age</label>
                                <input type="number" name="age" value={formData.age} onChange={handleChange} required placeholder="e.g. 35"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Blood Group</label>
                                <select
                                    name="bloodGroup"
                                    value={formData.bloodGroup}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all bg-white"
                                >
                                    <option value="" disabled>Select Blood Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Medical Conditions */}
                    <div>
                        <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" /> Medical Conditions (Optional)
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Allergies</label>
                                <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="e.g. Penicillin, Peanuts (Comma separated)"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Chronic Conditions</label>
                                <input type="text" name="chronicConditions" value={formData.chronicConditions} onChange={handleChange} placeholder="e.g. Asthma, Diabetes Type 2 (Comma separated)"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div>
                        <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-[#1A3668]" /> Emergency Contact
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Contact Name</label>
                                <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} required placeholder="e.g. John Doe (Brother)"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Contact Number</label>
                                <input type="tel" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} required placeholder="e.g. +1 555-0198"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A3668] focus:border-transparent transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-6 flex items-start gap-4">
                        <ShieldCheck className="w-8 h-8 text-[#2D7A4D] shrink-0 mt-1" />
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Your medical details are kept strictly confidential. When you generate a Health QR on your dashboard, this information will be encapsulated directly into the QR code for rapid "Scan-to-Treat" access by medical professionals during emergencies.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard', { state: { role: 'patient' } })}
                            disabled={isSaving}
                            className={`w-full sm:w-1/3 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl transition-colors text-lg shadow-sm border border-gray-200 ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                        >
                            Cancel
                        </button>
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSaving}
                            className={`w-full sm:w-2/3 bg-[#1A3668] text-white font-bold py-3.5 rounded-xl transition-colors text-lg shadow-lg flex items-center justify-center gap-2 ${isSaving ? 'opacity-80 cursor-not-allowed hover:bg-[#1A3668]' : 'hover:bg-[#12264a]'}`}
                        >
                            {isSaving ? 'Encrypting & Saving...' : 'Save Health Profile'}
                            {!isSaving && <ArrowRight className="w-5 h-5" />}
                        </motion.button>
                    </div>

                </form>
            </div>
        </div>
    );
}
