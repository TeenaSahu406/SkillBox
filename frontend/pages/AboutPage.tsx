import React from 'react';
import { Sparkles, Heart, Rocket, Target, HelpCircle } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-gray-50/50 dark:bg-slate-950 min-h-screen py-10 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Hero Concept */}
        <div className="text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-100/40 dark:border-blue-900/40">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Unleashing Creative Candidates</span>
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
            Beyond the Two-Page Resume
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Standard applicant trackers strip away candidate personality. At SkillBox, we believe your personal vlogs, open-source repositories, and pixel-perfect design screens represent your true velocity.
          </p>
        </div>

        {/* Feature grid mapping */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3 transition-colors duration-300">
            <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl w-fit">
              <Rocket className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Showcase Passion Projects</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Don't hide your creative outlets. Showcase your YouTube tech tutorials, travel stories, lifestyle vlogs, or design archives directly in your dashboard application.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3 transition-colors duration-300">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl w-fit">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Holistic Recruiter Vetting</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Hiring managers view aggregated portfolio decks directly beside candidate applications. Skip sterile whiteboard screening loops and view working demonstrations.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3 transition-colors duration-300">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Build Your True Brand</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Tailor your profile with specialized extra skill categories and control what links go out. Your career is multidimensional—your recruitment hub should be too.
            </p>
          </div>
        </div>

        {/* Philosophy detail */}
        <div className="bg-slate-900 dark:bg-slate-900 border border-transparent dark:border-slate-800 text-white rounded-3xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="space-y-4 max-w-lg">
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Are you a candidate with extra skills?</h2>
            <p className="text-xs md:text-sm text-slate-300 dark:text-slate-300 leading-relaxed">
              Toggling on <strong>Extra Skills</strong> on your profile page gives hiring partners direct visibility into your live contributions. Highlight GitHub repositories, YouTube videos, Instagram aesthetics, or Behance screens effortlessly.
            </p>
          </div>
          <button className="px-6 py-3 bg-white text-slate-950 font-bold text-xs rounded-xl shadow-xs shrink-0 self-start md:self-center cursor-pointer hover:bg-slate-100 transition-colors">
            Update Profile Portfolio
          </button>
        </div>

      </div>
    </div>
  );
};
