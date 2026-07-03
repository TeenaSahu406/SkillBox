import React from 'react';
import { Mail } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="bg-gray-50/50 dark:bg-slate-950 min-h-screen py-20 flex items-center justify-center transition-colors duration-300">
      <div className="max-w-md w-full mx-auto px-6 text-center space-y-6">
        <div className="inline-flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-900/30">
          <Mail className="h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Contact SkillBox</h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            For support, inquiries, or assistance, please email us directly at:
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-300">
          <a 
            href="mailto:skillbox2026@gmail.com" 
            className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400 hover:underline break-all"
          >
            skillbox2026@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};
