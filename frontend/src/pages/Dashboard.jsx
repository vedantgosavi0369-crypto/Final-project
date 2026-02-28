import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { supabase } from '../utils/supabaseClient';
import QRCodeGenerator from '../components/QRCodeGenerator';
import QRScanner from '../components/QRScanner';
import EmergencyOverride from '../components/EmergencyOverride';
import ZeroTrustGatekeeper from '../components/ZeroTrustGatekeeper';
import ClinicalSummarizer from '../components/ClinicalSummarizer';
import { User, Activity, FileText, Phone, Clock, AlertCircle, CheckCircle2, ChevronRight, UploadCloud, Lock, File, X, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();

    // Default to patient if state is missing (for direct navigation or old sessions)
    const role = location.state?.role || 'patient';
    const initialEmail = location.state?.email || '';

    const [showGatekeeper, setShowGatekeeper] = useState(false);
    const [activeRecordHash, setActiveRecordHash] = useState('');
    const [scanning, setScanning] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [scanError, setScanError] = useState('');
    const [unlockedTier, setUnlockedTier] = useState('none'); // none, life_packet, vault
    const [isLoading, setIsLoading] = useState(true);
    const [missingFields, setMissingFields] = useState([]);
    const [patient, setPatient] = useState({
        id: '',
        name: '',
        age: 0,
        bloodGroup: '',
        email: initialEmail,
        emergencyContact: '',
        walletAddress: ''
    });

    // Doctor dashboard specific state for scanned patient
    const [scannedPatient, setScannedPatient] = useState(null);

    // Doctor profile data loaded from local storage
    // Doctor Profile Data
    const [doctorProfile, setDoctorProfile] = useState({
        name: '',
        degree: '',
        registrationNumber: '',
        hospital: ''
    });

    // Real-time ID Search & Polling State
    const [idSearchQuery, setIdSearchQuery] = useState('');
    const [requestStatus, setRequestStatus] = useState('idle'); // idle | pending | approved | denied
    const [activeRequestId, setActiveRequestId] = useState(null);
    const [incomingRequest, setIncomingRequest] = useState(null); // For patients

    const [accessExpiryTime, setAccessExpiryTime] = useState(null);

    // Medical Records Vault State
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [newRecordTitle, setNewRecordTitle] = useState('');
    const [newRecordFile, setNewRecordFile] = useState(null);

    // Dummy data for Blood Pressure Chart
    const bpData = [
        { date: 'Oct 12', systolic: 120, diastolic: 80 },
        { date: 'Nov 05', systolic: 122, diastolic: 82 },
        { date: 'Dec 01', systolic: 118, diastolic: 78 },
        { date: 'Jan 15', systolic: 125, diastolic: 85 },
        { date: 'Feb 10', systolic: 121, diastolic: 81 },
        { date: 'Feb 26', systolic: 119, diastolic: 79 },
    ];

    useEffect(() => {
        const fetchPatientData = async () => {
            if (role === 'doctor') {
                setIsLoading(false); // Doctors don't load patient data on mount
                return;
            }

            try {
                // Determine user source (actual supabase session vs mock state navigation)
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

                let fetchUserId = null;
                let fetchEmail = initialEmail;

                if (!sessionError && sessionData?.session) {
                    fetchUserId = sessionData.session.user.id;
                    fetchEmail = sessionData.session.user.email;
                }

                if (fetchUserId) {
                    const { data, error } = await supabase
                        .from('patients')
                        .select('id, patient_id, full_name, blood_group, emergency_contact, wallet_address, age, email')
                        .eq('id', fetchUserId)
                        .single();

                    if (!error && data) {
                        setPatient({
                            id: data.patient_id || data.id || 'N/A',
                            name: data.full_name || 'Unknown',
                            age: data.age || 0,
                            bloodGroup: data.blood_group || 'Unknown',
                            email: data.email || fetchEmail,
                            emergencyContact: data.emergency_contact || '',
                            walletAddress: data.wallet_address || ''
                        });
                    }
                } else if (location.state?.patientId) {
                    // Fallback for mock navigation
                    setPatient(prev => ({ ...prev, id: location.state.patientId, email: fetchEmail }));
                }

                // MERGE LOCAL STORAGE PROFILE DATA FOR MVP HACKATHON
                try {
                    if (role === 'patient') {
                        const stored = localStorage.getItem('patientProfileData');
                        if (stored) {
                            const parsed = JSON.parse(stored);
                            setPatient(prev => ({
                                ...prev,
                                name: prev.name && prev.name !== 'Unknown' ? prev.name : (parsed.fullName || prev.name),
                                age: prev.age || parsed.age,
                                bloodGroup: prev.bloodGroup && prev.bloodGroup !== 'Unknown' ? prev.bloodGroup : (parsed.bloodGroup || prev.bloodGroup),
                                emergencyContact: prev.emergencyContact || parsed.emergencyContactNumber,
                                allergies: parsed.allergies,
                                chronicConditions: parsed.chronicConditions
                            }));
                        }
                    } else if (role === 'doctor') {
                        const docStored = localStorage.getItem('doctorProfileData');
                        if (docStored) {
                            const docParsed = JSON.parse(docStored);
                            setDoctorProfile({
                                name: docParsed.fullName || `Dr. ${fetchEmail?.split('@')[0] || 'Unknown'}`,
                                degree: docParsed.degree || 'MBBS, MD',
                                registrationNumber: docParsed.medicalRegistrationNumber || 'MED-XXXX-YYYY',
                                hospital: docParsed.hospitalAffiliation || 'General Hospital'
                            });
                        } else {
                            setDoctorProfile({
                                name: `Dr. ${fetchEmail?.split('@')[0] || 'Smith'}`,
                                degree: 'MBBS, MD',
                                registrationNumber: 'MED-1234-5678',
                                hospital: 'City General Hospital'
                            });
                        }
                    }
                } catch (e) {
                    console.error("Local storage parse error", e);
                }

                // LOAD MEDICAL RECORDS FOR PATIENT
                if (role === 'patient') {
                    try {
                        const storedRecords = localStorage.getItem('patientMedicalRecords');
                        if (storedRecords) {
                            setMedicalRecords(JSON.parse(storedRecords));
                        }
                    } catch (e) { }
                }

            } catch (error) {
                console.error('Error fetching patient data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPatientData();
    }, [role, location.state, initialEmail]);

    // Timer to automatically revoke access when token expires
    useEffect(() => {
        let timer;
        if (accessExpiryTime) {
            const timeRemaining = new Date(accessExpiryTime).getTime() - Date.now();
            if (timeRemaining > 0) {
                timer = setTimeout(() => {
                    setScannedPatient(null);
                    setAccessExpiryTime(null);
                    setUnlockedTier('none');
                    alert("Patient data access has expired.");
                }, timeRemaining);
            } else {
                setScannedPatient(null);
                setAccessExpiryTime(null);
                setUnlockedTier('none');
            }
        }
        return () => clearTimeout(timer);
    }, [accessExpiryTime]);

    // Patient: Poll for incoming doctor access requests
    useEffect(() => {
        if (role !== 'patient' || !patient.id) return;

        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/check-access-requests?patientId=${patient.id}`);
                const data = await res.json();

                if (data.request && (!incomingRequest || incomingRequest.requestId !== data.request.requestId)) {
                    setIncomingRequest(data.request);
                }
            } catch (err) {
                // Ignore network polling errors in dev
            }
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(pollInterval);
    }, [role, patient.id, incomingRequest]);

    // Patient: Handle Request Approval/Denial
    const handleRequestDecision = async (status) => {
        if (!incomingRequest) return;

        try {
            // Build the patient data payload
            let extraProfileData = {};
            try {
                const stored = localStorage.getItem('patientProfileData');
                if (stored) extraProfileData = JSON.parse(stored);
            } catch (e) { }

            const patientDataPayload = {
                ...patient,
                ...extraProfileData,
                medicalRecords: medicalRecords, // Include uploaded documents!
                isHackathonDemo: true
            };

            await fetch('/api/approve-access-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: incomingRequest.requestId,
                    status: status, // 'approved' or 'denied'
                    patientData: status === 'approved' ? patientDataPayload : null
                })
            });

            if (status === 'approved') {
                alert("Access approved! The doctor can now view your records.");
            } else {
                alert("Access denied.");
            }

            setIncomingRequest(null);

        } catch (err) {
            console.error("Error responding to request", err);
            alert("Failed to send response.");
        }
    };

    // Patient: Upload new medical record
    const handleRecordSubmit = (e) => {
        e.preventDefault();
        if (!newRecordTitle.trim()) return;

        const newRecord = {
            id: `doc_${Date.now()}`,
            title: newRecordTitle,
            date: new Date().toLocaleDateString(),
            type: newRecordFile ? newRecordFile.name.split('.').pop() : 'pdf',
            size: newRecordFile ? `${(newRecordFile.size / 1024).toFixed(1)} KB` : '1.2 MB',
            hash: `0x${Math.random().toString(16).substr(2, 40)}` // Mock blockchain hash
        };

        const updatedRecords = [newRecord, ...medicalRecords];
        setMedicalRecords(updatedRecords);
        localStorage.setItem('patientMedicalRecords', JSON.stringify(updatedRecords));

        setNewRecordTitle('');
        setNewRecordFile(null);
        setShowUploadModal(false);
    };

    // Evaluate missing fields for Patient Profile Completion Grid
    useEffect(() => {
        if (role !== 'patient') return;

        let extraProfileData = {};
        try {
            const stored = localStorage.getItem('patientProfileData');
            if (stored) extraProfileData = JSON.parse(stored);
        } catch (e) { }

        const requiredFields = [
            { key: 'name', label: 'Full Name', value: patient.name },
            { key: 'age', label: 'Age', value: patient.age },
            { key: 'bloodGroup', label: 'Blood Group', value: patient.bloodGroup },
            { key: 'emergencyContact', label: 'Emergency Contact', value: patient.emergencyContact },
            { key: 'allergies', label: 'Allergies', value: patient.allergies },
            { key: 'chronicConditions', label: 'Medical History', value: patient.chronicConditions }
        ];

        const missing = requiredFields.filter(f => !f.value || String(f.value).trim() === '' || f.value === 0);
        setMissingFields(missing);
    }, [patient, role]);

    // Doctor: Poll for patient approval once a request is active
    useEffect(() => {
        if (role !== 'doctor' || !activeRequestId || requestStatus !== 'pending') return;

        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/check-request-status?requestId=${activeRequestId}`);
                const data = await res.json();

                if (data.status === 'approved' && data.patientData) {
                    clearInterval(pollInterval);
                    setRequestStatus('approved');
                    setScannedPatient(data.patientData);
                    setAccessExpiryTime(new Date(Date.now() + 15 * 60 * 1000).toISOString()); // 15 mins
                    setUnlockedTier('life_packet');
                    alert("Patient approved access!");
                } else if (data.status === 'denied') {
                    clearInterval(pollInterval);
                    setRequestStatus('denied');
                    setActiveRequestId(null);
                    alert("Patient denied access.");
                }
            } catch (err) {
                console.error("Error checking request status", err);
            }
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(pollInterval);
    }, [role, activeRequestId, requestStatus]);

    const handleIDRequest = async (e) => {
        e.preventDefault();
        if (!idSearchQuery.trim()) return;

        try {
            setRequestStatus('pending');
            const res = await fetch('/api/request-patient-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorEmail: doctorProfile.name || initialEmail || 'doctor@example.com',
                    patientId: idSearchQuery.trim()
                })
            });

            const data = await res.json();
            if (res.ok) {
                setActiveRequestId(data.requestId);
            } else {
                setRequestStatus('idle');
                alert(data.error || 'Failed to initiate request');
            }
        } catch (err) {
            setRequestStatus('idle');
            alert("Network error. Could not send request.");
        }
    };

    const handleRunSimulation = async () => {
        setIdSearchQuery('DEMO-2026-XQZ');
        setRequestStatus('pending');

        // Wait 1.5 seconds to simulate network request and patient approval
        await new Promise(resolve => setTimeout(resolve, 1500));

        setRequestStatus('approved');

        // Populate realistic comprehensive patient data
        const demoPatient = {
            id: 'DEMO-2026-XQZ',
            name: 'Sarah Connor',
            age: 42,
            bloodGroup: 'O+',
            email: 'sarah.connor@example.com',
            emergencyContact: '(555) 019-8472',
            walletAddress: '0x1A2b3C4d5E6f7G8h9I0J1K2L3M4N5O6P7Q8R9S0T',
            allergies: 'Penicillin, Peanuts',
            chronicConditions: 'Asthma, Mild Hypertension',
            medicalRecords: [
                { id: 'doc_1', title: 'Cardiac MRI Results', date: '2026-01-15', type: 'pdf', size: '12.4 MB', hash: '0xabc123456def7890abc' },
                { id: 'doc_2', title: 'Comprehensive Blood Panel', date: '2025-11-22', type: 'pdf', size: '4.2 MB', hash: '0xdef789012abc3456def' },
                { id: 'doc_3', title: 'Vaccination History', date: '2024-08-10', type: 'png', size: '1.1 MB', hash: '0x7890abc123456def789' }
            ],
            isHackathonDemo: true
        };

        setScannedPatient(demoPatient);
        // Set expiry for 1 hour
        setAccessExpiryTime(new Date(Date.now() + 60 * 60 * 1000).toISOString());
        setUnlockedTier('life_packet');
    };

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

    const getHealthQRPayload = () => {
        let extraProfileData = {};
        try {
            const stored = localStorage.getItem('patientProfileData');
            if (stored) extraProfileData = JSON.parse(stored);
        } catch (e) { }

        // Return a compact JSON string representing the full patient state + extra profile data
        return JSON.stringify({
            ...patient,
            ...extraProfileData,
            isHealthQR: true
        });
    };

    const fetchScannedPatientData = async (patientId) => {
        try {
            // Fetch real data from supabase if available
            const { data, error } = await supabase
                .from('patients')
                .select('id, patient_id, full_name, blood_group, emergency_contact, wallet_address, age, email')
                .or(`patient_id.eq."${patientId}",id.eq."${patientId}"`)
                .single();

            if (!error && data) {
                setScannedPatient({
                    id: data.patient_id || data.id || patientId,
                    name: data.full_name || 'Unknown Patient',
                    age: data.age || 0,
                    bloodGroup: data.blood_group || 'Unknown',
                    email: data.email || '',
                    emergencyContact: data.emergency_contact || '',
                    walletAddress: data.wallet_address || ''
                });
            } else {
                // Fallback mock data if DB fails or record doesn't exist
                console.warn("Could not fetch real scanned patient data, using mock data", error);
                setScannedPatient({
                    id: patientId,
                    name: "Scanned Patient (Mock)",
                    age: 35,
                    bloodGroup: 'O+',
                    email: 'scanned@example.com',
                    emergencyContact: '123-456-7890',
                    walletAddress: '0xMockWalletAddress'
                });
            }
        } catch (err) {
            console.error('Error in fetchScannedPatientData', err);
            // Fallback
            setScannedPatient({
                id: patientId,
                name: "Scanned Patient (Mock)",
                age: 35,
                bloodGroup: 'O+',
                email: 'scanned@example.com',
                emergencyContact: '123-456-7890',
                walletAddress: '0xMockWalletAddress'
            });
        }
    };

    const onDecode = async (decodedText) => {
        setScanning(false);
        try {
            let patientIdInput = decodedText;
            let parsedData = null;

            // Attempt to parse as Health QR JSON
            try {
                const json = JSON.parse(decodedText);
                if (json && json.isHealthQR) {
                    parsedData = json;
                    patientIdInput = json.id || 'N/A'; // Extract standard ID for backend logging
                }
            } catch (e) {
                // Not JSON, assume it's just a raw UUID string (fallback)
            }

            const password = prompt('Re-enter your password to verify (step-up auth):');
            if (!password) return;

            const { data: sessionData } = await supabase.auth.getSession();
            const doctorEmail = sessionData?.session?.user?.email || location.state?.email || 'doctor@example.com';

            const res = await fetch('/api/scan-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorEmail, patientId: patientIdInput, password })
            });

            const data = await res.json();

            if (!res.ok) {
                // Fallback for mock backend behaviour if auth fails or endpoint misses
                console.warn(data.error || 'Server scan-access failed, proceeding with mock token for development');
                setAccessExpiryTime(new Date(Date.now() + 15 * 60 * 1000).toISOString()); // 15 mins mock
                setUnlockedTier('life_packet'); // Auto-unlock basic info on scan

                if (parsedData) {
                    setScannedPatient(parsedData); // LOAD DIRECTLY FROM QR! Serverless!
                } else {
                    await fetchScannedPatientData(patientIdInput);
                }
                return;
            }

            alert(`Access granted. Token: ${data.token}\nExpires at: ${new Date(data.expiresAt).toLocaleTimeString()}`);
            setAccessExpiryTime(data.expiresAt);
            setUnlockedTier('life_packet'); // Auto-unlock basic info on scan

            if (parsedData) {
                setScannedPatient(parsedData); // LOAD DIRECTLY FROM QR!
            } else {
                await fetchScannedPatientData(patientIdInput);
            }

        } catch (err) {
            console.error('Scan-to-Treat failure', err);
            setScanError(err.message);
            // Developer fallback
            if (err.message === 'Failed to fetch' || err.message.includes('fetch')) {
                setAccessExpiryTime(new Date(Date.now() + 15 * 60 * 1000).toISOString());
                setUnlockedTier('life_packet');
                await fetchScannedPatientData(decodedText);
            } else {
                alert('Scan-to-Treat failed: ' + err.message);
            }
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
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => {
                                setScanning(false);
                                setScanError('');
                            }}
                            className="px-4 py-2.5 w-full bg-red-50 text-red-600 font-bold border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                        >
                            Cancel Scan
                        </button>
                        {/* Bypass option for development if camera fails */}
                        <button
                            onClick={() => {
                                const mockId = prompt("Enter mock patient UUID (Bypass):", "P-2026-MOCK");
                                if (mockId) onDecode(mockId);
                            }}
                            className="px-4 py-2.5 w-full bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Dev Bypass
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const displayPatient = role === 'doctor' ? scannedPatient : patient;

    return (
        <div className="min-h-screen bg-[var(--color-dashboard-bg)] p-6 lg:p-12 font-sans">
            <button
                onClick={() => navigate('/')}
                className="mb-4 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
                &larr; Back to Login / Home
            </button>

            {/* Top Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {role === 'doctor' ? 'Doctor Dashboard' : 'Patient Dashboard'}
                    </h1>
                    <div className="text-gray-500 font-medium mt-1 flex items-center gap-2">
                        {role === 'doctor' ? (
                            <span className="flex items-center gap-2 bg-green-50 text-[#2D7A4D] px-3 py-1 rounded-full text-xs font-bold border border-green-100 shadow-sm mt-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {doctorProfile.name} • {doctorProfile.registrationNumber}
                            </span>
                        ) : `Logged in as: ${patient.email || patient.name}`}
                    </div>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    {role === 'doctor' && (
                        <>
                            <EmergencyOverride
                                patientId={scannedPatient?.id || 'Unknown'}
                                onOverrideSuccess={() => setUnlockedTier('life_packet')}
                            />
                            <button
                                onClick={handleScanToTreat}
                                className="py-2 px-4 bg-[#2D7A4D] text-white rounded-lg hover:bg-[#1f5636] transition-colors text-sm font-semibold shadow-sm flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-scan"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /></svg>
                                Scan-to-Treat
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* Main Content Area */}
            {role === 'doctor' && !scannedPatient ? (
                /* Doctor view - No patient scanned yet - Organized Dashboard */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Doctor Identity Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden h-full flex flex-col items-center text-center">
                            <div className="absolute top-0 left-0 w-full h-2 bg-[#2D7A4D]" />
                            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4 mt-2 border-4 border-white shadow-sm">
                                <User strokeWidth={1.5} className="w-12 h-12 text-[#2D7A4D]" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">{doctorProfile.name}</h2>
                            <p className="text-sm text-gray-500 font-semibold mb-3">{doctorProfile.degree}</p>

                            <div className="bg-green-50/50 text-[#2D7A4D] px-4 py-2 rounded-lg flex items-center gap-2 mb-6 border border-green-100">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span className="text-xs font-bold uppercase tracking-wide">Verified Practitioner</span>
                            </div>

                            <div className="w-full bg-gray-50 rounded-xl p-4 text-left space-y-3 mt-auto border border-gray-100/50">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Registration ID</p>
                                    <p className="text-sm font-semibold text-gray-800 font-mono">{doctorProfile.registrationNumber}</p>
                                </div>
                                <div className="pt-2 border-t border-gray-200/50">
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Hospital Affiliation</p>
                                    <p className="text-sm font-semibold text-gray-800">{doctorProfile.hospital}</p>
                                </div>
                            </div>

                            {/* Doctor Identity QR Code */}
                            <div className="mt-6 w-full flex flex-col items-center bg-gray-50 rounded-xl p-4 border border-gray-100/50">
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Doctor Identity QR</p>
                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                    <QRCodeGenerator
                                        value={JSON.stringify({
                                            type: 'doctor',
                                            ...doctorProfile
                                        })}
                                        size={140}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Dynamic Action Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center h-full flex flex-col justify-center min-h-[50vh]">

                            {requestStatus === 'idle' || requestStatus === 'denied' ? (
                                <>
                                    <div className="w-16 h-16 bg-blue-50/80 rounded-full flex items-center justify-center mb-6 mx-auto">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search text-[var(--color-primary-cyan)]"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Request Patient Access</h2>
                                    <p className="text-gray-500 mb-8 max-w-md mx-auto">Enter the patient's unique Web ID to send a real-time secure access request to their device.</p>

                                    <form onSubmit={handleIDRequest} className="max-w-md mx-auto w-full space-y-4">
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="e.g. P-2026-645"
                                                value={idSearchQuery}
                                                onChange={(e) => setIdSearchQuery(e.target.value)}
                                                className="w-full text-center tracking-widest uppercase font-mono px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A3668] focus:border-transparent text-lg outline-none transition-all placeholder:text-gray-400 placeholder:normal-case placeholder:tracking-normal"
                                                required
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                type="submit"
                                                className="w-full sm:w-1/2 py-4 px-4 bg-[#1A3668] text-white rounded-xl hover:bg-[#12264a] transition-all text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                            >
                                                Send Request
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleRunSimulation}
                                                className="w-full sm:w-1/2 py-4 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 relative overflow-hidden group"
                                            >
                                                <div className="absolute inset-0 bg-white/20 w-0 group-hover:w-full transition-all duration-300 ease-out"></div>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                                                Run Auto-Demo
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : requestStatus === 'pending' ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                                        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-[#1A3668] border-t-transparent rounded-full animate-spin"></div>
                                        <Clock className="w-8 h-8 text-[#1A3668]" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Awaiting Approval...</h2>
                                    <p className="text-gray-500 max-w-sm mx-auto mb-6">
                                        A real-time request has been securely dispatched to Patient <strong className="text-gray-800">{idSearchQuery}</strong>. Waiting for them to approve access.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setRequestStatus('idle');
                                            setActiveRequestId(null);
                                        }}
                                        className="text-red-500 text-sm font-bold hover:text-red-700 transition-colors underline underline-offset-4"
                                    >
                                        Cancel Request
                                    </button>
                                </motion.div>
                            ) : null}

                        </div>
                    </motion.div>
                </div>
            ) : (
                /* Patient view OR Doctor view with scanned patient */
                <div className="w-full relative">

                    {/* Pending Request Modal for Patient */}
                    {role === 'patient' && incomingRequest && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-[#1A3668]"></div>

                                <div className="w-16 h-16 bg-blue-50/80 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
                                    <AlertCircle className="w-8 h-8 text-[#1A3668]" />
                                </div>

                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Incoming Access Request</h2>
                                <p className="text-gray-600 mb-8 leading-relaxed">
                                    <strong className="text-gray-900">{incomingRequest.doctorEmail}</strong> is urgently requesting time-bound access to your comprehensive Morpheus medical records.
                                </p>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleRequestDecision('denied')}
                                        className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Deny
                                    </button>
                                    <button
                                        onClick={() => handleRequestDecision('approved')}
                                        className="flex-1 py-3 px-4 bg-[#2D7A4D] text-white font-bold rounded-xl hover:bg-[#1f5636] transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                        Approve
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                    {/* Profile Completion Grid Banner */}
                    {role === 'patient' && missingFields.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-6 shadow-sm relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#1A3668]"></div>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-[#1A3668] flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-amber-500" />
                                        Incomplete Health Profile
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">Please complete your medical profile to ensure doctors have full context for your QR scan.</p>
                                </div>
                                <button
                                    onClick={() => navigate('/patient-profile', { state: { role: 'patient', email: patient.email, patientId: patient.id } })}
                                    className="px-5 py-2.5 bg-[#1A3668] text-white text-sm font-semibold rounded-lg hover:bg-[#12264a] transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
                                >
                                    Complete Profile <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
                                {missingFields.map(field => (
                                    <div key={field.key} className="bg-white px-3 py-2 rounded-lg border border-red-100 flex items-center gap-2 shadow-sm bg-red-50/20">
                                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                        <span className="text-xs font-semibold text-gray-700">{field.label}</span>
                                    </div>
                                ))}
                                {[{ key: 'name', label: 'Full Name' }, { key: 'age', label: 'Age' }, { key: 'bloodGroup', label: 'Blood Group' }, { key: 'emergencyContact', label: 'Emergency Contact' }, { key: 'allergies', label: 'Allergies' }, { key: 'chronicConditions', label: 'Medical History' }]
                                    .filter(f => !missingFields.find(m => m.key === f.key))
                                    .map(field => (
                                        <div key={field.key} className="bg-white px-3 py-2 rounded-lg border border-green-100 flex items-center gap-2 shadow-sm opacity-70">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                            <span className="text-xs font-semibold text-gray-700">{field.label}</span>
                                        </div>
                                    ))}
                            </div>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Patient Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-1 space-y-6"
                        >
                            {role === 'doctor' && accessExpiryTime && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-amber-800 shadow-sm animate-pulse-slow">
                                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                        <Clock className="w-4 h-4" /> Access Expires
                                    </span>
                                    <span className="font-mono font-bold">{new Date(accessExpiryTime).toLocaleTimeString()}</span>
                                </div>
                            )}

                            {/* Patient Profile Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
                                {/* Decorative banner */}
                                <div className={`absolute top-0 left-0 w-full h-2 ${role === 'doctor' ? 'bg-[#2D7A4D]' : 'bg-[#1A3668]'}`} />

                                <div className="flex items-center justify-between mb-6 mt-2">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${role === 'doctor' ? 'bg-[#2D7A4D]' : 'bg-[#1A3668]'}`}>
                                            <User strokeWidth={1.5} className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">{displayPatient?.name || 'Unknown'}</h2>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${role === 'doctor' ? 'text-[#2D7A4D] bg-green-50' : 'text-[#1A3668] bg-blue-50'}`}>{displayPatient?.id}</span>
                                        </div>
                                    </div>
                                    {role === 'patient' && (
                                        <button
                                            onClick={() => navigate('/patient-profile', { state: { role: 'patient', email: patient.email, patientId: patient.id } })}
                                            className="text-sm font-semibold text-[#1A3668] hover:text-[#12264a] transition-colors border border-[#1A3668]/20 px-3 py-1.5 rounded-lg hover:bg-blue-50"
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                {/* Health QR Generator - ONLY show if role is patient */}
                                {role === 'patient' && (
                                    <div className="mt-4 mb-6 text-center bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        {!showQRCode ? (
                                            <button
                                                onClick={() => setShowQRCode(true)}
                                                className="px-6 py-2 bg-[#1A3668] text-white rounded-lg hover:bg-[#12264a] transition-colors font-semibold shadow-sm w-full"
                                            >
                                                Generate Health QR
                                            </button>
                                        ) : (
                                            <>
                                                <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Doctors scan this for instant access</p>
                                                <div className="flex justify-center bg-white p-2 rounded-lg inline-block shadow-sm">
                                                    <QRCodeGenerator value={getHealthQRPayload()} size={180} />
                                                </div>
                                                <button
                                                    onClick={() => setShowQRCode(false)}
                                                    className="mt-4 text-xs font-semibold text-gray-500 underline block mx-auto"
                                                >
                                                    Hide QR
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Activity className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">Blood Group:</span>
                                        <span className="font-semibold text-red-500">{displayPatient?.bloodGroup || 'Unknown'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">Age:</span>
                                        <span className="font-semibold text-gray-900">{displayPatient?.age || 0} yrs</span>
                                    </div>
                                    {displayPatient?.emergencyContact && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">Emergency:</span>
                                            <span className="font-semibold text-gray-900">{displayPatient.emergencyContact}</span>
                                        </div>
                                    )}
                                    {displayPatient?.walletAddress && (
                                        <div className="flex items-center gap-3 text-sm mt-4 pt-4 border-t border-gray-100">
                                            <span className="text-xs font-mono text-gray-500 truncate w-full" title={displayPatient.walletAddress}>
                                                Wallet: {displayPatient.walletAddress.substring(0, 6)}...{displayPatient.walletAddress.substring(displayPatient.walletAddress.length - 4)}
                                            </span>
                                        </div>
                                    )}

                                    {/* New Data Fields rendered from QR Payload if available */}
                                    {displayPatient?.allergies && (
                                        <div className="flex items-center gap-3 text-sm mt-2 pt-2 border-t border-gray-100">
                                            <span className="text-gray-600 font-semibold">Allergies:</span>
                                            <span className="text-red-600 font-medium">{displayPatient.allergies}</span>
                                        </div>
                                    )}
                                    {displayPatient?.chronicConditions && (
                                        <div className="flex items-center gap-3 text-sm mt-2">
                                            <span className="text-gray-600 font-semibold">Chronic:</span>
                                            <span className="text-orange-600 font-medium">{displayPatient.chronicConditions}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <ClinicalSummarizer clinicalText={sampleClinicalNotes} />

                        </motion.div>

                        {/* Right Column: Medical Records & Vitals */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-2 space-y-6"
                        >
                            {/* Blood Pressure Graph */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6 border-b pb-4">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <TrendingUp className="text-red-500 w-5 h-5" />
                                        Blood Pressure Trends
                                    </h3>
                                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Recent Checkups</span>
                                </div>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={bpData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} domain={['dataMin - 10', 'dataMax + 10']} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                itemStyle={{ fontWeight: 'bold' }}
                                            />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                            <Line type="monotone" name="Systolic (mmHg)" dataKey="systolic" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                            <Line type="monotone" name="Diastolic (mmHg)" dataKey="diastolic" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
                                <div className="flex items-center justify-between mb-6 border-b pb-4">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <FileText className="text-[var(--color-primary-cyan)]" />
                                        Medical Records Vault
                                    </h3>
                                    {role === 'patient' && (
                                        <button
                                            onClick={() => setShowUploadModal(true)}
                                            className="text-xs font-semibold bg-[#1A3668] text-white px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-[#12264a] transition-colors shadow-sm"
                                        >
                                            <UploadCloud className="w-4 h-4" /> Upload Record
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">

                                    {/* Life Packet */}
                                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <h4 className="font-bold text-gray-800">Life Packet</h4>
                                            <p className="text-xs text-gray-500">Allergies, Emergency Contacts, Basic Vitals</p>
                                        </div>
                                        {unlockedTier === 'life_packet' || unlockedTier === 'vault' || role === 'patient' ? (
                                            <button className="px-4 py-2 text-sm font-semibold bg-[var(--color-primary-cyan)] text-white rounded-lg hover:bg-cyan-600 transition-colors shrink-0">
                                                View Packet
                                            </button>
                                        ) : (
                                            <span className="text-xs font-semibold text-gray-400 px-3 py-1 bg-gray-200 rounded-full shrink-0">Locked</span>
                                        )}
                                    </div>

                                    {/* The Vault */}
                                    <div className="p-4 rounded-xl border border-gray-200 bg-blue-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <h4 className="font-bold text-[var(--color-primary-cyan)]">The Vault</h4>
                                            <p className="text-xs text-gray-500">Highly sensitive records (Zero-Trust Decryption Required)</p>
                                        </div>
                                        <button
                                            onClick={() => handleDocumentClick('0xabc123...', 'vault')}
                                            className="px-4 py-2 text-sm font-semibold bg-[var(--color-secondary-olive)] text-white rounded-lg hover:bg-[#1f5636] transition-colors shadow-sm shrink-0"
                                        >
                                            {unlockedTier === 'vault' ? 'View Crypto-PDF' : 'Request Access'}
                                        </button>
                                    </div>

                                    {/* Dynamically Rendered Patient Uploaded Records */}
                                    {role === 'patient' ? (
                                        medicalRecords.map((record) => (
                                            <div key={record.id} className="p-4 rounded-xl border border-gray-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                                                        <File className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-800">{record.title}</h4>
                                                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                                                            {record.date} • {record.type.toUpperCase()} • {record.size}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-mono mt-1">Hash: {record.hash}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDocumentClick(record.hash, record.title)}
                                                    className="px-4 py-2 text-sm font-semibold border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors shrink-0 whitespace-nowrap"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        // Doctor View of records attached to the scanned patient payload
                                        displayPatient?.medicalRecords && displayPatient.medicalRecords.map((record) => (
                                            <div key={record.id} className="p-4 rounded-xl border border-gray-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                                                        <Lock className="w-5 h-5 shrink-0" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-800">{record.title}</h4>
                                                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                                                            {record.date} • {record.type.toUpperCase()} • {record.size}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDocumentClick(record.hash, 'vault')}
                                                    className="px-4 py-2 text-sm font-semibold bg-[var(--color-secondary-olive)] text-white rounded-lg hover:bg-[#1f5636] transition-colors shadow-sm shrink-0 whitespace-nowrap flex items-center gap-2"
                                                >
                                                    <Lock className="w-3 h-3" />
                                                    Request Decryption
                                                </button>
                                            </div>
                                        ))
                                    )}

                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Upload Medical Record Modal (Patient Only) */}
            {showUploadModal && role === 'patient' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100"
                    >
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <UploadCloud className="w-5 h-5 text-[#1A3668]" />
                                Upload Medical Record
                            </h3>
                            <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleRecordSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Document Title</label>
                                <input
                                    type="text"
                                    value={newRecordTitle}
                                    onChange={(e) => setNewRecordTitle(e.target.value)}
                                    placeholder="e.g., Blood Test Results 2026"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A3668]/20 focus:border-[#1A3668] outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">File Attachment (Simulated)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => setNewRecordFile(e.target.files[0])}
                                    />
                                    {newRecordFile ? (
                                        <div className="flex flex-col items-center gap-2 text-[#1A3668]">
                                            <File className="w-8 h-8" />
                                            <span className="font-semibold text-sm">{newRecordFile.name}</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <UploadCloud className="w-8 h-8" />
                                            <span className="font-medium text-sm">Click or Drag & Drop to upload</span>
                                            <span className="text-xs text-gray-400">PDF, JPG, PNG (Max 10MB)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={!newRecordTitle.trim()}
                                className="w-full py-3 bg-[#1A3668] hover:bg-[#12264a] text-white rounded-xl font-bold transition-all disabled:bg-gray-300 shadow-sm"
                            >
                                Securely Upload Record
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

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
