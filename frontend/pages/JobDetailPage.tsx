import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MapPin, DollarSign, Briefcase, Calendar, ChevronLeft, Award, Sparkles, Building2, CheckCircle2, Copy, Check, Brain } from 'lucide-react';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobs, applications, currentUser } = useApp();

  const job = jobs.find((j) => j.id === id);
  
  if (!job) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Job Posting Not Found</h2>
        <p className="text-sm text-gray-500">The job listing you are looking for has been removed or expired.</p>
        <Link to="/jobs" className="inline-block px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl">
          Back to Listings
        </Link>
      </div>
    );
  }

  const hasApplied = applications.some(
    (app) => app.jobId === job.id && app.applicantId === (currentUser?.id || 'cand-1')
  );

  return (
    <div className="bg-gray-50/50 dark:bg-slate-950 min-h-screen py-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Breadcrumb link */}
        <Link to="/jobs" className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          <span>Back to All Jobs</span>
        </Link>

 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main info (spans 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6 transition-colors duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {job.companyLogo ? (
                    <img
                      src={job.companyLogo}
                      alt={job.company}
                      className="w-16 h-16 rounded-2xl object-cover border border-gray-100 dark:border-slate-800"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-2xl border border-blue-100 dark:border-blue-900/40">
                      {job.company.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-md">{job.category}</span>
                    <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-2 tracking-tight">{job.title}</h1>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-0.5">{job.company}</p>
                  </div>
                </div>
              </div>
 
              {/* Quick info row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-slate-800/40 rounded-2xl border border-gray-100/50 dark:border-slate-800/60 text-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Salary</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{job.salary}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Location</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{job.location}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Experience</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{job.experience}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Type</span>
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{job.type}</p>
                </div>
              </div>
 
              {/* Skills required section */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Skills Required</h3>
                <div className="flex flex-wrap gap-1.5">
                  {job.skillsRequired.map((skill, index) => (
                    <span
                      key={index}
                      className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
 
            {/* Description Card */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6 transition-colors duration-300">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-50 dark:border-slate-800">Job Description</h2>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed">
                  <p>{job.description}</p>
                  <p>
                    As a key team member, you will take ownership of specific technical outputs, contribute to group code reviews, and provide high-fidelity contributions. Working on modern products demands robust technical planning, optimization, and close cooperation with creative designers.
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">What we look for:</p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Exceptional communication skills and self-motivation.</li>
                    <li>Strong foundation in modern clean code paradigms.</li>
                    <li>Ability to deliver on rapid timelines without losing quality.</li>
                    <li>Portfolio demonstrations representing extra skills are a massive plus!</li>
                  </ul>
                </div>
              </div>
 
              {/* Interactive prompt to show extra skills */}
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 animate-pulse-slow" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300">Pro-Tip for Candidates:</h4>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-normal">
                    This employer values candidates with diverse talents. Go to your <strong className="underline"><Link to="/profile">Profile page</Link></strong> and toggle the <strong>Extra Skills</strong> section to link your YouTube vlogs, GitHub codes, or Behance screens!
                  </p>
                </div>
              </div>
            </div>
          </div>
 
          {/* Right column sidebar summary cards */}
          <div className="space-y-6">
            {/* Quick Summary list */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5 transition-colors duration-300">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Job Summary</h3>
              
              <div className="space-y-3.5">
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500 shrink-0" />
                  <span>Posted on: <strong className="text-gray-800 dark:text-gray-200">{job.postedDate}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                  <Briefcase className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500 shrink-0" />
                  <span>Job Category: <strong className="text-gray-800 dark:text-gray-200">{job.category}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                  <MapPin className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500 shrink-0" />
                  <span>Location: <strong className="text-gray-800 dark:text-gray-200">{job.location}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                  <DollarSign className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500 shrink-0" />
                  <span>Salary Range: <strong className="text-gray-800 dark:text-gray-200">{job.salary}</strong></span>
                </div>
              </div>
 
              {/* Apply / Status triggers */}
              {hasApplied ? (
                <div className="text-center p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400 space-y-1.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400 mx-auto" />
                  <p className="text-xs font-bold">Already Applied</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-500">You can track your application status in your dashboard.</p>
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/apply/${job.id}`)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer text-center"
                >
                  Apply for this Job
                </button>
              )}
            </div>
 
            {/* Quick terms */}
            <div className="p-5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl text-[11px] text-gray-400 dark:text-gray-500 leading-normal space-y-2">
              <p className="font-bold uppercase text-gray-500 dark:text-gray-400">Security Warning:</p>
              <p>SkillBox never requests candidates to pay for registration or job offers. Always verify email domains are legitimate.</p>
            </div>
          </div>
 
        </div>
 
      </div>
    </div>
  );
};
