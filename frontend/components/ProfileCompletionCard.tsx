import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, ArrowRight, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileCompletionCard: React.FC = () => {
  const { profile } = useApp();

  // Calculate dynamic progress
  const checks = [
    { label: 'Profile Summary', completed: !!profile.profileSummary, weight: 15 },
    { label: 'Profile Photo', completed: !!profile.profilePic && !profile.profilePic.includes('default'), weight: 15 },
    { label: 'Resume PDF Uploaded', completed: !!profile.resumePdfName, weight: 20 },
    { label: 'Education Information', completed: !!profile.education, weight: 15 },
    { label: 'Skills Added', completed: profile.skills.length > 0, weight: 15 },
    { label: 'Extra Skills & Portfolio Links', completed: profile.hasExtraSkills && !!profile.extraSkills?.skillName, weight: 20 }
  ];

  const totalProgress = checks.reduce((acc, curr) => acc + (curr.completed ? curr.weight : 0), 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Award className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
          <span>Profile Strength</span>
        </h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
          totalProgress >= 80 ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' :
          totalProgress >= 50 ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400' :
          'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
        }`}>
          {totalProgress}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-5">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            totalProgress >= 80 ? 'bg-emerald-500' :
            totalProgress >= 50 ? 'bg-blue-500' :
            'bg-amber-500'
          }`}
          style={{ width: `${totalProgress}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-3 mb-5">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center gap-2.5 text-xs">
            {check.completed ? (
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="h-4.5 w-4.5 text-gray-300 dark:text-gray-600 shrink-0" />
            )}
            <span className={check.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300 font-medium'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>

      {/* Action button */}
      {totalProgress < 100 && (
        <Link
          to="/profile"
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all text-center"
        >
          <span>Complete Your Profile</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
};
