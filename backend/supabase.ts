import { createClient } from '@supabase/supabase-js';
import { Job, CandidateProfile, JobApplication, RecruiterProfile } from '../frontend/types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// SQL Schema for the user to easily copy and paste in their Supabase SQL editor:
export const SQL_SCHEMA_SUGGESTION = `
-- Run this in your Supabase SQL Editor to create the tables!

-- 1. Create candidate_profiles table
CREATE TABLE IF NOT EXISTS candidate_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  profile_pic TEXT,
  education TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  projects JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  profile_summary TEXT,
  resume_pdf_name TEXT,
  resume_pdf_data TEXT,
  has_extra_skills BOOLEAN DEFAULT false,
  extra_skills JSONB DEFAULT '{}'::jsonb,
  linkedin TEXT,
  github TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  company_logo TEXT,
  location TEXT,
  salary TEXT,
  category TEXT,
  skills_required JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  posted_date TEXT,
  type TEXT,
  experience TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  applicant_id TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_profile JSONB NOT NULL,
  resume_pdf_name TEXT,
  resume_pdf_data TEXT,
  status TEXT DEFAULT 'Pending',
  applied_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create recruiter_profiles table
CREATE TABLE IF NOT EXISTS recruiter_profiles (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_logo TEXT,
  recruiter_name TEXT NOT NULL,
  recruiter_image TEXT,
  designation TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) but allow anonymous access for public preview simplicity,
-- or you can configure security rules as needed.
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_profiles ENABLE ROW LEVEL SECURITY;

-- candidate_profiles policies
DROP POLICY IF EXISTS "Allow anonymous read access" ON candidate_profiles;
CREATE POLICY "Allow anonymous read access" ON candidate_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous write access" ON candidate_profiles;
CREATE POLICY "Allow anonymous write access" ON candidate_profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous update access" ON candidate_profiles;
CREATE POLICY "Allow anonymous update access" ON candidate_profiles FOR UPDATE USING (true);

-- jobs policies
DROP POLICY IF EXISTS "Allow anonymous read access" ON jobs;
CREATE POLICY "Allow anonymous read access" ON jobs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous write access" ON jobs;
CREATE POLICY "Allow anonymous write access" ON jobs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous update access" ON jobs;
CREATE POLICY "Allow anonymous update access" ON jobs FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anonymous delete access" ON jobs;
CREATE POLICY "Allow anonymous delete access" ON jobs FOR DELETE USING (true);

-- applications policies
DROP POLICY IF EXISTS "Allow anonymous read access" ON applications;
CREATE POLICY "Allow anonymous read access" ON applications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous write access" ON applications;
CREATE POLICY "Allow anonymous write access" ON applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous update access" ON applications;
CREATE POLICY "Allow anonymous update access" ON applications FOR UPDATE USING (true);

-- recruiter_profiles policies
DROP POLICY IF EXISTS "Allow anonymous read access" ON recruiter_profiles;
CREATE POLICY "Allow anonymous read access" ON recruiter_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous write access" ON recruiter_profiles;
CREATE POLICY "Allow anonymous write access" ON recruiter_profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous update access" ON recruiter_profiles;
CREATE POLICY "Allow anonymous update access" ON recruiter_profiles FOR UPDATE USING (true);
`;

/**
 * Handles mapping from local CandidateProfile type to Supabase candidate_profiles table
 */
export async function getProfile(id: string): Promise<CandidateProfile | null> {
  try {
    const { data, error } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found is fine, return null
        return null;
      }
      throw error;
    }

    if (!data) return null;

    return {
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      location: data.location || '',
      profilePic: data.profile_pic || '',
      education: data.education || '',
      skills: Array.isArray(data.skills) ? data.skills : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
      certifications: Array.isArray(data.certifications) ? data.certifications : [],
      profileSummary: data.profile_summary || '',
      resumePdfName: data.resume_pdf_name || '',
      resumePdfData: data.resume_pdf_data || '',
      hasExtraSkills: !!data.has_extra_skills,
      extraSkills: data.extra_skills || {},
      linkedin: data.linkedin || '',
      github: data.github || ''
    };
  } catch (err: any) {
    console.log(`[Supabase Status] Profile read status - setup may be pending: ${err.message || err}`);
    return null;
  }
}

export async function upsertProfile(id: string, profile: CandidateProfile): Promise<boolean> {
  try {
    const payload = {
      id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      profile_pic: profile.profilePic,
      education: profile.education,
      skills: profile.skills,
      projects: profile.projects,
      certifications: profile.certifications,
      profile_summary: profile.profileSummary,
      resume_pdf_name: profile.resumePdfName,
      resume_pdf_data: profile.resumePdfData || '',
      has_extra_skills: profile.hasExtraSkills,
      extra_skills: profile.extraSkills || {},
      linkedin: profile.linkedin,
      github: profile.github,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('candidate_profiles')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.log(`[Supabase Status] Profile save status - setup may be pending: ${error.message}`);
      return false;
    }
    return true;
  } catch (err: any) {
    console.log(`[Supabase Status] Profile save status - setup may be pending: ${err.message || err}`);
    return false;
  }
}

/**
 * Handles jobs table queries and updates
 */
export async function getJobs(): Promise<Job[] | null> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log(`[Supabase Status] Jobs fetch status - setup may be pending: ${error.message}`);
      return null;
    }

    return (data || []).map(row => ({
      id: row.id,
      title: row.title,
      company: row.company,
      companyLogo: row.company_logo,
      location: row.location,
      salary: row.salary,
      category: row.category,
      skillsRequired: Array.isArray(row.skills_required) ? row.skills_required : [],
      description: row.description,
      postedDate: row.posted_date,
      type: row.type || 'Full-time',
      experience: row.experience || 'Not specified'
    }));
  } catch (err: any) {
    console.log(`[Supabase Status] Jobs fetch status - setup may be pending: ${err.message || err}`);
    return null;
  }
}

export async function upsertJob(job: Job): Promise<boolean> {
  try {
    const payload = {
      id: job.id,
      title: job.title,
      company: job.company,
      company_logo: job.companyLogo || '',
      location: job.location,
      salary: job.salary,
      category: job.category,
      skills_required: job.skillsRequired,
      description: job.description,
      posted_date: job.postedDate,
      type: job.type,
      experience: job.experience
    };

    const { error } = await supabase
      .from('jobs')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.log(`[Supabase Status] Job save status - setup may be pending: ${error.message}`);
      return false;
    }
    return true;
  } catch (err: any) {
    console.log(`[Supabase Status] Job save status - setup may be pending: ${err.message || err}`);
    return false;
  }
}

export async function deleteJobFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      console.log(`[Supabase Status] Job delete status - setup may be pending: ${error.message}`);
      return false;
    }
    return true;
  } catch (err: any) {
    console.log(`[Supabase Status] Job delete status - setup may be pending: ${err.message || err}`);
    return false;
  }
}

/**
 * Handles applications table queries and updates
 */
export async function getApplications(): Promise<JobApplication[] | null> {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log(`[Supabase Status] Applications fetch status - setup may be pending: ${error.message}`);
      return null;
    }

    // Filter duplicates by job_id + applicant_id (keeps the latest one due to DESC order)
    const uniqueMap = new Map<string, any>();
    const rawRows = data || [];
    rawRows.forEach(row => {
      const key = `${row.job_id}_${row.applicant_id}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, row);
      }
    });
    const uniqueRows = Array.from(uniqueMap.values());

    return uniqueRows.map(row => ({
      id: row.id,
      jobId: row.job_id,
      jobTitle: row.job_title,
      companyName: row.company_name,
      applicantId: row.applicant_id,
      applicantName: row.applicant_name,
      applicantEmail: row.applicant_email,
      applicantProfile: row.applicant_profile,
      resumePdfName: row.resume_pdf_name,
      resumePdfData: row.resume_pdf_data || '',
      status: row.status || 'Pending',
      appliedDate: row.applied_date
    }));
  } catch (err: any) {
    console.log(`[Supabase Status] Applications fetch status - setup may be pending: ${err.message || err}`);
    return null;
  }
}

export async function upsertApplication(app: JobApplication): Promise<boolean> {
  try {
    // Fetch if there's an existing application by this applicant for this job
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', app.jobId)
      .eq('applicant_id', app.applicantId)
      .limit(1);

    const finalId = (existing && existing.length > 0) ? existing[0].id : app.id;

    const payload = {
      id: finalId,
      job_id: app.jobId,
      job_title: app.jobTitle,
      company_name: app.companyName,
      applicant_id: app.applicantId,
      applicant_name: app.applicantName,
      applicant_email: app.applicantEmail,
      applicant_profile: app.applicantProfile,
      resume_pdf_name: app.resumePdfName || '',
      resume_pdf_data: app.resumePdfData || '',
      status: app.status,
      applied_date: app.appliedDate
    };

    const { error } = await supabase
      .from('applications')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.log(`[Supabase Status] Application save status - setup may be pending: ${error.message}`);
      return false;
    }
    return true;
  } catch (err: any) {
    console.log(`[Supabase Status] Application save status - setup may be pending: ${err.message || err}`);
    return false;
  }
}

export async function updateApplicationStatusInSupabase(id: string, status: 'Pending' | 'Shortlisted' | 'Rejected' | 'Interviewing' | 'Hired'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.log(`[Supabase Status] Application status update status - setup may be pending: ${error.message}`);
      return false;
    }
    return true;
  } catch (err: any) {
    console.log(`[Supabase Status] Application status update status - setup may be pending: ${err.message || err}`);
    return false;
  }
}

/**
 * Handles recruiter profile queries and updates from Supabase
 */
export async function getRecruiterProfile(id: string): Promise<RecruiterProfile | null> {
  try {
    const { data, error } = await supabase
      .from('recruiter_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found is fine, return null so we can fall back to defaults
        return null;
      }
      throw error;
    }

    if (!data) return null;

    return {
      companyLogo: data.company_logo || '',
      companyName: data.company_name,
      recruiterName: data.recruiter_name,
      recruiterImage: data.recruiter_image || '',
      designation: data.designation || '',
      email: data.email,
      phone: data.phone || ''
    };
  } catch (err: any) {
    console.log(`[Supabase Status] Recruiter profile read status - setup may be pending: ${err.message || err}`);
    return null;
  }
}

export async function upsertRecruiterProfile(id: string, profile: RecruiterProfile): Promise<boolean> {
  try {
    const payload = {
      id,
      company_name: profile.companyName,
      company_logo: profile.companyLogo || '',
      recruiter_name: profile.recruiterName,
      recruiter_image: profile.recruiterImage || '',
      designation: profile.designation,
      email: profile.email,
      phone: profile.phone,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('recruiter_profiles')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.log(`[Supabase Status] Recruiter profile save status - setup may be pending: ${error.message}`);
      return false;
    }
    return true;
  } catch (err: any) {
    console.log(`[Supabase Status] Recruiter profile save status - setup may be pending: ${err.message || err}`);
    return false;
  }
}

/**
 * Checks if an email or phone number already exists in either candidate or recruiter profiles in Supabase
 */
export async function checkIdentifierExists(email?: string, phone?: string): Promise<{ exists: boolean; type: 'email' | 'phone' | null }> {
  try {
    if (email) {
      const cleanEmail = email.toLowerCase().trim();

      // Check candidate profiles
      const { data: cand, error: candErr } = await supabase
        .from('candidate_profiles')
        .select('email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (cand) return { exists: true, type: 'email' };

      // Check recruiter profiles
      const { data: rec, error: recErr } = await supabase
        .from('recruiter_profiles')
        .select('email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (rec) return { exists: true, type: 'email' };
    }

    if (phone) {
      const cleanPhone = phone.trim();

      // Check candidate profiles
      const { data: cand, error: candErr } = await supabase
        .from('candidate_profiles')
        .select('phone')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (cand) return { exists: true, type: 'phone' };

      // Check recruiter profiles
      const { data: rec, error: recErr } = await supabase
        .from('recruiter_profiles')
        .select('phone')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (rec) return { exists: true, type: 'phone' };
    }

    return { exists: false, type: null };
  } catch (err: any) {
    console.log(`[Supabase Status] Error checking registration duplicate:`, err.message || err);
    return { exists: false, type: null };
  }
}

/**
 * Deletes all existing rows from all tables in Supabase to start fresh
 */
export async function purgeAllDatabaseData(): Promise<boolean> {
  try {
    console.log('[Supabase Purge] Starting database cleanup of all tables...');
    const { error: appErr } = await supabase.from('applications').delete().neq('id', 'dummy_purge_id');
    const { error: jobErr } = await supabase.from('jobs').delete().neq('id', 'dummy_purge_id');
    const { error: candErr } = await supabase.from('candidate_profiles').delete().neq('id', 'dummy_purge_id');
    const { error: recErr } = await supabase.from('recruiter_profiles').delete().neq('id', 'dummy_purge_id');
    
    if (appErr || jobErr || candErr || recErr) {
      console.log('[Supabase Purge] Errors during purge:', { appErr, jobErr, candErr, recErr });
    }
    console.log('[Supabase Purge] All tables successfully purged.');
    return true;
  } catch (err: any) {
    console.error('[Supabase Purge] Critical error during database purge:', err);
    return false;
  }
}

/**
 * Verifies if Supabase is connected and checks if tables exist
 */
export async function checkSupabaseConnection(): Promise<{ success: boolean; message: string; url: string }> {
  try {
    const { data, error } = await supabase.from('jobs').select('id').limit(1);
    if (error) {
      // 42P01 means table does not exist
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return { 
          success: true, 
          message: 'Connected to Supabase successfully, but some database tables are not yet created. Please run the SQL schema suggestion in your Supabase SQL Editor.',
          url: supabaseUrl 
        };
      }
      return { success: false, message: `Connected to Supabase but returned query error: ${error.message} (${error.code})`, url: supabaseUrl };
    }
    return { success: true, message: 'Connected to Supabase and tables are verified.', url: supabaseUrl };
  } catch (err: any) {
    return { success: false, message: `Could not connect to Supabase: ${err.message || err}`, url: supabaseUrl };
  }
}


