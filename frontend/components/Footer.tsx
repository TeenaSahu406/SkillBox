import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white">
              <Briefcase className="h-7 w-7 text-blue-500 fill-blue-500/20" />
              <span>Skill<span className="text-blue-500">Box</span></span>
            </Link>
            <p className="text-sm text-slate-400">
              Empowering candidates to showcase authentic skillsets through interactive profiles, and enabling employers to discover verified talents instantly.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3">For Candidates</h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/jobs" className="hover:text-blue-400 transition-colors">Browse Jobs</Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-blue-400 transition-colors">My Profile</Link>
                </li>
                <li>
                  <Link to="/applications" className="hover:text-blue-400 transition-colors">My Applications</Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3">For Employers</h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/post-job" className="hover:text-blue-400 transition-colors">Post a New Job</Link>
                </li>
                <li>
                  <Link to="/manage-jobs" className="hover:text-blue-400 transition-colors">Manage Jobs</Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-blue-400 transition-colors">Contact Support</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SkillBox. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 md:mt-0">
            <span>Designed for recruiters & candidates worldwide.</span>
            <span className="mx-2 text-slate-700">|</span>
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to delete all stored database data (profiles, jobs, applications) from Supabase? This action is irreversible and starts a fresh slate.")) {
                  try {
                    const res = await fetch("/api/supabase/purge", { method: "POST" });
                    const result = await res.json();
                    if (result && result.success) {
                      localStorage.clear();
                      alert("Database successfully purged! All previous stored data has been deleted.");
                      window.location.reload();
                    } else {
                      alert("Database purge failed. Please try again.");
                    }
                  } catch (err: any) {
                    alert("Unable to connect to the database to purge data: " + err.message);
                  }
                }
              }}
              className="text-red-500 hover:text-red-400 font-bold transition-colors cursor-pointer"
            >
            </button>
          </p>
        </div>
      </div>
    </footer>
  );
};
