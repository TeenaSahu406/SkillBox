import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, User, Mail, Phone, Lock, UserCheck, AlertCircle, KeyRound, Loader2, Building, MapPin, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { COUNTRIES } from '../data/locationData';

export const Register: React.FC = () => {
  const { loginUser } = useApp();
  const navigate = useNavigate();

  // Mode state: 'email' or 'phone'
  const [regMode, setRegMode] = useState<'email' | 'phone'>('email');
  
  // Registration state: 'form' or 'otp'
  const [state, setState] = useState<'form' | 'otp'>('form');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Cascading Address states
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Phone starts empty, code will be prefixed visually in the input
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Candidate');
  
  // Error / Loading states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sandboxNotification, setSandboxNotification] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  // 6-digit OTP state
  const [otpInputs, setOtpInputs] = useState<string[]>(Array(6).fill(''));
  const [otpTimer, setOtpTimer] = useState(45);

  // Profile presets
  const candidatePic = '';
  const recruiterPic = '';

  // Handle resetting phone on country change
  useEffect(() => {
    const country = COUNTRIES.find(c => c.name === selectedCountry);
    if (country) {
      setPhone('');
      // Reset state and city cascading
      setSelectedState('');
      setSelectedCity('');
    }
  }, [selectedCountry]);

  // Timer countdown for resending OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state, otpTimer]);

  // Handle segmented inputs behavior
  const handleOtpBoxChange = (val: string, index: number) => {
    if (isNaN(Number(val))) return;
    const updatedInputs = [...otpInputs];
    updatedInputs[index] = val.slice(-1);
    setOtpInputs(updatedInputs);

    // Auto-focus next box
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  };

  const handleOtpBoxKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
      const prevInput = document.getElementById(`otp-box-${index - 1}`);
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
      }
    }
  };

  // 1. Submit Registration Form -> Send OTP
  const handleRegisterFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }

    if (regMode === 'email') {
      if (!email.trim()) {
        setError('Please provide your email address.');
        return;
      }
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email.toLowerCase().trim())) {
        setError('Please enter a valid email format (e.g., example@gmail.com, work@outlook.com).');
        return;
      }
    }

    let fullPhone = '';
    if (regMode === 'phone') {
      if (!phone.trim()) {
        setError('Please provide your phone number.');
        return;
      }
      const countryObj = COUNTRIES.find(c => c.name === selectedCountry);
      fullPhone = countryObj ? (countryObj.phoneCode + phone.trim()) : phone.trim();
    }

    if (role === 'Recruiter' && !companyName.trim()) {
      setError('Recruiters must provide their official Company Name.');
      return;
    }

    if (!selectedState) {
      setError('Please select your state.');
      return;
    }

    if (!selectedCity) {
      setError('Please select your city or district.');
      return;
    }

    if (!pincode.trim()) {
      setError('Please enter your postal/PIN code.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const checkIdentifier = regMode === 'email' ? email.toLowerCase().trim() : fullPhone.trim();
    try {
      const storedRoles = JSON.parse(localStorage.getItem('skillbox_user_roles') || '{}');
      const existingRole = storedRoles[checkIdentifier];
      if (existingRole && existingRole !== role) {
        setError(`This account is already registered as a ${existingRole === 'Candidate' ? 'Job Seeker' : 'Recruiter'}. Please sign in using the correct role, or use a different email/phone.`);
        return;
      }
    } catch (e) {
      console.warn(e);
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register-send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: regMode,
          email: regMode === 'email' ? email : undefined,
          phone: regMode === 'phone' ? fullPhone : undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        setState('otp');
        setOtpInputs(Array(6).fill(''));
        setOtpTimer(45);
        
        if (data.previewUrl) {
          console.log(`[Developer Debug Mode] Mail Transmission URL: ${data.previewUrl}`);
        }
        
        if (data.otp) {
          console.log(`[Developer Debug Mode] Generated Registration OTP: ${data.otp}`);
          setGeneratedOtp(data.otp);
        }

         if (regMode === 'email') {
          if (data.mockMode) {
            setSandboxNotification(`A secure 6-digit verification code has been dispatched to <strong>${email}</strong>.<br/><span class="text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded inline-block mt-1">⚠️ SMTP delivery failed (${data.error || 'Connection error'}). Please verify your SMTP config or try again.</span>`);
          } else {
            setSandboxNotification(`A secure 6-digit verification code has been dispatched to <strong>${email}</strong>. Please check your inbox and spam folder.`);
          }
        } else {
          setSandboxNotification(`A secure 6-digit verification code has been dispatched via SMS to <strong>${fullPhone}</strong>.<br/>For secure previewing, your code is: <strong class="font-mono text-blue-600 dark:text-blue-400 bg-blue-100/40 dark:bg-slate-800 px-2 py-0.5 rounded">${data.otp}</strong>`);
        }
      } else {
        setError(data.error || 'Failed to dispatch verification code. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Compile final location string
  const formatLocation = () => {
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

  // 2. Submit OTP -> Verify & Complete Registration
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const enteredCode = otpInputs.join('');
    if (enteredCode.length < 6) {
      setError('Please fill in all 6 digits of the verification code.');
      return;
    }

    setLoading(true);

    try {
      const countryObj = COUNTRIES.find(c => c.name === selectedCountry);
      const fullPhone = countryObj ? (countryObj.phoneCode + phone.trim()) : phone.trim();

      const response = await fetch('/api/auth/register-verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: regMode,
          email: regMode === 'email' ? email : undefined,
          phone: regMode === 'phone' ? fullPhone : undefined,
          otp: enteredCode
        })
      });

      const data = await response.json();

      if (data.success) {
        // Persist password locally for authentication sync
        try {
          const registeredPasswords = JSON.parse(localStorage.getItem('skillbox_passwords') || '{}');
          const loginIdentifier = regMode === 'email' ? email.toLowerCase().trim() : fullPhone.trim();
          registeredPasswords[loginIdentifier] = password;
          localStorage.setItem('skillbox_passwords', JSON.stringify(registeredPasswords));

          const storedRoles = JSON.parse(localStorage.getItem('skillbox_user_roles') || '{}');
          storedRoles[loginIdentifier] = role;
          localStorage.setItem('skillbox_user_roles', JSON.stringify(storedRoles));
        } catch (err) {
          console.warn('Could not save password or role to localStorage', err);
        }

        // Successfully verified! Log in the user
        const loginIdentifier = regMode === 'email' ? email.toLowerCase().trim() : fullPhone.trim();
        const profilePic = role === 'Candidate' ? candidatePic : recruiterPic;
        
        loginUser(loginIdentifier, role, name, profilePic, {
          phone: regMode === 'phone' ? fullPhone.trim() : undefined,
          location: formatLocation(),
          companyName: role === 'Recruiter' ? companyName.trim() : undefined
        });

        // Redirect to respective dashboard
        navigate(role === 'Candidate' ? '/candidate-dashboard' : '/recruiter-dashboard');
      } else {
        setError(data.error || 'Incorrect OTP code. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Resend OTP handler
  const handleResendOtp = async () => {
    setError('');
    setOtpInputs(Array(6).fill(''));
    setLoading(true);
    
    const countryObj = COUNTRIES.find(c => c.name === selectedCountry);
    const fullPhone = countryObj ? (countryObj.phoneCode + phone.trim()) : phone.trim();

    try {
      const response = await fetch('/api/auth/register-send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: regMode,
          email: regMode === 'email' ? email : undefined,
          phone: regMode === 'phone' ? fullPhone : undefined
        })
      });
      const data = await response.json();

      if (data && data.success) {
        setOtpTimer(45);
        if (data.otp) {
          setGeneratedOtp(data.otp);
          console.log(`[Developer Debug Mode] Resent Registration OTP: ${data.otp}`);
        }

        if (regMode === 'email') {
          if (data.mockMode) {
            setSandboxNotification(`A new secure verification code has been dispatched to <strong>${email}</strong>.<br/><span class="text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded inline-block mt-1">⚠️ SMTP delivery failed (${data.error || 'Connection error'}). Please verify your SMTP config or try again.</span>`);
          } else {
            setSandboxNotification(`A new secure verification code has been dispatched to <strong>${email}</strong>. Please check your inbox and spam folder.`);
          }
        } else {
          setSandboxNotification(`A new secure verification code has been dispatched to <strong>${fullPhone}</strong>.<br/>Your verification code is: <strong class="font-mono text-blue-600 dark:text-blue-400 bg-blue-100/40 dark:bg-slate-800 px-2 py-0.5 rounded">${data.otp}</strong>`);
        }
      } else {
        setError(data.error || 'Failed to dispatch a new verification code.');
      }
    } catch (e: any) {
      console.warn('Failed to resend OTP', e);
      setError('Connection issue while resending verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen py-12 px-4 flex flex-col items-center justify-center relative bg-cover bg-center transition-all duration-300"
      style={{ 
        backgroundImage: "linear-gradient(rgba(17, 24, 39, 0.85), rgba(15, 23, 42, 0.92)), url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80')" 
      }}
    >
      {/* Brand logo / Header above the card */}
      <div className="text-center space-y-3 mb-8 relative z-10">
        <Link to="/" className="inline-flex flex-col items-center gap-1">
          <div className="bg-white/10 dark:bg-slate-800/40 p-3 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg transition-transform hover:scale-105">
            <Briefcase className="h-9 w-9 text-blue-400 fill-blue-500/10" />
          </div>
          <span className="text-3xl font-black text-white tracking-tight mt-2">
            Skill<span className="text-blue-400">Box</span>
          </span>
        </Link>
        <p className="text-sm text-gray-300 font-medium max-w-sm mx-auto">
          {state === 'form' ? 'Create a brand new SkillBox account' : 'Verify Registration Code'}
        </p>
      </div>

      <div className="max-w-md w-full bg-white/95 dark:bg-slate-900/95 border border-white/20 dark:border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-md transition-all">
        
        {/* Render Security Notification Box */}
        {sandboxNotification && (
          <div className="mb-5 bg-blue-50 dark:bg-slate-800/80 text-blue-900 dark:text-blue-100 p-4 rounded-2xl border border-blue-100/60 dark:border-slate-700 flex flex-col gap-1.5 relative overflow-hidden transition-all duration-300">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Security Verification</span>
            </div>
            <div 
              className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sandboxNotification }}
            />
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-red-700 dark:text-red-400 p-3 rounded-xl flex items-center gap-2 text-xs mb-4">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ---------------- REGISTRATION FORM FLOW ---------------- */}
        {state === 'form' && (
          <form onSubmit={handleRegisterFormSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <User className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full text-sm pl-10 pr-4 py-3 bg-blue-50/40 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium transition-all"
                  required
                />
              </div>
            </div>

            {/* Registration Mode Tab switcher: Email vs Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Register With</label>
              <div className="grid grid-cols-2 gap-2 bg-gray-100/60 dark:bg-slate-800/50 p-1 rounded-xl mb-3">
                <button
                  type="button"
                  onClick={() => setRegMode('email')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    regMode === 'email'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRegMode('phone')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    regMode === 'phone'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Phone No</span>
                </button>
              </div>
            </div>

            {/* Dynamic input depending on mode */}
            {regMode === 'email' ? (
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Mail className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena.rostova@gmail.com"
                    className="w-full text-sm pl-10 pr-4 py-3 bg-blue-50/40 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium transition-all"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-3.5 py-3 bg-gray-100/60 dark:bg-slate-800/60 border border-blue-100/50 dark:border-slate-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold shrink-0">
                    <span>{COUNTRIES.find(c => c.name === selectedCountry)?.phoneCode || '+91'}</span>
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                      <Phone className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500" />
                    </span>
                    <input
                      type="tel"
                      maxLength={COUNTRIES.find(c => c.name === selectedCountry)?.phoneLength || 10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder={`Enter ${COUNTRIES.find(c => c.name === selectedCountry)?.phoneLength || 10} digits`}
                      className="w-full text-sm pl-10 pr-4 py-3 bg-blue-50/40 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Role Tab selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">I want to</label>
              <div className="grid grid-cols-2 gap-2 bg-gray-100/60 dark:bg-slate-800/50 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole('Candidate')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    role === 'Candidate'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  Find a Job
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Recruiter')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    role === 'Recruiter'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  Hire Talent
                </button>
              </div>
            </div>

            {/* Recruiter Company Input */}
            {role === 'Recruiter' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Company Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Building className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500" />
                  </span>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. TechCorp Solutions"
                    className="w-full text-sm pl-10 pr-4 py-3 bg-blue-50/40 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {/* Country Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Country</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <MapPin className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500" />
                </span>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full text-sm pl-10 pr-4 py-3 bg-blue-50/40 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white font-medium transition-all"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.name} value={c.name} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cascading State & City/District */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">State</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedCity('');
                  }}
                  className="w-full text-sm px-3.5 py-3 bg-blue-50/40 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white font-medium transition-all"
                  required
                >
                  <option value="" className="bg-white dark:bg-slate-900 text-gray-400">-- State --</option>
                  {COUNTRIES.find(c => c.name === selectedCountry)?.states.map((st) => (
                    <option key={st.name} value={st.name} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">City / District</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedState}
                  className="w-full text-sm px-3.5 py-3 bg-blue-50/40 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white font-medium transition-all disabled:opacity-50"
                  required
                >
                  <option value="" className="bg-white dark:bg-slate-900 text-gray-400">-- City --</option>
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

            {/* Pincode */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Postal / PIN Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 110001 or 90210"
                className="w-full text-sm px-3.5 py-3 bg-blue-50/40 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium transition-all"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Create Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm pl-10 pr-10 py-3 bg-blue-50/40 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500" />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm pl-10 pr-10 py-3 bg-blue-50/40 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit / Get OTP */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all mt-6 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] disabled:bg-gray-400"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Sending Code...</span>
                </>
              ) : (
                <span>Register & Send OTP</span>
              )}
            </button>
          </form>
        )}

        {/* ---------------- OTP VERIFICATION STATE ---------------- */}
        {state === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-center text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-3">6-Digit Registration Code</label>
              <div className="flex justify-between gap-2.5 max-w-sm mx-auto">
                {otpInputs.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-box-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpBoxChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpBoxKeyDown(e, index)}
                    className="w-12 h-13 text-center text-xl font-bold font-mono bg-blue-50/40 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-700 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/30 text-gray-900 dark:text-white transition-all shadow-inner"
                    required
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] disabled:bg-gray-400"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <span>Verify OTP & Complete Signup</span>
              )}
            </button>

            <div className="text-center space-y-3.5">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Didn't receive the OTP verification email?
              </p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={otpTimer > 0}
                className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer transition-all"
              >
                {otpTimer > 0 ? `Resend Code in ${otpTimer}s` : 'Resend OTP Code'}
              </button>
              
              <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setState('form'); setSandboxNotification(''); }}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                >
                  ← Edit Registration Information
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Footer Link to switch to login */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6 pt-4 border-t border-gray-100 dark:border-slate-800/60">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
};
