import React, { createContext, useContext, useState, useEffect } from 'react';
import { Job, CandidateProfile, JobApplication, User, UserRole, RecruiterProfile } from '../types';
import { INITIAL_JOBS, INITIAL_APPLICATIONS, INITIAL_PROFILE } from '../data/dummyData';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  applications: JobApplication[];
  setApplications: React.Dispatch<React.SetStateAction<JobApplication[]>>;
  profile: CandidateProfile;
  setProfile: (profile: CandidateProfile) => void;
  recruiterProfile: RecruiterProfile;
  setRecruiterProfile: (profile: RecruiterProfile) => void;
  savedJobIds: string[];
  toggleSaveJob: (jobId: string) => void;
  
  // Quick helper actions
  addJob: (jobData: Omit<Job, 'id' | 'postedDate'>) => void;
  updateJob: (updatedJob: Job) => void;
  deleteJob: (jobId: string) => void;
  applyToJob: (jobId: string) => boolean; // returns true if success, false if already applied
  updateApplicationStatus: (appId: string, status: 'Pending' | 'Shortlisted' | 'Rejected' | 'Interviewing' | 'Hired') => void;
  addApplicationMessage: (appId: string, content: string, senderRole: UserRole, isEmailSimulated: boolean) => void;
  loginUser: (email: string, role: UserRole, customName?: string, customProfilePic?: string) => void;
  logoutUser: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initial user setup - starts logged out
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [userRole, setUserRoleState] = useState<UserRole>('Candidate');
  
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('local_jobs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_JOBS;
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const saved = localStorage.getItem('local_applications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_APPLICATIONS;
  });

  const [profile, setProfileState] = useState<CandidateProfile>(INITIAL_PROFILE);
  
  const [recruiterProfile, setRecruiterProfileState] = useState<RecruiterProfile>(() => {
    const saved = localStorage.getItem('recruiter_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      companyLogo: '',
      companyName: '',
      recruiterName: '',
      recruiterImage: '',
      designation: '',
      email: '',
      phone: ''
    };
  });

  const setRecruiterProfile = async (newProfile: RecruiterProfile) => {
    setRecruiterProfileState(newProfile);
    localStorage.setItem('recruiter_profile', JSON.stringify(newProfile));
    
    // Sync with current user if recruiter is active
    if (currentUser && currentUser.role === 'Recruiter') {
      setCurrentUser(prev => prev ? {
        ...prev,
        name: newProfile.recruiterName,
        email: newProfile.email,
        profilePic: newProfile.recruiterImage
      } : null);

      // Save to Supabase
      try {
        await fetch(`/api/supabase/recruiter-profile/${currentUser.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProfile)
        });
      } catch (err) {
        console.log('[Supabase Setup Status] Saving recruiter profile pending database setup:', err);
      }
    }
  };

  const [savedJobIds, setSavedJobIds] = useState<string[]>(['job-3']); // Default saved job
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync jobs and applications to localStorage when they change
  useEffect(() => {
    localStorage.setItem('local_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('local_applications', JSON.stringify(applications));
  }, [applications]);

  // Load data from Supabase backend on mount
  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch Jobs from Supabase proxy
        const jobsRes = await fetch('/api/supabase/jobs');
        const jobsData = await jobsRes.json();
        if (jobsData && !jobsData.error && Array.isArray(jobsData.data) && jobsData.data.length > 0) {
          setJobs(jobsData.data);
          localStorage.setItem('local_jobs', JSON.stringify(jobsData.data));
        } else {
          console.log('[Supabase Setup] Jobs table empty or missing, using client-side dummy jobs.');
        }

        // 2. Fetch Job Applications from Supabase proxy
        const appsRes = await fetch('/api/supabase/applications');
        const appsData = await appsRes.json();
        if (appsData && !appsData.error && Array.isArray(appsData.data)) {
          setApplications(appsData.data);
          localStorage.setItem('local_applications', JSON.stringify(appsData.data));
        } else {
          console.log('[Supabase Setup] Applications table empty or missing, using client-side dummy apps.');
        }
      } catch (err) {
        console.log('[Supabase Setup Status] Pending database configuration:', err);
      }
    }
    loadData();
  }, []);

  // Sync profile when currentUser is changed
  useEffect(() => {
    if (currentUser && currentUser.role === 'Candidate') {
      async function loadProfile() {
        try {
          const res = await fetch(`/api/supabase/profile/${currentUser.id}`);
          const result = await res.json();
          if (result && result.data) {
            setProfileState(result.data);
          } else {
            // Seed profile if not exists in Supabase using clean INITIAL_PROFILE
            const seedProfile = {
              ...INITIAL_PROFILE,
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              phone: currentUser.phone || '',
              location: currentUser.location || 'India',
              profilePic: currentUser.profilePic || ''
            };
            await fetch(`/api/supabase/profile/${currentUser.id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(seedProfile)
            });
            setProfileState(seedProfile);
          }
        } catch (err) {
          console.log('[Supabase Setup Status] Seeding profile pending database setup:', err);
        }
      }
      loadProfile();
    } else if (currentUser && currentUser.role === 'Recruiter') {
      async function loadRecruiterProfile() {
        try {
          const res = await fetch(`/api/supabase/recruiter-profile/${currentUser.id}`);
          const result = await res.json();
          if (result && result.data) {
            setRecruiterProfileState(result.data);
            localStorage.setItem('recruiter_profile', JSON.stringify(result.data));
          } else {
            // Seed recruiter profile if not exists in Supabase using clean default
            const seedRecruiterProfile = {
              id: currentUser.id,
              recruiterName: currentUser.name,
              email: currentUser.email,
              phone: currentUser.phone || '',
              companyName: currentUser.companyName || 'SkillBox Partner',
              recruiterImage: currentUser.profilePic || '',
              companyLogo: '',
              designation: 'Recruiter'
            };
            await fetch(`/api/supabase/recruiter-profile/${currentUser.id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(seedRecruiterProfile)
            });
            setRecruiterProfileState(seedRecruiterProfile);
            localStorage.setItem('recruiter_profile', JSON.stringify(seedRecruiterProfile));
          }
        } catch (err) {
          console.log('[Supabase Setup Status] Seeding recruiter profile pending database setup:', err);
        }
      }
      loadRecruiterProfile();
    }
  }, [currentUser]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Keep userRole synchronized with currentUser role
  useEffect(() => {
    if (currentUser) {
      setUserRoleState(currentUser.role);
    }
  }, [currentUser]);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role: role,
        // Swap default names based on real profiles instead of Alex Mercer
        name: role === 'Recruiter' ? recruiterProfile.recruiterName : (profile.name || 'Candidate'),
        email: role === 'Recruiter' ? recruiterProfile.email : (profile.email || 'candidate@gmail.com'),
        profilePic: role === 'Recruiter' 
          ? recruiterProfile.recruiterImage
          : (profile.profilePic || '')
      });
    } else {
      // Setup a basic mock user if there is none
      setCurrentUser({
        id: role === 'Recruiter' ? 'rec-1' : 'cand-1',
        name: role === 'Recruiter' ? recruiterProfile.recruiterName : (profile.name || 'Candidate'),
        email: role === 'Recruiter' ? recruiterProfile.email : (profile.email || 'candidate@gmail.com'),
        role,
        profilePic: role === 'Recruiter' 
          ? recruiterProfile.recruiterImage
          : (profile.profilePic || '')
      });
    }
  };

  const setProfile = async (newProfile: CandidateProfile) => {
    setProfileState(newProfile);
    // Sync main applicant user with profile details
    if (currentUser && currentUser.role === 'Candidate') {
      setCurrentUser(prev => prev ? {
        ...prev,
        name: newProfile.name,
        email: newProfile.email,
        profilePic: newProfile.profilePic
      } : null);

      // Save to Supabase
      try {
        await fetch(`/api/supabase/profile/${currentUser.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProfile)
        });
      } catch (err) {
        console.log('[Supabase Setup Status] Saving profile pending database setup:', err);
      }
    }
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobIds(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const addJob = async (jobData: Omit<Job, 'id' | 'postedDate'>) => {
    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}`,
      postedDate: new Date().toISOString().split('T')[0]
    };
    setJobs(prev => [newJob, ...prev]);

    // Save to Supabase
    try {
      await fetch('/api/supabase/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
    } catch (err) {
      console.log('[Supabase Setup Status] Saving job pending database setup:', err);
    }
  };

  const updateJob = async (updatedJob: Job) => {
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));

    // Save to Supabase
    try {
      await fetch('/api/supabase/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedJob)
      });
    } catch (err) {
      console.log('[Supabase Setup Status] Updating job pending database setup:', err);
    }
  };

  const deleteJob = async (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    // Also clean up any applications for this job or mark them as job deleted
    setApplications(prev => prev.filter(app => app.jobId !== jobId));
    setSavedJobIds(prev => prev.filter(id => id !== jobId));

    // Delete from Supabase
    try {
      await fetch(`/api/supabase/jobs/${jobId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.log('[Supabase Setup Status] Deleting job pending database setup:', err);
    }
  };

  const applyToJob = (jobId: string): boolean => {
    // Check if already applied
    const alreadyApplied = applications.some(
      app => app.jobId === jobId && app.applicantId === (currentUser?.id || 'cand-1')
    );
    if (alreadyApplied) {
      return false;
    }

    const job = jobs.find(j => j.id === jobId);
    if (!job) return false;

    const newApplication: JobApplication = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.company,
      applicantId: currentUser?.id || 'cand-1',
      applicantName: profile.name,
      applicantEmail: profile.email,
      applicantProfile: { ...profile },
      resumePdfName: profile.resumePdfName || 'resume.pdf',
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    setApplications(prev => [newApplication, ...prev]);

    // Save to Supabase
    fetch('/api/supabase/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newApplication)
    }).catch(err => {
      console.log('[Supabase Setup Status] Saving application pending database setup:', err);
    });

    return true;
  };

  const updateApplicationStatus = (appId: string, status: 'Pending' | 'Shortlisted' | 'Rejected' | 'Interviewing' | 'Hired') => {
    setApplications(prev => 
      prev.map(app => app.id === appId ? { ...app, status } : app)
    );

    // Save status change to Supabase
    fetch(`/api/supabase/applications/${appId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(err => {
      console.log('[Supabase Setup Status] Saving application status pending database setup:', err);
    });
  };

  const addApplicationMessage = (appId: string, content: string, senderRole: UserRole, isEmailSimulated: boolean) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      senderRole,
      senderName: senderRole === 'Recruiter' ? recruiterProfile.recruiterName : (currentUser?.name || 'Candidate'),
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
      isEmailSimulated
    };

    setApplications(prev => 
      prev.map(app => {
        if (app.id === appId) {
          const currentMessages = app.messages || [];
          return {
            ...app,
            messages: [...currentMessages, newMessage]
          };
        }
        return app;
      })
    );

    fetch(`/api/supabase/applications/${appId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMessage)
    }).catch(err => {
      console.log('[Supabase Setup Status] Saving message pending database setup:', err);
    });
  };

  const loginUser = (
    email: string, 
    role: UserRole, 
    customName?: string, 
    customProfilePic?: string,
    additionalData?: {
      phone?: string;
      location?: string;
      companyName?: string;
    }
  ) => {
    const defaultName = role === 'Recruiter' ? recruiterProfile.recruiterName : ((email.split('@')[0] || 'User'));
    const finalName = customName || (defaultName.charAt(0).toUpperCase() + defaultName.slice(1));
    
    // Generate a deterministic stable user ID based on email/phone to ensure profile persistence across login sessions
    const stableId = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const mockUser: User = {
      id: role === 'Recruiter' ? `rec_${stableId}` : `cand_${stableId}`,
      name: finalName,
      email,
      role,
      profilePic: customProfilePic !== undefined ? customProfilePic : '',
      phone: additionalData?.phone,
      location: additionalData?.location,
      companyName: additionalData?.companyName
    };
    setCurrentUser(mockUser);
    setUserRoleState(role);
    
    // Set profile basic info if Candidate logs in
    if (role === 'Candidate') {
      setProfileState(prev => ({
        ...prev,
        name: mockUser.name,
        email: mockUser.email,
        phone: additionalData?.phone || prev.phone || '',
        location: additionalData?.location || prev.location || '',
        profilePic: mockUser.profilePic || prev.profilePic
      }));
    } else if (role === 'Recruiter') {
      setRecruiterProfileState(prev => ({
        ...prev,
        recruiterName: mockUser.name,
        email: mockUser.email,
        phone: additionalData?.phone || prev.phone || '',
        companyName: additionalData?.companyName || prev.companyName || '',
        recruiterImage: mockUser.profilePic || prev.recruiterImage
      }));
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setProfileState(INITIAL_PROFILE);
    setRecruiterProfileState({
      companyLogo: '',
      companyName: '',
      recruiterName: '',
      recruiterImage: '',
      designation: '',
      email: '',
      phone: ''
    });
    localStorage.removeItem('recruiter_profile');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        userRole,
        setUserRole,
        jobs,
        setJobs,
        applications,
        setApplications,
        profile,
        setProfile,
        recruiterProfile,
        setRecruiterProfile,
        savedJobIds,
        toggleSaveJob,
        addJob,
        updateJob,
        deleteJob,
        applyToJob,
        updateApplicationStatus,
        addApplicationMessage,
        loginUser,
        logoutUser,
        theme,
        toggleTheme
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
