import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Calendar, Bookmark, BookmarkCheck, Briefcase, ChevronRight } from 'lucide-react';
import { Job } from '../types';
import { useApp } from '../context/AppContext';

interface JobCardProps {
  job: Job;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const { savedJobIds, toggleSaveJob, applyToJob, applications, currentUser } = useApp();
  const navigate = useNavigate();
  
  const isSaved = savedJobIds.includes(job.id);
  const hasApplied = applications.some(app => app.jobId === job.id && app.applicantId === (currentUser?.id || 'cand-1'));

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaveJob(job.id);
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-200 dark:hover:border-blue-800/40 hover:shadow-md dark:hover:shadow-slate-900/40 transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Header: Logo, Company & Bookmark */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.company}
                className="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-slate-800"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-lg">
                {job.company.charAt(0)}
              </div>
            )}
            <div>
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{job.company}</h4>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 line-clamp-1">{job.title}</h3>
            </div>
          </div>

          <button
            onClick={handleSaveClick}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isSaved
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400'
                : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-100 dark:hover:border-blue-800'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save job'}
          >
            {isSaved ? <BookmarkCheck className="h-5 w-5 fill-blue-600" /> : <Bookmark className="h-5 w-5" />}
          </button>
        </div>

        {/* Job Details Meta */}
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs text-gray-500 dark:text-gray-400 mb-4 border-b border-gray-50 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <DollarSign className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
            <span className="truncate font-medium text-gray-700 dark:text-gray-300">{job.salary}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <Briefcase className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
            <span className="truncate">{job.experience}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <Calendar className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
            <span className="truncate">Posted: {job.postedDate}</span>
          </div>
        </div>

        {/* Job Type Badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
            job.type === 'Full-time' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' :
            job.type === 'Remote' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400' :
            job.type === 'Contract' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400' :
            'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400'
          }`}>
            {job.type}
          </span>
        </div>

        {/* Skills Required Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {job.skillsRequired.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="text-[10px] font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 px-2 py-0.5 rounded-full"
            >
              {skill}
            </span>
          ))}
          {job.skillsRequired.length > 3 && (
            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 px-1 py-0.5">
              +{job.skillsRequired.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 border-t border-gray-50 dark:border-slate-800 pt-4 mt-auto">
        <Link
          to={`/job/${job.id}`}
          className="flex-1 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
        >
          Details
        </Link>
        {hasApplied ? (
          <button
            disabled
            className="flex-1 py-2 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 rounded-xl"
          >
            Applied
          </button>
        ) : (
          <button
            onClick={() => navigate(`/apply/${job.id}`)}
            className="flex-1 py-2 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
};
