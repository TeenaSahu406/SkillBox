import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FileText, Globe, Youtube, Instagram, Github, Palette, Send, ArrowRight, CheckCircle2, ChevronLeft, Sparkles, AlertTriangle, Linkedin } from 'lucide-react';

export const ApplyJobPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobs, profile, applyToJob, applications, currentUser } = useApp();

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Job Not Found</h2>
        <Link to="/jobs" className="inline-block px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl">
          Back to Listings
        </Link>
      </div>
    );
  }

  const hasApplied = applications.some(
    (app) => app.jobId === job.id && app.applicantId === (currentUser?.id || 'cand-1')
  );

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = applyToJob(job.id);
    if (success) {
      setSubmitted(true);
    } else {
      setError('You have already applied to this job!');
      setTimeout(() => {
        navigate('/applications');
      }, 2500);
    }
  };

  if (hasApplied) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
        <div className="h-16 w-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto border border-blue-100 dark:border-blue-900/40">
          <CheckCircle2 className="h-10 w-10 fill-blue-50 dark:fill-blue-950/20" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Already Applied!</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You have already applied to <strong>{job.title}</strong> at <strong>{job.company}</strong>.
          </p>
        </div>
        
        <div className="flex gap-3 justify-center">
          <Link
            to="/applications"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Track Status
          </Link>
          <Link
            to="/jobs"
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-slate-900 dark:text-gray-300 dark:border-slate-800 font-bold text-xs rounded-xl"
          >
            Find More Jobs
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
        <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100 animate-bounce">
          <CheckCircle2 className="h-10 w-10 fill-emerald-50" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Application Submitted!</h2>
          <p className="text-sm text-gray-500">
            Your profile details, resume, and extra skill portfolios have been sent to <strong>{job.company}</strong>.
          </p>
        </div>
        
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-400 leading-relaxed text-left">
          <p className="font-bold text-gray-500 mb-1">What happens next?</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Recruiters will evaluate your skill matches.</li>
            <li>You can track the shortlist status on your applications list.</li>
            <li>If selected, HR will reach out via your listed contact details.</li>
          </ul>
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            to="/applications"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Track Status
          </Link>
          <Link
            to="/jobs"
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl"
          >
            Find More Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 dark:bg-slate-950 min-h-screen py-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header navigation */}
        <Link to={`/job/${job.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Job details</span>
        </Link>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6 transition-colors duration-300">
          {/* Header titles */}
          <div className="border-b border-gray-50 dark:border-slate-800 pb-4">
            <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">Apply for Position</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Applying for <strong className="text-gray-800 dark:text-gray-200">{job.title}</strong> at <strong className="text-gray-800 dark:text-gray-200">{job.company}</strong> ({job.location})
            </p>
          </div>

          <form onSubmit={handleConfirmSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-2xl flex items-center gap-3 text-xs text-red-800 dark:text-red-300 animate-pulse">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
                <div>
                  <p className="font-bold">Application Notice</p>
                  <p className="mt-0.5">{error} Redirecting to your applications tracker...</p>
                </div>
              </div>
            )}
            
            {/* Subsection: Resume Preview */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">1. Resume PDF Verification</h3>
              {profile.resumePdfName ? (
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{profile.resumePdfName}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Format: PDF • Fully synchronized</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md">
                    Ready to attach
                  </span>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-bold">Missing Resume Attachment</p>
                    <p className="mt-0.5">Please add a simulated resume file name in your <Link to="/profile" className="underline font-semibold">Profile details</Link> before applying.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Subsection: Portfolios Preview */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">2. Extra Skills & Portfolio Preview</h3>
              
              {profile.hasExtraSkills && profile.extraSkills ? (
                <div className="p-5 bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-blue-800 dark:text-blue-300">Specialty Area:</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{profile.extraSkills.skillName}</span>
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
                    The following showcase links from your profile will be sent to the recruiter to display your hands-on expertise:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(profile.linkedin || profile.extraSkills?.linkedin) && (
                      <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 text-xs text-gray-800 dark:text-gray-200 font-semibold">
                        <Linkedin className="h-4 w-4 text-blue-700 fill-blue-700 bg-white" />
                        <span className="truncate">{profile.linkedin || profile.extraSkills?.linkedin}</span>
                      </div>
                    )}
                    {(profile.github || profile.extraSkills?.github) && (
                      <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 text-xs text-gray-800 dark:text-gray-200 font-semibold">
                        <Github className="h-4 w-4 text-slate-800 dark:text-slate-200" />
                        <span className="truncate">{profile.github || profile.extraSkills?.github}</span>
                      </div>
                    )}
                    {profile.extraSkills.portfolioWebsite && (
                      <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 text-xs text-gray-800 dark:text-gray-200 font-semibold">
                        <Globe className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        <span className="truncate">{profile.extraSkills.portfolioWebsite}</span>
                      </div>
                    )}
                    {profile.extraSkills.youtube && (
                      <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 text-xs text-gray-800 dark:text-gray-200 font-semibold">
                        <Youtube className="h-4 w-4 text-red-500 dark:text-red-400" />
                        <span className="truncate">{profile.extraSkills.youtube}</span>
                      </div>
                    )}
                    {profile.extraSkills.instagram && (
                      <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 text-xs text-gray-800 dark:text-gray-200 font-semibold">
                        <Instagram className="h-4 w-4 text-pink-500 dark:text-pink-400" />
                        <span className="truncate">{profile.extraSkills.instagram}</span>
                      </div>
                    )}
                    {profile.extraSkills.behance && (
                      <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 text-xs text-gray-800 dark:text-gray-200 font-semibold">
                        <Palette className="h-4 w-4 text-indigo-600 dark:text-blue-400" />
                        <span className="truncate">{profile.extraSkills.behance}</span>
                      </div>
                    )}
                    {profile.extraSkills.otherUrl && (
                      <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 text-xs text-gray-800 dark:text-gray-200 font-semibold col-span-1 sm:col-span-2">
                        <Globe className="h-4 w-4 text-purple-600" />
                        <span className="text-[10px] text-gray-400 mr-1 shrink-0 font-normal uppercase">[{profile.extraSkills.otherName || 'Custom'}]:</span>
                        <span className="truncate">{profile.extraSkills.otherUrl}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-2xl space-y-1">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">No Extra Skills Linked</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-normal">
                    You haven't linked any extra skills portfolios. You can still apply with your basic profile and resume PDF, but linking portfolios boosts recruiter response by 45%.
                  </p>
                </div>
              )}
            </div>

            {/* Submit block */}
            <div className="border-t border-gray-50 dark:border-slate-800 pt-5 flex items-center justify-between gap-4">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight max-w-[320px]">
                By submitting, you agree to share your profile, contact details, resume, and portfolios with {job.company}.
              </p>

              <button
                type="submit"
                className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Send className="h-4 w-4" />
                <span>Submit Application</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
