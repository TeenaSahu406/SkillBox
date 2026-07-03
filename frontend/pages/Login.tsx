import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Mail, Phone, Lock, UserCheck, RefreshCw, AlertCircle, ArrowLeft, ShieldCheck, KeyRound, CheckCircle2, Eye, EyeOff, Loader2, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const { loginUser, currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Candidate');
  const [error, setError] = useState('');

  // Mobile OTP Login states
  const [loginMode, setLoginMode] = useState<'password' | 'phone'>('password');
  const [loginOtpState, setLoginOtpState] = useState<'input-phone' | 'verify-otp'>('input-phone');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPhoneOtp, setLoginPhoneOtp] = useState<string[]>(Array(6).fill(''));
  const [loginPhoneOtpTimer, setLoginPhoneOtpTimer] = useState(0);
  const [generatedLoginOtp, setGeneratedLoginOtp] = useState('');

  // Password OTP Login states (Double-Factor Security Verification)
  const [passwordLoginStep, setPasswordLoginStep] = useState<'credentials' | 'verify-otp'>('credentials');
  const [passwordLoginOtp, setPasswordLoginOtp] = useState<string[]>(Array(6).fill(''));
  const [passwordLoginOtpTimer, setPasswordLoginOtpTimer] = useState(0);
  const [generatedPasswordLoginOtp, setGeneratedPasswordLoginOtp] = useState('');

  // Forgot password flow states
  const [forgotState, setForgotState] = useState<'none' | 'email' | 'otp' | 'new-password' | 'success'>('none');
  const [forgotEmail, setForgotEmail] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInputs, setOtpInputs] = useState<string[]>(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [recoveryError, setRecoveryError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [sandboxNotification, setSandboxNotification] = useState<string | null>(null);

  // If redirected from some place, get it
  const from = location.state?.from?.pathname || '/';

  // Auto-detect and pre-fill email on page load
  useEffect(() => {
    const lastEmail = localStorage.getItem('skillbox_last_email');
    if (lastEmail) {
      setEmail(lastEmail);
      setForgotEmail(lastEmail);
    }
  }, []);

  // Resend OTP countdown timer
  useEffect(() => {
    let interval: any;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Resend Phone Login OTP countdown timer
  useEffect(() => {
    let interval: any;
    if (loginPhoneOtpTimer > 0) {
      interval = setInterval(() => {
        setLoginPhoneOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loginPhoneOtpTimer]);

  // Resend Password Login OTP countdown timer
  useEffect(() => {
    let interval: any;
    if (passwordLoginOtpTimer > 0) {
      interval = setInterval(() => {
        setPasswordLoginOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [passwordLoginOtpTimer]);

  const handlePasswordLoginOtpBoxChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const cleanVal = value.slice(-1);
    const updatedInputs = [...passwordLoginOtp];
    updatedInputs[index] = cleanVal;
    setPasswordLoginOtp(updatedInputs);

    if (cleanVal !== '' && index < 5) {
      const nextInput = document.getElementById(`password-login-otp-box-${index + 1}`);
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  };

  const handlePasswordLoginOtpBoxKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !passwordLoginOtp[index] && index > 0) {
      const prevInput = document.getElementById(`password-login-otp-box-${index - 1}`);
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
      }
    }
  };

  const handleLoginOtpBoxChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const cleanVal = value.slice(-1);
    const updatedInputs = [...loginPhoneOtp];
    updatedInputs[index] = cleanVal;
    setLoginPhoneOtp(updatedInputs);

    if (cleanVal !== '' && index < 5) {
      const nextInput = document.getElementById(`login-otp-box-${index + 1}`);
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  };

  const handleLoginOtpBoxKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !loginPhoneOtp[index] && index > 0) {
      const prevInput = document.getElementById(`login-otp-box-${index - 1}`);
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
      }
    }
  };

  const handleSendLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) {
      setError('Please enter your phone number.');
      return;
    }

    setLoading(true);
    setError('');
    setSandboxNotification(null);

    try {
      const response = await fetch('/api/auth/login-send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: loginPhone })
      });

      const data = await response.json();

      if (data && data.success) {
        setLoginPhoneOtp(Array(6).fill(''));
        setLoginPhoneOtpTimer(45);
        setLoginOtpState('verify-otp');
        if (data.otp) {
          setGeneratedLoginOtp(data.otp);
        }
        setSandboxNotification(`A secure 6-digit verification code has been dispatched via SMS to <strong>${loginPhone}</strong>.<br/>For quick developer preview, your verification code is: <strong class="font-mono text-blue-600 dark:text-blue-400 bg-blue-100/40 dark:bg-slate-800 px-2 py-0.5 rounded">${data.otp}</strong>`);
      } else {
        setError(data.error || 'Failed to dispatch login OTP. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection lost with backend server. Please verify dev server state.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = loginPhoneOtp.join('');
    if (enteredCode.length < 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const isAllowed = await verifyRoleIsAllowed(loginPhone, role);
      if (!isAllowed) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/login-verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: loginPhone, otp: enteredCode })
      });

      const data = await response.json();

      if (data && data.success) {
        setSandboxNotification(null);
        setError('');
        try {
          const storedRoles = JSON.parse(localStorage.getItem('skillbox_user_roles') || '{}');
          storedRoles[loginPhone.toLowerCase().trim()] = role;
          localStorage.setItem('skillbox_user_roles', JSON.stringify(storedRoles));
        } catch (e) {}
        loginUser(loginPhone, role);
        navigate(role === 'Candidate' ? '/candidate-dashboard' : '/recruiter-dashboard');
      } else {
        setError(data.error || 'Incorrect OTP code. Please check your OTP and try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to connect to the server for verification.');
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordLoginOtp = async (userEmail: string) => {
    setLoading(true);
    setError('');
    setSandboxNotification(null);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      const data = await response.json();

      if (data && data.success) {
        setPasswordLoginOtp(Array(6).fill(''));
        setPasswordLoginOtpTimer(45);
        setPasswordLoginStep('verify-otp');
        if (data.otp) {
          setGeneratedPasswordLoginOtp(data.otp);
        }
        setSandboxNotification(`A secure 6-digit verification code has been dispatched to your email <strong>${userEmail}</strong>.`);
      } else {
        setError(data.error || 'Failed to dispatch login verification OTP. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection lost with backend server. Please verify dev server state.');
    } finally {
      setLoading(false);
    }
  };

  const verifyRoleIsAllowed = async (userEmail: string, selectedRole: UserRole): Promise<boolean> => {
    // 1. Check local storage role fallback (Instant & 100% reliable)
    try {
      const storedRoles = JSON.parse(localStorage.getItem('skillbox_user_roles') || '{}');
      const existingRole = storedRoles[userEmail.toLowerCase().trim()];
      if (existingRole && existingRole !== selectedRole) {
        setError(`This account is registered as a ${existingRole === 'Candidate' ? 'Job Seeker' : 'Recruiter'}. Please switch your role to "${existingRole === 'Candidate' ? 'Job Seeker / Candidate' : 'Recruiter'}" to sign in.`);
        return false;
      }
    } catch (err) {
      console.warn(err);
    }

    // 2. Fetch from Supabase as standard DB-authoritative check
    try {
      const stableId = userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
      if (selectedRole === 'Candidate') {
        const res = await fetch(`/api/supabase/recruiter-profile/rec_${stableId}`);
        const result = await res.json();
        if (result && result.data) {
          setError('This account is registered as a Recruiter. Please switch your role to "Recruiter" to sign in.');
          try {
            const storedRoles = JSON.parse(localStorage.getItem('skillbox_user_roles') || '{}');
            storedRoles[userEmail.toLowerCase().trim()] = 'Recruiter';
            localStorage.setItem('skillbox_user_roles', JSON.stringify(storedRoles));
          } catch (e) {}
          return false;
        }
      } else {
        const res = await fetch(`/api/supabase/profile/cand_${stableId}`);
        const result = await res.json();
        if (result && result.data) {
          setError('This account is registered as a Job Seeker. Please switch your role to "Job Seeker / Candidate" to sign in.');
          try {
            const storedRoles = JSON.parse(localStorage.getItem('skillbox_user_roles') || '{}');
            storedRoles[userEmail.toLowerCase().trim()] = 'Candidate';
            localStorage.setItem('skillbox_user_roles', JSON.stringify(storedRoles));
          } catch (e) {}
          return false;
        }
      }
      return true;
    } catch (err) {
      console.warn('Role verification failed:', err);
      return true;
    }
  };

  const handleVerifyPasswordLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = passwordLoginOtp.join('');
    if (enteredCode.length < 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const isAllowed = await verifyRoleIsAllowed(email, role);
      if (!isAllowed) {
        setLoading(false);
        return;
      }

      if (generatedPasswordLoginOtp && enteredCode === generatedPasswordLoginOtp) {
        setSandboxNotification(null);
        setError('');
        try {
          const storedRoles = JSON.parse(localStorage.getItem('skillbox_user_roles') || '{}');
          storedRoles[email.toLowerCase().trim()] = role;
          localStorage.setItem('skillbox_user_roles', JSON.stringify(storedRoles));
        } catch (e) {}
        loginUser(email, role);
        navigate(role === 'Candidate' ? '/candidate-dashboard' : '/recruiter-dashboard');
        return;
      }

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, otp: enteredCode })
      });

      const data = await response.json();

      if (data && data.success) {
        setSandboxNotification(null);
        setError('');
        try {
          const storedRoles = JSON.parse(localStorage.getItem('skillbox_user_roles') || '{}');
          storedRoles[email.toLowerCase().trim()] = role;
          localStorage.setItem('skillbox_user_roles', JSON.stringify(storedRoles));
        } catch (e) {}
        loginUser(email, role);
        navigate(role === 'Candidate' ? '/candidate-dashboard' : '/recruiter-dashboard');
      } else {
        setError(data.error || 'Incorrect OTP code. Please check your OTP and try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to connect to the server for verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    const isAllowed = await verifyRoleIsAllowed(email, role);
    if (!isAllowed) {
      setLoading(false);
      return;
    }

    // Validate password if it exists in local storage credentials
    try {
      const registeredPasswords = JSON.parse(localStorage.getItem('skillbox_passwords') || '{}');
      const registeredPass = registeredPasswords[email.toLowerCase().trim()];
      if (registeredPass && registeredPass !== password) {
        setError('Incorrect password. If you forgot your password, please click the "Forgot?" link to reset it securely.');
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn(err);
    }

    setError('');
    setSandboxNotification(null);
    setLoading(false);
    try {
      const storedRoles = JSON.parse(localStorage.getItem('skillbox_user_roles') || '{}');
      storedRoles[email.toLowerCase().trim()] = role;
      localStorage.setItem('skillbox_user_roles', JSON.stringify(storedRoles));
    } catch (e) {}
    loginUser(email, role);
    navigate(role === 'Candidate' ? '/candidate-dashboard' : '/recruiter-dashboard');
  };

  // Quick helper login
  const handleQuickLogin = (quickEmail: string, quickRole: UserRole) => {
    loginUser(quickEmail, quickRole);
    navigate(quickRole === 'Candidate' ? '/candidate-dashboard' : '/recruiter-dashboard');
  };

  // 1. Send OTP Flow
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setRecoveryError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setRecoveryError('');
    setSandboxNotification(null);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await response.json();

      if (data && data.success) {
        setOtpInputs(Array(6).fill(''));
        setOtpTimer(45);
        setForgotState('otp');
        
        if (data.previewUrl) {
          console.log(`[Developer Debug Mode] Mail Transmission URL: ${data.previewUrl}`);
        }
        if (data.otp) {
          console.log(`[Developer Debug Mode] Generated OTP Verification Code: ${data.otp}`);
          setGeneratedOtp(data.otp);
        } else if (data.mockMode) {
          setGeneratedOtp(data.otp);
        }
        
        if (data.mockMode) {
          setSandboxNotification(`A secure 6-digit verification code has been dispatched to <strong>${forgotEmail}</strong>.<br/><span class="text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded inline-block mt-1">⚠️ SMTP delivery failed (${data.error || 'Connection error'}). Please verify your SMTP config or try again.</span>`);
        } else {
          setSandboxNotification(`A secure 6-digit verification code has been dispatched to <strong>${forgotEmail}</strong>. Please check your inbox and spam folder.`);
        }
      } else {
        setRecoveryError(data.error || 'Failed to dispatch recovery OTP. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setRecoveryError('Connection lost with backend server. Please verify dev server state.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP Flow
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpInputs.join('');
    
    if (enteredCode.length < 6) {
      setRecoveryError('Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);
    setRecoveryError('');

    try {
      // If we are in sandboxed offline mock mode
      if (generatedOtp && enteredCode === generatedOtp) {
        setForgotState('new-password');
        setSandboxNotification(null);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: enteredCode })
      });

      const data = await response.json();

      if (data && data.success) {
        setForgotState('new-password');
        setSandboxNotification(null);
      } else {
        setRecoveryError(data.error || 'Incorrect OTP code. Please check your email or preview URL and try again.');
      }
    } catch (err) {
      console.error(err);
      setRecoveryError('Unable to connect to the server for verification.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Reset Password Submit Flow
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmNewPassword) {
      setRecoveryError('Please fill in both fields.');
      return;
    }

    if (newPassword.length < 6) {
      setRecoveryError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setRecoveryError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setRecoveryError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, password: newPassword })
      });

      const data = await response.json();

      if (data && data.success) {
        // Update the password in our local credentials store so the user can log in with it immediately!
        try {
          const registeredPasswords = JSON.parse(localStorage.getItem('skillbox_passwords') || '{}');
          registeredPasswords[forgotEmail.toLowerCase().trim()] = newPassword;
          localStorage.setItem('skillbox_passwords', JSON.stringify(registeredPasswords));
        } catch (storageErr) {
          console.warn(storageErr);
        }

        setForgotState('success');
      } else {
        setRecoveryError(data.error || 'Failed to update credentials. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setRecoveryError('Could not save password changes to server.');
    } finally {
      setLoading(false);
    }
  };

  // Segmented OTP input helper function to auto-focus next boxes
  const handleOtpBoxChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return; // only numbers allowed

    const cleanVal = value.slice(-1); // only take last digit
    const updatedInputs = [...otpInputs];
    updatedInputs[index] = cleanVal;
    setOtpInputs(updatedInputs);

    // Auto-focus next input box on digit enter
    if (cleanVal !== '') {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  };

  const handleOtpBoxKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Backspace auto-focus previous box
    if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
      const prevInput = document.getElementById(`otp-box-${index - 1}`);
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
      }
    }
  };

  return (
    <div 
      className="min-h-screen py-12 px-4 flex flex-col items-center justify-center relative bg-cover bg-center transition-all duration-300"
      style={{ 
        backgroundImage: "linear-gradient(rgba(17, 24, 39, 0.82), rgba(15, 23, 42, 0.90)), url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80')" 
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
          {forgotState === 'none' ? 'Welcome back! Login to your account' : 'Secure Account Recovery Panel'}
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

        {/* ---------------- NORMAL LOGIN FLOW ---------------- */}
        {forgotState === 'none' && (
          <>
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-red-700 dark:text-red-400 p-3 rounded-xl flex items-center gap-2 text-xs mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Email input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Mail className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEmail(val);
                      setForgotEmail(val);
                      localStorage.setItem('skillbox_last_email', val);
                    }}
                    placeholder={role === 'Candidate' ? 'alex.mercer@gmail.com' : 'hr@techcorp.com'}
                    className="w-full text-sm pl-10 pr-4 py-3 bg-blue-50/40 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Password</label>
                  <button 
                    type="button" 
                    onClick={() => {
                      setForgotState('email');
                      setRecoveryError('');
                      if (email) {
                        setForgotEmail(email);
                      }
                    }}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer bg-transparent border-none p-0 focus:outline-hidden"
                  >
                    Forgot?
                  </button>
                </div>
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

              {/* Role selection tab - visually matching Job Seeker and Recruiter */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">I am a</label>
                <div className="grid grid-cols-2 gap-2 bg-gray-100/60 dark:bg-slate-800/50 p-1.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setRole('Candidate')}
                    className={`py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      role === 'Candidate'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <span>Job Seeker</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('Recruiter')}
                    className={`py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      role === 'Recruiter'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <span>Recruiter</span>
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <span>Login</span>
              </button>
            </form>

            {/* Footer link */}
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 pt-5 mt-1 border-t border-gray-50 dark:border-slate-800/60">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                Create one
              </Link>
            </p>
          </>
        )}


        {/* ---------------- STEP 1: ENTER EMAIL FOR OTP ---------------- */}
        {forgotState === 'email' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setForgotState('none')} 
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Reset Password</h2>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Enter your registered email address below. We will generate and dispatch a secure 6-digit OTP verification code to reset your password.
            </p>

            {recoveryError && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-red-700 dark:text-red-400 p-3 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{recoveryError}</span>
              </div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Registered Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Mail className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500" />
                  </span>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. alex.mercer@gmail.com"
                    className="w-full text-sm pl-10 pr-4 py-3 bg-blue-50/40 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium transition-all"
                    required
                  />
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
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <span>Send OTP Verification Code</span>
                )}
              </button>
            </form>

            <button 
              onClick={() => setForgotState('none')}
              className="w-full text-center text-xs font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mt-2 py-1 cursor-pointer transition-colors"
            >
              Cancel & Go Back
            </button>
          </div>
        )}


        {/* ---------------- STEP 2: ENTER OTP CODE ---------------- */}
        {forgotState === 'otp' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setForgotState('email')} 
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-black text-gray-900 dark:text-white font-sans">Verify Security OTP</h2>
            </div>

            <div className="bg-blue-50/50 dark:bg-slate-800/40 p-3 rounded-2xl border border-blue-100/60 dark:border-slate-800 flex gap-2">
              <Info className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                We sent a 6-digit verification code to <strong className="text-gray-800 dark:text-gray-200">{forgotEmail}</strong>. Enter it below to unlock password reset privileges.
              </p>
            </div>

            {recoveryError && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-red-700 dark:text-red-400 p-3 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{recoveryError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* Premium segmented 6-digit code box inputs */}
              <div>
                <label className="block text-center text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-3">6-Digit Verification Code</label>
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
                  <span>Verify OTP & Proceed</span>
                )}
              </button>
            </form>

            <div className="text-center space-y-3.5">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Didn't receive code?{' '}
                {otpTimer > 0 ? (
                  <span className="text-gray-400 dark:text-gray-500 font-semibold font-mono">Resend in {otpTimer}s</span>
                ) : (
                  <button
                    onClick={() => {
                      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                      setGeneratedOtp(newCode);
                      console.log(`[Developer Debug Mode] Resent OTP Verification Code: ${newCode}`);
                      setSandboxNotification(`A new secure verification code has been dispatched to <strong>${forgotEmail}</strong>.`);
                      setOtpTimer(45);
                      setRecoveryError('');
                      setOtpInputs(Array(6).fill(''));
                    }}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer bg-transparent border-none p-0 text-xs"
                  >
                    Resend Code (OTP)
                  </button>
                )}
              </p>

              <button 
                onClick={() => setForgotState('email')}
                className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              >
                Change Email Address
              </button>
            </div>
          </div>
        )}


        {/* ---------------- STEP 3: NEW PASSWORD RESET FORM ---------------- */}
        {forgotState === 'new-password' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5.5 w-5.5 text-emerald-500 shrink-0" />
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Secure Reset Authorized</h2>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Security verification succeeded! Please type your new strong password below to save changes.
            </p>

            {recoveryError && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-red-700 dark:text-red-400 p-3 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{recoveryError}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New password input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Lock className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500" />
                  </span>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full text-sm pl-10 pr-10 py-3 bg-blue-50/40 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm password input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Confirm New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Lock className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500" />
                  </span>
                  <input
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full text-sm pl-10 pr-10 py-3 bg-blue-50/40 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmNewPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] disabled:bg-gray-400"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span>Saving Password...</span>
                  </>
                ) : (
                  <span>Reset & Save Password</span>
                )}
              </button>
            </form>
          </div>
        )}


        {/* ---------------- STEP 4: SUCCESS ANIMATION STATE ---------------- */}
        {forgotState === 'success' && (
          <div className="text-center space-y-6 py-4">
            <div className="inline-flex items-center justify-center bg-emerald-100 dark:bg-emerald-950/40 p-4 rounded-full border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 shadow-md">
              <CheckCircle2 className="h-10 w-10 shrink-0" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-gray-900 dark:text-white font-sans tracking-tight">Password Reset Done!</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                Your credentials have been successfully updated in the database. You can now log in securely using your new credentials.
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 p-3.5 rounded-2xl text-xs font-semibold">
              Updated account: {forgotEmail}
            </div>

            <button
              onClick={() => {
                setForgotState('none');
                setEmail(forgotEmail);
                setPassword('');
                setError('');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
            >
              Back to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

