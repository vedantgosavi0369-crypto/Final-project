import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { supabase } from '../utils/supabaseClient';
import BedTicker from '../components/BedTicker';
import QRCodeGenerator from '../components/QRCodeGenerator';
import QRScanner from '../components/QRScanner';
import EmergencyOverride from '../components/EmergencyOverride';
import ZeroTrustGatekeeper from '../components/ZeroTrustGatekeeper';
import ClinicalSummarizer from '../components/ClinicalSummarizer';
import { User, Activity, FileText, Phone } from 'lucide-react';

export default function Dashboard() {
    const [showGatekeeper, setShowGatekeeper] = useState(false);
    const [activeRecordHash, setActiveRecordHash] = useState('');
    const [scanning, setScanning] = useState(false);
    const [scanError, setScanError] = useState('');
    const [unlockedTier, setUnlockedTier] = useState('none'); // none, life_packet, vault
    const [isLoading, setIsLoading] = useState(true);
    const [patient, setPatient] = useState({
        id: '',
        name: '',
        age: 0,
        bloodGroup: '',
        emergencyContact: '',
        walletAddress: ''
    });

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                // Assuming we get the currently logged in user session
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !sessionData?.session) {
                    // Handle no session (e.g., redirect or mock for dev)
                    // For now, we will just stop loading to show the UI
                    setIsLoading(false);
                    return;
                }

                const user = sessionData.session.user;

                // Fetch from your 'patients' table (adjust table name if needed)
                const { data, error } = await supabase
                    .from('patients')
                    .select('id, full_name, blood_group, emergency_contact, wallet_address, age')
                    .eq('user_id', user.id) // Assuming 'user_id' links to auth.users
                    .single();

                if (error) throw error;

                if (data) {
                    setPatient({
                        id: data.id || 'N/A',
                        name: data.full_name || 'Unknown',
                        age: data.age || 0,
                        bloodGroup: data.blood_group || 'Unknown',
                        emergencyContact: data.emergency_contact || '',
                        walletAddress: data.wallet_address || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching patient data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPatientData();
    }, []);

    // Simulated Legacy Import Data Sanitization
    const sampleClinicalNotes = DOMPurify.sanitize("Patient presented with a 3-day history of acute shortness of breath and mild chest pain. Vital signs indicate elevated heart rate. ECG shows sinus tachycardia without ischemic changes. Patient denies recent travel or exposure to illness. Past medical history significant for mild asthma controlled on albuterol PRN. Plan: Order stat chest X-ray and D-dimer to rule out PE, continue close monitoring.");

    const handleDocumentClick = (hash, tier) => {
        if (tier === 'vault' && unlockedTier !== 'vault') {
            setActiveRecordHash(hash);
            setShowGatekeeper(true);
        } else {
            alert(`Securely viewing ${tier} document...`);
        }
    };

    const handleScanToTreat = async () => {
        setScanError('');
        setScanning(true);
    };

    const onDecode = async (decodedText) => {
        setScanning(false);
        try {
            const patientIdInput = decodedText;
            const password = prompt('Re-enter your password to verify (step-up auth):');
            if (!password) return;
            const { data: sessionData } = await supabase.auth.getSession();
            const doctorEmail = sessionData?.session?.user?.email;
            const res = await fetch('/api/scan-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorEmail, patientId: patientIdInput, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'failed');
            alert(`Access granted. Token: ${data.token}\nExpires at: ${data.expiresAt}`);
        } catch (err) {
            console.error('Scan-to-Treat failure', err);
            setScanError(err.message);
            alert('Scan-to-Treat failed: ' + err.message);
        }
    };

    const onScanError = (err) => {
        console.warn('QR scan error', err);
        setScanError('Camera error: ' + err);
        setScanning(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--color-dashboard-bg)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[var(--color-primary-cyan)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Loading Patient Data...</p>
                </div>
            </div>
        );
    }

    // when camera scanning is active, show scanner overlay
    if (scanning) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
                <div className="bg-white rounded-lg p-4 shadow-lg max-w-md w-full">
                    <h2 className="text-lg font-bold mb-2">Scan QR Code</h2>
                    <QRScanner onDecode={onDecode} onError={onScanError} />
                    {scanError && (
                        <p className="text-red-500 text-sm mt-2">{scanError}</p>
                    )}
                    <button
                        onClick={() => {
                            setScanning(false);
                            setScanError('');
                        }}
                        className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-dashboard-bg)] p-6 lg:p-12 font-sans">

            {/* Top Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Patient Dashboard</h1>
                    <p className="text-gray-500 font-medium">Dr. Smith • General Medicine</p>
                </div>
                <div className="flex items-center gap-4">
                    <BedTicker availableBeds={14} lastUpdated={new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()} />
                    <EmergencyOverride
                        patientId={patient.id}
                        onOverrideSuccess={() => setUnlockedTier('life_packet')}
                    />
                    <button
                        onClick={handleScanToTreat}
                        className="py-2 px-4 bg-[#2D7A4D] text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                    >Scan-to-Treat</button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Patient Info */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-1 space-y-6"
                >
                    {/* Patient Profile Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-blue-50 text-[var(--color-primary-cyan)] rounded-full flex items-center justify-center">
                                <User strokeWidth={1.5} className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
                                <span className="text-xs font-bold text-[var(--color-primary-cyan)] bg-blue-50 px-2 py-1 rounded-full">{patient.id}</span>
                            </div>
                        </div>
                        {/* QR code for patient ID - share with doctor */}
                        {patient.id && (
                            <div className="mt-4 text-center">
                                <p className="text-xs text-gray-500 mb-2">Share this QR with your doctor</p>
                                <QRCodeGenerator value={patient.id} size={160} />
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Activity className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">Blood Group:</span>
                                <span className="font-semibold text-red-500">{patient.bloodGroup}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">Age:</span>
                                <span className="font-semibold text-gray-900">{patient.age} yrs</span>
                            </div>
                            {patient.emergencyContact && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Emergency:</span>
                                    <span className="font-semibold text-gray-900">{patient.emergencyContact}</span>
                                </div>
                            )}
                            {patient.walletAddress && (
                                <div className="flex items-center gap-3 text-sm mt-4 pt-4 border-t border-gray-100">
                                    <span className="text-xs font-mono text-gray-500 truncate w-full" title={patient.walletAddress}>
                                        Wallet: {patient.walletAddress.substring(0, 6)}...{patient.walletAddress.substring(patient.walletAddress.length - 4)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <ClinicalSummarizer clinicalText={sampleClinicalNotes} />

                </motion.div>

                {/* Right Column: Medical Records */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2"
                >
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4 flex items-center gap-2">
                            <FileText className="text-[var(--color-primary-cyan)]" />
                            Medical Records
                        </h3>

                        <div className="space-y-4">

                            {/* Life Packet (Accessible publicly or via Emergency) */}
                            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-800">Life Packet</h4>
                                    <p className="text-xs text-gray-500">Allergies, Emergency Contacts</p>
                                </div>
                                {unlockedTier === 'life_packet' || unlockedTier === 'vault' ? (
                                    <button className="px-4 py-2 text-sm font-semibold bg-[var(--color-primary-cyan)] text-white rounded-lg hover:bg-cyan-600 transition-colors">
                                        View
                                    </button>
                                ) : (
                                    <span className="text-xs font-semibold text-gray-400 px-3 py-1 bg-gray-200 rounded-full">Locked</span>
                                )}
                            </div>

                            {/* The Vault */}
                            <div className="p-4 rounded-xl border border-gray-200 bg-blue-50/50 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-[var(--color-primary-cyan)]">The Vault</h4>
                                    <p className="text-xs text-gray-500">Highly sensitive records (Zero-Trust Required)</p>
                                </div>
                                <button
                                    onClick={() => handleDocumentClick('0xabc123...', 'vault')}
                                    className="px-4 py-2 text-sm font-semibold bg-[var(--color-secondary-olive)] text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                >
                                    {unlockedTier === 'vault' ? 'View Crypto-PDF' : 'Request Access'}
                                </button>
                            </div>

                        </div>
                    </div>
                </motion.div>

            </div>

            {showGatekeeper && (
                <ZeroTrustGatekeeper
                    recordHash={activeRecordHash}
                    onClose={() => setShowGatekeeper(false)}
                    onDecryptSuccess={() => {
                        setShowGatekeeper(false);
                        setUnlockedTier('vault');
                    }}
                />
            )}

        </div>
    );
}
