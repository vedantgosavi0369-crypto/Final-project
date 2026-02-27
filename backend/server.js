console.log("Server file loaded")
const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")
const nodemailer = require("nodemailer")
const { createClient } = require("@supabase/supabase-js")

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

// in-memory store for OTP codes (email -> { code, expires })
const otpStore = {};

// transporter configuration using environment variables
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

app.get("/api", (req, res) => {
    res.json({ message: "Backend running successfully" })
})

// send OTP to given email address
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // valid for 5 minutes
    otpStore[email] = { code, expires };

    // if SMTP is not configured, just log the code to the server console so developers can continue
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('SMTP variables missing, printing OTP to console instead');
        console.log(`OTP for ${email}: ${code}`);
        return res.json({ message: 'OTP generated (check server logs)' });
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.SMTP_USER,
            to: email,
            subject: 'Your verification code',
            text: `Your OTP code is ${code}. It will expire in 5 minutes.`,
            html: `<p>Your OTP code is <strong>${code}</strong>. It will expire in 5 minutes.</p>`
        });
        res.json({ message: 'OTP sent' });
    } catch (err) {
        console.error('Error sending OTP', err);
        // show code anyway so devs can complete flow without SMTP
        console.log(`Fallback OTP for ${email}: ${code}`);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// verify OTP and check if patient exists
app.post('/api/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and otp required' });

    const record = otpStore[email];
    if (!record || record.code !== otp || record.expires < Date.now()) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // remove after successful verification
    delete otpStore[email];

    // check if patient already exists in supabase
    try {
        const { data, error } = await supabase
            .from('patients')
            .select('id, email')
            .eq('email', email)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = no rows returned (patient doesn't exist), which is fine
            throw error;
        }

        const isNewPatient = !data || !data.id;
        res.json({ message: 'Verified', isNewPatient, email });
    } catch (err) {
        // if supabase is not available, assume new patient (allow flow to continue)
        console.warn('Could not check patient status:', err);
        res.json({ message: 'Verified', isNewPatient: true, email });
    }
});

// complete registration after Supabase OTP verification
app.post('/api/complete-registration', async (req, res) => {
    const { userId, email, fullName } = req.body;
    if (!userId || !email) return res.status(400).json({ error: 'Missing required user details' });

    try {
        // check if already exists
        const { data: existing } = await supabase
            .from('patients')
            .select('patient_id')
            .eq('id', userId)
            .single();
            
        if (existing) {
            return res.json({ message: 'Patient already registered', patientId: existing.patient_id });
        }

        // generate patient ID
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 900) + 100;
        const patientId = `P-${year}-${randomNum}`;

        // create patient record in database using service role key
        const { data: patientData, error: patientError } = await supabase
            .from('patients')
            .insert([{
                id: userId,
                email,
                patient_id: patientId,
                full_name: fullName || '',
                created_at: new Date()
            }])
            .select('patient_id')
            .single();

        if (patientError) throw patientError;

        res.json({ message: 'Patient registered', patientId: patientData.patient_id });
    } catch (err) {
        console.error('Patient registration error:', err);
        res.status(500).json({ error: err.message || 'Failed to complete registration' });
    }
});

app.use(express.static(path.join(__dirname, "../frontend/dist")))

// catch-all for client-side routing (React/Vite)
// use a regular expression route so path-to-regexp doesn't need a parameter name
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"))
})

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(5000, () => {
    console.log("Server running on port 5000")
})