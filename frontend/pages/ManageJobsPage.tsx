import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Trash2, Globe, Github, Youtube, Instagram, Palette, Check, X, FileText, Sparkles, MapPin, Search, Linkedin } from 'lucide-react';

const resolveLink = (url: string, defaultPrefix: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${defaultPrefix}${url}`;
};

export const ManageJobsPage: React.FC = () => {
  const { jobs, applications, deleteJob, updateApplicationStatus } = useApp();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    if (jobs.length > 0) {
      if (!selectedJobId || !jobs.some((j) => j.id === selectedJobId)) {
        setSelectedJobId(jobs[0].id);
      }
    } else {
      setSelectedJobId(null);
    }
  }, [jobs, selectedJobId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const selectedJob = jobs.find((j) => j.id === selectedJobId);
  const jobApplications = applications.filter((app) => app.jobId === selectedJobId);

  // Filter candidates if query exists
  const filteredApplications = jobApplications.filter((app) => {
    const term = searchQuery.toLowerCase();
    return (
      app.applicantProfile.name.toLowerCase().includes(term) ||
      (app.applicantProfile.extraSkills?.skillName || '').toLowerCase().includes(term) ||
      (app.applicantProfile.location || '').toLowerCase().includes(term)
    );
  });

  const confirmDelete = () => {
    if (jobToDelete) {
      deleteJob(jobToDelete);
      // Select another job if deleted one was active
      if (selectedJobId === jobToDelete) {
        const remaining = jobs.filter((j) => j.id !== jobToDelete);
        setSelectedJobId(remaining[0]?.id || null);
      }
      setJobToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight font-sans">Manage Job Postings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track applicants, audit portfolios, and maintain active listings.</p>
        </div>
        <Link
          to="/post-job"
          className="inline-flex items-center gap-1 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start"
        >
          <span>Post a Job</span>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 transition-colors duration-300">
          <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-500 flex items-center justify-center mx-auto border border-blue-100 dark:border-blue-900/40">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Job Listings Posted</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Publish your first opportunity to receive applicant profiles and special extra skills portfolio links.
          </p>
          <Link
            to="/post-job"
            className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Post a Job Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Job Posts List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">Active Positions</h3>
            <div className="space-y-2">
              {jobs.map((j) => {
                const count = applications.filter((app) => app.jobId === j.id).length;
                const isActive = j.id === selectedJobId;
                return (
                  <div
                    key={j.id}
                    onClick={() => setSelectedJobId(j.id)}
                    className={`p-4 border rounded-2xl cursor-pointer transition-all flex justify-between items-center gap-4 ${
                      isActive
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{j.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{j.company}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                          {j.type}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                          {count} candidate{count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setJobToDelete(j.id);
                      }}
                      className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete job posting"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Applicants for Selected Job */}
          <div className="lg:col-span-2 space-y-4">
            {selectedJob ? (
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6 transition-colors duration-300">
                
                {/* Header overview for selected job */}
                <div className="border-b border-gray-100 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                      {selectedJob.category}
                    </span>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white mt-1 tracking-tight">{selectedJob.title}</h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{selectedJob.company} • {selectedJob.location}</p>
                  </div>

                  {/* Search box within candidates */}
                  <div className="relative max-w-xs w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search candidate name or skill..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>

                {/* Candidate Applications list */}
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                    <Users className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-700 mb-2" />
                    <p className="text-sm font-medium">No candidates meet the active search criteria.</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Once candidates apply, their comprehensive skill portfolios will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredApplications.map((app) => (
                      <div
                        key={app.id}
                        className="p-5 border border-gray-100 dark:border-slate-800 rounded-2xl bg-gray-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800/50 hover:border-gray-200 dark:hover:border-slate-700 transition-all space-y-4"
                      >
                        {/* Profile overview */}
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <img
                              src={app.applicantProfile.profilePic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                              alt={app.applicantProfile.name}
                              className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-slate-700"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <h4 className="text-sm font-black text-gray-900 dark:text-white">{app.applicantProfile.name}</h4>
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{app.applicantProfile.title}</p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" />
                                {app.applicantProfile.location}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {(app.applicantProfile.linkedin || app.applicantProfile.extraSkills?.linkedin) && (
                                  <a
                                    href={resolveLink(app.applicantProfile.linkedin || app.applicantProfile.extraSkills?.linkedin, 'https://linkedin.com/in/')}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold"
                                  >
                                    <Linkedin className="h-3 w-3 fill-blue-600 bg-white" />
                                    <span>LinkedIn</span>
                                  </a>
                                )}
                                {(app.applicantProfile.github || app.applicantProfile.extraSkills?.github) && (
                                  <a
                                    href={resolveLink(app.applicantProfile.github || app.applicantProfile.extraSkills?.github, 'https://github.com/')}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] text-slate-800 dark:text-slate-200 hover:underline font-bold"
                                  >
                                    <Github className="h-3 w-3 text-slate-800 dark:text-slate-200" />
                                    <span>GitHub</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick decision actions */}
                          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-50 dark:border-slate-800">
                            {app.status === 'Pending' && (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => updateApplicationStatus(app.id, 'Rejected')}
                                  className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-[10px] font-bold rounded-lg border border-rose-100 dark:border-rose-900/40 cursor-pointer flex items-center gap-1 transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  <span>Reject</span>
                                </button>
                                <button
                                  onClick={() => updateApplicationStatus(app.id, 'Shortlisted')}
                                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-colors"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Shortlist</span>
                                </button>
                              </div>
                            )}

                            {app.status === 'Shortlisted' && (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => updateApplicationStatus(app.id, 'Rejected')}
                                  className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-[10px] font-bold rounded-lg border border-rose-100 dark:border-rose-900/40 cursor-pointer flex items-center gap-1 transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  <span>Reject</span>
                                </button>
                                <button
                                  onClick={() => updateApplicationStatus(app.id, 'Interviewing')}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-colors"
                                >
                                  <Sparkles className="h-3.5 w-3.5" />
                                  <span>Start Interview</span>
                                </button>
                              </div>
                            )}

                            {app.status === 'Interviewing' && (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => updateApplicationStatus(app.id, 'Rejected')}
                                  className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-[10px] font-bold rounded-lg border border-rose-100 dark:border-rose-900/40 cursor-pointer flex items-center gap-1 transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  <span>Reject</span>
                                </button>
                                <button
                                  onClick={() => updateApplicationStatus(app.id, 'Hired')}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-colors"
                                >
                                  <span>Offer Role 🎉</span>
                                </button>
                              </div>
                            )}

                            {app.status === 'Hired' && (
                              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-1">
                                <span>🎉 Selected / Hired</span>
                              </span>
                            )}

                            {app.status === 'Rejected' && (
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
                                  Rejected
                                </span>
                                <button
                                  onClick={() => updateApplicationStatus(app.id, 'Pending')}
                                  className="px-2.5 py-1 text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                                >
                                  Re-evaluate
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* COMPREHENSIVE CANDIDATE BIODATA PANEL */}
                        <div className="border border-gray-200/60 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50 p-5 space-y-5 shadow-xs">
                          <h5 className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 border-b border-gray-100 dark:border-slate-800 pb-2">
                            Official Candidate Biodata
                          </h5>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left Column: Essential Contacts */}
                            <div className="space-y-4 border-r border-gray-100 dark:border-slate-800 md:pr-4">
                              <div>
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Contact Email</span>
                                <p className="text-xs text-gray-800 dark:text-gray-200 font-semibold break-all select-all">{app.applicantProfile.email}</p>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Phone Number</span>
                                <p className="text-xs text-gray-800 dark:text-gray-200 font-bold select-all">{app.applicantProfile.phone || 'Not Provided'}</p>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Address / Location</span>
                                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{app.applicantProfile.location || 'Not Provided'}</p>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Resume Document</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <FileText className="h-4 w-4 text-red-500 shrink-0" />
                                  {(app.resumePdfData || app.applicantProfile?.resumePdfData) ? (
                                    <a
                                      href={app.resumePdfData || app.applicantProfile.resumePdfData}
                                      download={app.resumePdfName || 'applicant_resume.pdf'}
                                      className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline truncate flex-1"
                                      title="Download candidate's resume PDF"
                                    >
                                      <span>Download PDF</span>
                                    </a>
                                  ) : (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">
                                      {app.resumePdfName || 'resume.pdf'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Middle Column: Professional Summary & Education */}
                            <div className="md:col-span-2 space-y-4">
                              <div>
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Professional Statement</span>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-normal italic bg-slate-50 dark:bg-slate-800/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                  "{app.applicantProfile.profileSummary || 'A driven professional with a track record of delivering clean and efficient solution workflows.'}"
                                </p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Education Background</span>
                                  <p className="text-xs text-gray-800 dark:text-gray-200 font-semibold">{app.applicantProfile.education || 'Not Specified'}</p>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Certifications</span>
                                  {app.applicantProfile.certifications && app.applicantProfile.certifications.length > 0 ? (
                                    <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-300 space-y-0.5">
                                      {app.applicantProfile.certifications.map((cert, i) => (
                                        <li key={i} className="truncate">{cert}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">No formal certifications listed</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Skills & Projects Areas */}
                          <div className="border-t border-gray-100 dark:border-slate-800/80 pt-4 space-y-4">
                            {/* Skills Pills */}
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">Technical Skills & Expertise</span>
                              <div className="flex flex-wrap gap-1.5">
                                {app.applicantProfile.skills && app.applicantProfile.skills.length > 0 ? (
                                  app.applicantProfile.skills.map((skill, index) => (
                                    <span
                                      key={index}
                                      className="px-2.5 py-1 text-[10px] font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
                                    >
                                      {skill}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-400 dark:text-gray-500 italic">No skill tags listed</span>
                                )}
                              </div>
                            </div>

                            {/* Projects Preview */}
                            {app.applicantProfile.projects && app.applicantProfile.projects.length > 0 && (
                              <div>
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">Key Featured Projects</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {app.applicantProfile.projects.map((proj, idx) => (
                                    <div key={idx} className="p-3 border border-gray-100 dark:border-slate-800/80 bg-gray-50/50 dark:bg-slate-800/10 rounded-xl space-y-1">
                                      <div className="flex justify-between items-center">
                                        <h6 className="text-xs font-bold text-gray-800 dark:text-white truncate">{proj.title}</h6>
                                        {proj.link && (
                                          <a
                                            href={proj.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold"
                                          >
                                            View project
                                          </a>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">{proj.description}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Extra Portfolio Links Preview (The Core USP) */}
                        {app.applicantProfile.hasExtraSkills && app.applicantProfile.extraSkills ? (
                          <div className="p-3.5 bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-bold text-blue-800 dark:text-blue-300">Extra Skill Area:</span>
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-100 dark:border-slate-700">
                                  {app.applicantProfile.extraSkills.skillName}
                                </span>
                              </div>
                              <span className="text-[10px] text-blue-500 dark:text-blue-400 font-bold uppercase tracking-wider">Candidate Portfolio</span>
                            </div>

                            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
                              The candidate highlighted their passion. Directly review their live assets:
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {(app.applicantProfile.linkedin || app.applicantProfile.extraSkills?.linkedin) && (
                                <a
                                  href={resolveLink(app.applicantProfile.linkedin || app.applicantProfile.extraSkills?.linkedin, 'https://linkedin.com/in/')}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-[10px] text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-bold rounded-lg border border-gray-100 dark:border-slate-700 transition-colors"
                                >
                                  <Linkedin className="h-3.5 w-3.5 text-blue-700 fill-blue-700 bg-white" />
                                  <span>LinkedIn</span>
                                </a>
                              )}
                              {(app.applicantProfile.github || app.applicantProfile.extraSkills?.github) && (
                                <a
                                  href={resolveLink(app.applicantProfile.github || app.applicantProfile.extraSkills?.github, 'https://github.com/')}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[10px] text-gray-800 dark:text-gray-200 hover:text-slate-800 dark:hover:text-white font-bold rounded-lg border border-gray-100 dark:border-slate-700 transition-colors"
                                >
                                  <Github className="h-3.5 w-3.5 text-slate-800 dark:text-slate-200" />
                                  <span>GitHub</span>
                                </a>
                              )}
                              {app.applicantProfile.extraSkills.portfolioWebsite && (
                                <a
                                  href={resolveLink(app.applicantProfile.extraSkills.portfolioWebsite, 'https://')}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-[10px] text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-bold rounded-lg border border-gray-100 dark:border-slate-700 transition-colors"
                                >
                                  <Globe className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                                  <span>Website</span>
                                </a>
                              )}
                              {app.applicantProfile.extraSkills.youtube && (
                                <a
                                  href={resolveLink(app.applicantProfile.extraSkills.youtube, 'https://youtube.com/')}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-[10px] text-gray-800 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 font-bold rounded-lg border border-gray-100 dark:border-slate-700 transition-colors"
                                >
                                  <Youtube className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                                  <span>YouTube</span>
                                </a>
                              )}
                              {app.applicantProfile.extraSkills.instagram && (
                                <a
                                  href={resolveLink(app.applicantProfile.extraSkills.instagram, 'https://instagram.com/')}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-950/20 text-[10px] text-gray-800 dark:text-gray-200 hover:text-pink-600 dark:hover:text-pink-400 font-bold rounded-lg border border-gray-100 dark:border-slate-700 transition-colors"
                                >
                                  <Instagram className="h-3.5 w-3.5 text-pink-500 dark:text-pink-400" />
                                  <span>Instagram</span>
                                </a>
                              )}
                              {app.applicantProfile.extraSkills.behance && (
                                <a
                                  href={resolveLink(app.applicantProfile.extraSkills.behance, 'https://behance.net/')}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-[10px] text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-bold rounded-lg border border-gray-100 dark:border-slate-700 transition-colors"
                                >
                                  <Palette className="h-3.5 w-3.5 text-indigo-600 dark:text-blue-400" />
                                  <span>Behance</span>
                                </a>
                              )}
                              {app.applicantProfile.extraSkills.otherUrl && (
                                <a
                                  href={resolveLink(app.applicantProfile.extraSkills.otherUrl, 'https://')}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-[10px] text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-bold rounded-lg border border-gray-100 dark:border-slate-700 transition-colors"
                                >
                                  <Globe className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                  <span>{app.applicantProfile.extraSkills.otherName || 'Custom'}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">No extra-skill portfolio links provided by this candidate.</p>
                        )}

                      </div>
                    ))}
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-12 text-center text-gray-400 dark:text-gray-500 transition-colors">
                <p>Select a job from the active positions column to inspect applicants.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Custom Confirmation Modal */}
      {jobToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 shrink-0 bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center border border-red-100 dark:border-red-900/40">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">Delete Job Posting?</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                  Are you absolutely sure you want to delete this job? This operation is permanent and will automatically withdraw all active candidate applications for this position.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setJobToDelete(null)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl border border-gray-200/50 dark:border-slate-700 cursor-pointer transition-colors"
              >
                Keep Posting
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                Delete Position
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
