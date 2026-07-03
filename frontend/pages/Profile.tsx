import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Save, Plus, Trash2, FileText, Globe, Youtube, Instagram, Github, Palette, Sparkles, User, GraduationCap, Link2, Linkedin } from 'lucide-react';
import { COUNTRIES } from '../data/locationData';

export const Profile: React.FC = () => {
  const { profile, setProfile, currentUser, setCurrentUser } = useApp();

  // Local state initialized with context profile details
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  
  // Cascading Address parsing from profile.location
  const [selectedCountry, setSelectedCountry] = useState(() => {
    const parts = (profile.location || '').split(' - ');
    const commaParts = parts[0].split(',').map(p => p.trim());
    return commaParts.length >= 3 ? commaParts[2] : 'India';
  });

  const [phone, setPhone] = useState(() => {
    const rawPhone = profile.phone || '';
    const country = COUNTRIES.find(c => c.name === selectedCountry);
    if (country && rawPhone.startsWith(country.phoneCode)) {
      return rawPhone.slice(country.phoneCode.length).replace(/[^0-9]/g, '');
    }
    return rawPhone.replace(/[^0-9]/g, '');
  });

  const [selectedState, setSelectedState] = useState(() => {
    const parts = (profile.location || '').split(' - ');
    const commaParts = parts[0].split(',').map(p => p.trim());
    return commaParts.length >= 2 ? commaParts[1] : '';
  });
  const [selectedCity, setSelectedCity] = useState(() => {
    const parts = (profile.location || '').split(' - ');
    const commaParts = parts[0].split(',').map(p => p.trim());
    return commaParts.length >= 1 ? commaParts[0] : '';
  });
  const [pincode, setPincode] = useState(() => {
    const parts = (profile.location || '').split(' - ');
    return parts[1] || '';
  });

  const [profilePic, setProfilePic] = useState(profile.profilePic);
  
  const updateProfilePic = (newPic: string) => {
    setProfilePic(newPic);
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        profilePic: newPic
      });
    }
  };
  const [education, setEducation] = useState(profile.education);
  const [profileSummary, setProfileSummary] = useState(profile.profileSummary);
  const [skills, setSkills] = useState(profile.skills.join(', '));
  const [certifications, setCertifications] = useState(() => {
    if (!profile.certifications) return '';
    return profile.certifications.map(c => {
      if (typeof c === 'string') return c;
      return (c as any).title || '';
    }).filter(Boolean).join(', ');
  });
  const [resumePdfName, setResumePdfName] = useState(profile.resumePdfName || '');
  const [resumePdfData, setResumePdfData] = useState(profile.resumePdfData || '');
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Projects list state
  const [projects, setProjects] = useState(profile.projects);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectLink, setNewProjectLink] = useState('');

  // Extra Skills state (Compulsory)
  const [hasExtraSkills] = useState(true);
  const [extraSkillName, setExtraSkillName] = useState(profile.extraSkills?.skillName || '');
  const [youtube, setYoutube] = useState(profile.extraSkills?.youtube || '');
  const [instagram, setInstagram] = useState(profile.extraSkills?.instagram || '');
  const [behance, setBehance] = useState(profile.extraSkills?.behance || '');
  const [portfolioWebsite, setPortfolioWebsite] = useState(profile.extraSkills?.portfolioWebsite || '');
  const [linkedin, setLinkedin] = useState(profile.linkedin || profile.extraSkills?.linkedin || '');
  const [github, setGithub] = useState(profile.github || profile.extraSkills?.github || '');
  const [otherUrl, setOtherUrl] = useState(profile.extraSkills?.otherUrl || '');
  const [otherName, setOtherName] = useState(profile.extraSkills?.otherName || '');

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  // Image upload handling (Base64 conversion for instant save & future backend integration)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateProfilePic(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Resume PDF upload handling (Base64 conversion with standard 2MB limit validation)
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a valid PDF document.');
        return;
      }
      
      const MAX_PDF_SIZE_MB = 10; // Standard 2MB size limit
      const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;
      if (file.size > MAX_PDF_SIZE_BYTES) {
        alert(`File size exceeds the standard official limit of ${MAX_PDF_SIZE_MB}MB. Please compress your PDF before uploading.`);
        return;
      }

      setResumePdfName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setResumePdfData(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Project
  const handleAddProject = () => {
    if (!newProjectTitle || !newProjectDesc) return;
    setProjects([
      ...projects,
      { title: newProjectTitle, description: newProjectDesc, link: newProjectLink }
    ]);
    setNewProjectTitle('');
    setNewProjectDesc('');
    setNewProjectLink('');
  };

  // Remove Project
  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, idx) => idx !== index));
  };

  // Compile Location String for storage
  const compileLocation = () => {
    const parts = [];
    if (selectedCity) parts.push(selectedCity);
    if (selectedState) parts.push(selectedState);
    if (selectedCountry) parts.push(selectedCountry);
    const locStr = parts.join(', ');
    if (pincode.trim()) {
      return `${locStr} - ${pincode.trim()}`;
    }
    return locStr;
  };

  // Save full profile changes to context state
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');

    // Email verification
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.toLowerCase().trim())) {
      alert('Please enter a valid email address format.');
      setSaveStatus('idle');
      return;
    }

    // Phone verification based on country length
    const countryObj = COUNTRIES.find(c => c.name === selectedCountry);
    const digitsOnly = phone.trim().replace(/[^0-9]/g, '');
    if (countryObj) {
      if (digitsOnly.length !== countryObj.phoneLength) {
        alert(`For ${selectedCountry}, phone number must have exactly ${countryObj.phoneLength} digits. (Currently: ${digitsOnly.length} digits)`);
        setSaveStatus('idle');
        return;
      }
    }
    const finalPhone = countryObj ? (countryObj.phoneCode + digitsOnly) : digitsOnly;

    // Cascading selection validations
    if (!selectedState) {
      alert('Please select your State.');
      setSaveStatus('idle');
      return;
    }
    if (!selectedCity) {
      alert('Please select your City/District.');
      setSaveStatus('idle');
      return;
    }
    if (!pincode.trim()) {
      alert('Please enter your PIN/Postal code.');
      setSaveStatus('idle');
      return;
    }

    // Social Media URL validations
    const urlsToCheck = [
      { val: linkedin, label: 'LinkedIn Profile' },
      { val: github, label: 'GitHub Profile' },
      { val: youtube, label: 'YouTube link' },
      { val: instagram, label: 'Instagram link' },
      { val: behance, label: 'Behance Portfolio' },
      { val: portfolioWebsite, label: 'Portfolio Website' },
      { val: otherUrl, label: 'Custom Other Link' },
    ];

    for (const linkItem of urlsToCheck) {
      if (linkItem.val && linkItem.val.trim() !== '') {
        const urlStr = linkItem.val.trim();
        let isValid = false;
        try {
          const parsed = new URL(urlStr);
          isValid = parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch (e) {
          isValid = false;
        }
        if (!isValid) {
          alert(`Invalid URL format for ${linkItem.label}. It must start with http:// or https:// (e.g. https://github.com/username)`);
          setSaveStatus('idle');
          return;
        }

        // Domain-specific validations
        if (linkItem.label === 'LinkedIn Profile' && !urlStr.toLowerCase().includes('linkedin.com')) {
          alert(`Please enter a valid LinkedIn URL for LinkedIn Profile (e.g., https://linkedin.com/in/username)`);
          setSaveStatus('idle');
          return;
        }
        if (linkItem.label === 'YouTube link' && !urlStr.toLowerCase().includes('youtube.com') && !urlStr.toLowerCase().includes('youtu.be')) {
          alert(`Please enter a valid YouTube URL for YouTube link (e.g., https://youtube.com/c/channelname)`);
          setSaveStatus('idle');
          return;
        }
        if (linkItem.label === 'Instagram link' && !urlStr.toLowerCase().includes('instagram.com')) {
          alert(`Please enter a valid Instagram URL for Instagram link (e.g., https://instagram.com/username)`);
          setSaveStatus('idle');
          return;
        }
      }
    }

    const updatedProfile = {
      name,
      email,
      phone: finalPhone,
      location: compileLocation(),
      profilePic,
      education,
      skills: skills.split(',').map(s => s.trim()).filter(s => s !== ''),
      projects,
      certifications: certifications.split(',').map(c => c.trim()).filter(c => c !== ''),
      profileSummary,
      resumePdfName: resumePdfName || undefined,
      resumePdfData: resumePdfData || undefined,
      linkedin: linkedin || undefined,
      github: github || undefined,
      hasExtraSkills,
      extraSkills: hasExtraSkills ? {
        skillName: extraSkillName,
        youtube: youtube || undefined,
        instagram: instagram || undefined,
        behance: behance || undefined,
        portfolioWebsite: portfolioWebsite || undefined,
        otherUrl: otherUrl || undefined,
        otherName: otherName || undefined
      } : undefined
    };

    setTimeout(() => {
      setProfile(updatedProfile);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  };

  // Predefined photo picks for ease
  const picOptions = [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Candidate Profile Page</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add, edit, or customize your professional credentials and portfolios.</p>
        </div>
        
        {saveStatus === 'success' && (
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/40 animate-fade-in">
            ✓ Changes saved successfully!
          </span>
        )}
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* SECTION 1: Bio and Profile picture */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6 transition-colors duration-300">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-50 dark:border-slate-800 pb-3">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>1. Essential Details & Photo</span>
          </h2>

          <div className="flex flex-col md:flex-row gap-6 items-center bg-gray-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-gray-100/50 dark:border-slate-800">
            {/* Pic preview */}
            <div className="space-y-2 text-center shrink-0">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-3xl object-cover border-2 border-blue-500 dark:border-blue-400 shadow-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-blue-100 dark:bg-slate-850 text-blue-600 dark:text-blue-400 flex items-center justify-center border-2 border-dashed border-blue-300 dark:border-slate-700 shadow-md">
                  <User className="h-10 w-10" />
                </div>
              )}
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase">Profile Photo</p>
            </div>

            {/* Pic selector & Uploader */}
            <div className="space-y-4 text-center sm:text-left flex-1 w-full">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Upload or Select Photo</label>
                
                <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                  {/* Real File Input */}
                  <input
                    type="file"
                    id="profile-pic-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="profile-pic-upload"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors inline-flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Upload Custom Image</span>
                  </label>

                  <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold">OR</span>

                  {/* URL Paste field */}
                  <input
                    type="text"
                    placeholder="Or paste external image URL..."
                    value={profilePic.startsWith('data:image') ? '' : profilePic}
                    onChange={(e) => updateProfilePic(e.target.value)}
                    className="text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-hidden focus:ring-1 focus:ring-blue-600 flex-1 min-w-[200px]"
                  />
                </div>
              </div>

              {/* Stock Options choice */}
              <div className="pt-2">
                <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Or select from quick stock presets:</span>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {picOptions.map((pic, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => updateProfilePic(pic)}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        profilePic === pic ? 'border-blue-600 dark:border-blue-400 scale-105 shadow-sm' : 'border-gray-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={pic} alt={`Option ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm p-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm p-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Phone Number</label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-3.5 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold shrink-0">
                  <span>{COUNTRIES.find(c => c.name === selectedCountry)?.phoneCode || '+91'}</span>
                </div>
                <input
                  type="text"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 10-digit number"
                  className="w-full text-sm p-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedState('');
                  setSelectedCity('');
                }}
                className="w-full text-sm p-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600 appearance-none"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.name} value={c.name} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 col-span-1 sm:col-span-2">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">State</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedCity('');
                  }}
                  className="w-full text-sm p-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600"
                  required
                >
                  <option value="" className="text-gray-400 bg-white dark:bg-slate-900">-- Select State --</option>
                  {COUNTRIES.find(c => c.name === selectedCountry)?.states.map((st) => (
                    <option key={st.name} value={st.name} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">City / District</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedState}
                  className="w-full text-sm p-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600 disabled:opacity-50"
                  required
                >
                  <option value="" className="text-gray-400 bg-white dark:bg-slate-900">-- Select City --</option>
                  {COUNTRIES.find(c => c.name === selectedCountry)
                    ?.states.find(s => s.name === selectedState)
                    ?.cities.map((ct) => (
                      <option key={ct} value={ct} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                        {ct}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">PIN / Postal Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 110001"
                className="w-full text-sm p-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                <Linkedin className="h-4 w-4 text-blue-700 fill-blue-700 bg-white" />
                <span>LinkedIn Profile URL</span>
              </label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full text-sm p-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                <Github className="h-4 w-4 text-slate-900 dark:text-gray-100" />
                <span>GitHub Profile URL</span>
              </label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full text-sm p-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Professional Profile Summary</label>
            <textarea
              rows={4}
              value={profileSummary}
              onChange={(e) => setProfileSummary(e.target.value)}
              placeholder="Tell recruiters about your background, goals, and passions..."
              className="w-full text-sm p-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* SECTION 2: Education, Resume & Skills */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6 transition-colors duration-300">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-50 dark:border-slate-800 pb-3">
            <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>2. Resume, Skills & Education</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Education Background</label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="Degree, Major - School Name"
                className="w-full text-sm p-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Resume Upload Box */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Resume Document (PDF)</label>
              <input
                type="file"
                ref={resumeInputRef}
                onChange={handleResumeUpload}
                accept=".pdf"
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <FileText className="h-4.5 w-4.5 text-red-500" />
                  </span>
                  <input
                    type="text"
                    value={resumePdfName}
                    readOnly
                    placeholder="No PDF uploaded"
                    className="w-full text-sm pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl focus:outline-hidden placeholder-gray-400 dark:placeholder-gray-500 font-medium cursor-not-allowed"
                  />
                </div>
                
                {/* Real file selector button */}
                <button
                  type="button"
                  onClick={() => resumeInputRef.current?.click()}
                  className="px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 shrink-0 cursor-pointer transition-colors"
                  title="Upload a PDF file from your computer"
                >
                  Browse PDF
                </button>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Accepts PDF format (Actually uploads and stores file contents in DB)</p>
              {resumePdfData && (
                <a
                  href={resumePdfData}
                  download={resumePdfName || 'resume.pdf'}
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline mt-1.5"
                >
                  <span>💾 View/Download Stored PDF ({resumePdfName})</span>
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Skills (Comma-separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, Figma, UI/UX"
                className="w-full text-sm p-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 placeholder-gray-400 dark:placeholder-gray-500"
              />
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Separate keywords with commas</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Certifications (Comma-separated)</label>
              <input
                type="text"
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                placeholder="AWS Architect, Google UX Specialization"
                className="w-full text-sm p-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Projects addition */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6 transition-colors duration-300">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-50 dark:border-slate-800 pb-3">
            <Link2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>3. Core Projects Showcase</span>
          </h2>

          {/* Current projects list */}
          {projects.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 py-2">No projects added yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((proj, idx) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800 flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-white">{proj.title}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{proj.description}</p>
                    {proj.link && (
                      <span className="inline-block text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[200px]">
                        {proj.link}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(idx)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer"
                    title="Remove project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add project panel */}
          <div className="p-4 bg-blue-50/20 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/40 rounded-xl space-y-4">
            <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Add New Project</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Project Title (e.g. Chat App)"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-hidden"
              />
              <input
                type="text"
                placeholder="External Repository/Deployment link"
                value={newProjectLink}
                onChange={(e) => setNewProjectLink(e.target.value)}
                className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-hidden"
              />
            </div>
            <textarea
              placeholder="Short descriptive writeup about technology choices..."
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-hidden"
              rows={2}
            />
            <button
              type="button"
              onClick={handleAddProject}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Insert Project</span>
            </button>
          </div>
        </div>

        {/* SECTION 4: Extra Skills Section */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 dark:border-slate-800 pb-4 gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500 fill-amber-100 dark:fill-amber-950" />
                <span>4. Extra Skills Section</span>
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Showcase your verified extra-curricular and creative talents to stand out.</p>
            </div>
          </div>

          <div className="space-y-6 animate-fade-in">
            <div className="bg-amber-500/5 dark:bg-amber-500/10 p-5 rounded-2xl border border-amber-500/10 space-y-4">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span>Primary Portfolios & Social Connections (Compulsory Showcase)</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Personal Portfolio Website */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Globe className="h-4.5 w-4.5 text-blue-500" />
                    <span>Personal Portfolio Website URL</span>
                  </label>
                  <input
                    type="url"
                    value={portfolioWebsite}
                    onChange={(e) => setPortfolioWebsite(e.target.value)}
                    placeholder="https://mywebsite.com"
                    className="w-full text-sm p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Youtube link */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Youtube className="h-4.5 w-4.5 text-red-500" />
                    <span>YouTube Channel/Video URL</span>
                  </label>
                  <input
                    type="url"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full text-sm p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Instagram link */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Instagram className="h-4.5 w-4.5 text-pink-500" />
                    <span>Instagram URL</span>
                  </label>
                  <input
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full text-sm p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">What is this extra skill name?</label>
              <input
                type="text"
                value={extraSkillName}
                onChange={(e) => setExtraSkillName(e.target.value)}
                placeholder="e.g. Vlogging, Digital Art, Tech Writing, UI Motion Design"
                className="w-full text-sm p-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 placeholder-gray-400 dark:placeholder-gray-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex justify-end gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 transition-colors duration-300">
          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Save className="h-4.5 w-4.5" />
            <span>{saveStatus === 'saving' ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
