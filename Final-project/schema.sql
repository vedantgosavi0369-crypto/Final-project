-- Supabase Database Schema
-- Patient-Centric Health Record System
-- NOTE: Execute this in the Supabase SQL editor

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    upid TEXT PRIMARY KEY, -- Proprietary Format P-YYYY-XXX
    role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'admin', 'applicant')),
    is_verified BOOLEAN DEFAULT FALSE,
    full_profile JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- (Add specific RLS policies through Supabase UI or here based on system requirements)

-- 2. Medical Records Table
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id TEXT REFERENCES public.profiles(upid) ON DELETE CASCADE,
    ipfs_cid TEXT NOT NULL,
    record_hash TEXT NOT NULL,
    data_tier TEXT NOT NULL CHECK (data_tier IN ('vault', 'life_packet')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for medical_records
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- 3. Additional Indexes
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_data_tier ON public.medical_records(data_tier);
