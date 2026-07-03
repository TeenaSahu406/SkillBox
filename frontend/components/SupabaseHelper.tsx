import React, { useState, useEffect } from 'react';
import { Database, Copy, Check, X, AlertTriangle, CheckCircle2, Terminal, Mail, Settings } from 'lucide-react';

export const SupabaseHelper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sqlSchema, setSqlSchema] = useState('');
  const [status, setStatus] = useState<'checking' | 'connected' | 'missing_tables' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  const [smtpStatus, setSmtpStatus] = useState<{
    configured: boolean;
    host: string;
    user: string;
    from: string;
    secure: string;
    port: string;
  } | null>(null);

  async function checkStatus() {
    try {
      // Fetch SQL Schema suggestion
      const schemaRes = await fetch('/api/supabase/schema-sql');
      const schemaData = await schemaRes.json();
      if (schemaData && schemaData.sql) {
        setSqlSchema(schemaData.sql);
      }

      // Fetch consolidated system status
      const systemRes = await fetch('/api/system/status');
      const systemData = await systemRes.json();
      
      if (systemData) {
        if (systemData.database.success) {
          if (systemData.database.message.includes('tables are not yet created')) {
            setStatus('missing_tables');
          } else {
            setStatus('connected');
          }
        } else {
          setStatus('error');
          setErrorMessage(systemData.database.message);
        }
        setSmtpStatus(systemData.smtp);
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Network error contacting system health API.');
    }
  }

  useEffect(() => {
    checkStatus();
  }, []);

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const handleCopy = () => {
    if (!sqlSchema) return;
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Badge Indicators in Navbar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all hover:scale-105 active:scale-95 bg-white dark:bg-slate-900 shadow-xs ${
            status === 'connected'
              ? 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
              : status === 'missing_tables'
              ? 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60 animate-pulse hover:bg-amber-50/50 dark:hover:bg-amber-950/20'
              : 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60 hover:bg-rose-50/50 dark:hover:bg-rose-950/20'
          }`}
          title="Check Workspace Connection & Configuration"
        >
          <Database className="h-3.5 w-3.5" />
          <span>DB: {status === 'connected' ? 'Connected' : status === 'missing_tables' ? 'Setup Required' : 'Disconnected'}</span>
        </button>

        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all hover:scale-105 active:scale-95 bg-white dark:bg-slate-900 shadow-xs ${
            smtpStatus?.configured
              ? 'text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20'
              : 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60 hover:bg-amber-50/50 dark:hover:bg-amber-950/20'
          }`}
          title="Check SMTP Mail Configuration"
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Email: {smtpStatus?.configured ? 'Gmail SMTP Active' : 'Sandbox Fallback'}</span>
        </button>
      </div>

      {/* Drawer Panel Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" id="system-status-drawer">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Drawer Panel Content */}
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col z-10 border-l border-gray-100 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-600 dark:text-indigo-400 animate-spin-slow" />
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white font-sans">Workspace Configuration Status</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              
              {/* SECTION 1: DATABASE STATUS */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-emerald-500" />
                  <span>Supabase Database</span>
                </h3>

                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  status === 'connected'
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                    : status === 'missing_tables'
                    ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300'
                    : 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-300'
                }`}>
                  {status === 'connected' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : status === 'missing_tables' ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <X className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold">
                      {status === 'connected' 
                        ? 'Database Connected & Tables Verified' 
                        : status === 'missing_tables' 
                        ? 'Connected to Supabase, but Tables Missing' 
                        : 'Database Connection Error'}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {status === 'connected'
                        ? 'Your profiles, jobs, and job application records are securely and successfully syncing in real-time.'
                        : status === 'missing_tables'
                        ? 'The Supabase connection works! However, the required database tables do not exist yet. Paste the SQL script below into your Supabase SQL editor and execute it.'
                        : `Supabase credentials might be incorrect or unreachable. Error: ${errorMessage}`}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-slate-950 p-4 rounded-xl border border-gray-100 dark:border-slate-800 text-xs font-mono space-y-1.5 text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Endpoint URL:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-100 break-all">https://iwhitefwtdiafnphlljl.supabase.co</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Connection Status:</span>
                    <span className={status === 'connected' || status === 'missing_tables' ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                      {status === 'connected' || status === 'missing_tables' ? 'Active' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: SMTP EMAIL SERVER STATUS */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-indigo-500" />
                  <span>SMTP Mail Server Configuration</span>
                </h3>

                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  smtpStatus?.configured
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/30 text-indigo-800 dark:text-indigo-300'
                    : 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300'
                }`}>
                  {smtpStatus?.configured ? (
                    <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold">
                      {smtpStatus?.configured 
                        ? 'Custom SMTP Active & Operating' 
                        : 'Using Dynamic Sandbox Fallback'}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {smtpStatus?.configured
                        ? 'Real OTP security verification and candidate notification emails are being dispatched dynamically via your custom SMTP server.'
                        : 'No custom SMTP parameters configured. The app automatically dispatches sandbox emails to high-fidelity test sandboxes with in-app developer preview access.'}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-slate-950 p-4 rounded-xl border border-gray-100 dark:border-slate-800 text-xs font-mono space-y-1.5 text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">SMTP Host:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-100">{smtpStatus?.host || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">SMTP Port:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-100">{smtpStatus?.port || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">SMTP User:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-100 break-all">{smtpStatus?.user || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">SMTP From:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-100 break-all">{smtpStatus?.from || 'Not set'}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: SQL SCHEMA COMMANDS */}
              {(status === 'missing_tables' || status === 'connected') && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="h-4 w-4 text-blue-500" />
                      <span>SQL Setup Instructions</span>
                    </h4>
                    <button
                      onClick={handleCopy}
                      disabled={!sqlSchema}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copied Script!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy SQL Script</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Open your <strong>Supabase SQL Editor</strong>, click <strong>"New Query"</strong>, paste the script below, and click <strong>"Run"</strong> to instantly generate the necessary tables:
                  </p>

                  <div className="relative">
                    <pre className="bg-slate-950 dark:bg-black text-slate-300 p-4 rounded-xl text-[10px] font-mono overflow-x-auto max-h-48 border border-slate-800 leading-relaxed shadow-inner">
                      {sqlSchema || '-- Loading database schema...'}
                    </pre>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 flex items-center justify-between">
              <button
                onClick={checkStatus}
                className="px-3.5 py-1.5 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Refresh Status
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Close Connection Panel
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
