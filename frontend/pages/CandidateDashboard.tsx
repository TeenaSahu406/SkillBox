import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ProfileCompletionCard } from '../components/ProfileCompletionCard';
import { JobCard } from '../components/JobCard';
import { User, MapPin, Briefcase, FileText, Bookmark, ClipboardList, ArrowRight, ExternalLink } from 'lucide-react';

export const CandidateDashboard: React.FC = () => {
  const { profile, applications, savedJobIds, jobs, toggleSaveJob } = useApp();
  const navigate = useNavigate();

  // Filter saved jobs
  const savedJobs = jobs.filter((job) => savedJobIds.includes(job.id));

  // Quick action options
  const quickActions = [
    { title: 'Update Resume', desc: 'Refresh your professional credentials PDF', link: '/profile', icon: FileText, color: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400' },
    { title: 'Edit Bio/Summary', desc: 'Polished bios attract 3x more HR attention', link: '/profile', icon: User, color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' },
    { title: 'Show Extra Skills', desc: 'Link YouTube, Instagram, GitHub, Behance', link: '/profile', icon: ExternalLink, color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome header banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden transition-all duration-300">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome back, {profile.name}!</h1>
          <p className="mt-2 text-sm text-blue-100 dark:text-blue-200 leading-relaxed">
            Recruiters are active in your area. Keep your extra skills links and portfolios updated to stand out from other candidates.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate('/jobs')}
              className="px-4 py-2 bg-white text-blue-600 font-bold rounded-xl text-xs hover:bg-blue-50 transition-colors shadow-xs cursor-pointer"
            >
              Search Open Jobs
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 bg-blue-700/50 text-white border border-blue-400/30 font-bold rounded-xl text-xs hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Edit Profile
            </button>
          </div>
        </div>
        {/* Decor */}
        <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
          <Briefcase className="w-48 h-48" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Profile Summary Card & Quick actions (spans 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Summary Card */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors duration-300">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Candidate Profile Summary</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-4 border-b border-gray-50 dark:border-slate-800">
              {profile.profilePic ? (
                <img
                  src={profile.profilePic}
                  alt={profile.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-gray-100 dark:border-slate-800"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm border border-blue-500/30">
                  {profile.name ? profile.name.trim().split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                </div>
              )}
              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{profile.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{profile.location} • {profile.phone}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{profile.education}</p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Professional Bio</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                {profile.profileSummary || "No professional summary added yet. Completing your summary helps recruiters find you."}
              </p>
            </div>
            
            {/* Skills listed */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {profile.skills.map((skill, idx) => (
                <span key={idx} className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 px-2.5 py-1 rounded-lg">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Applications list */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>Recent Applications ({applications.length})</span>
              </h2>
              <Link to="/applications" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500 space-y-2">
                <p className="text-sm">You haven't applied to any jobs yet.</p>
                <Link to="/jobs" className="inline-block text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                  Find jobs now
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-slate-800">
                {applications.slice(0, 3).map((app) => (
                  <div key={app.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{app.jobTitle}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{app.companyName} • Applied on {app.appliedDate}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      app.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/40' :
                      app.status === 'Shortlisted' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40' :
                      'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/40'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Profile completion & Saved Jobs */}
        <div className="space-y-6">
          {/* Dynamic Profile Strength Progress widget */}
          <ProfileCompletionCard />

          {/* Saved / Bookmarked jobs list */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors duration-300">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-50 dark:border-slate-800 pb-3">
              <Bookmark className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
              <span>Saved Jobs ({savedJobs.length})</span>
            </h2>

            {savedJobs.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 py-4 text-center">No saved jobs yet.</p>
            ) : (
              <div className="space-y-3.5">
                {savedJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="group flex items-start gap-3 justify-between p-2.5 rounded-xl border border-gray-50 dark:border-slate-800/60 hover:border-blue-100 dark:hover:border-slate-700 hover:bg-blue-50/10 dark:hover:bg-blue-950/10 transition-colors">
                    <div className="min-w-0">
                      <Link to={`/job/${job.id}`} className="text-xs font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1">
                        {job.title}
                      </Link>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{job.company} • {job.location}</p>
                      <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-1">{job.salary}</p>
                    </div>
                    
                    <button
                      onClick={() => toggleSaveJob(job.id)}
                      className="p-1.5 text-gray-300 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg shrink-0 cursor-pointer"
                      title="Remove from saved"
                    >
                      <Bookmark className="h-4 w-4 fill-blue-600 text-blue-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 transition-colors duration-300">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recommended Steps</h3>
            <div className="space-y-3">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={idx}
                    to={action.link}
                    className="flex items-start gap-3 p-2.5 rounded-xl border border-gray-50 dark:border-slate-800/60 hover:border-blue-100 dark:hover:border-slate-700 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all group"
                  >
                    <div className={`p-2 rounded-lg ${action.color} shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{action.title}</h4>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-snug line-clamp-1">{action.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
