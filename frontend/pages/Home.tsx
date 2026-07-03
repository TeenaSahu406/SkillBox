import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { JobCard } from '../components/JobCard';
import { COMPANIES } from '../data/dummyData';
import { useApp } from '../context/AppContext';
import { Briefcase, ArrowRight, UserCheck, Film, Award, Building2, ChevronRight, Check } from 'lucide-react';

export const Home: React.FC = () => {
  const { jobs, currentUser } = useApp();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  // Search submit redirect
  const handleSearch = (filters: { query: string; location: string; category: string }) => {
    navigate('/jobs', {
      state: {
        query: filters.query,
        location: filters.location,
        category: filters.category
      }
    });
  };

  const featuredJobs = jobs.slice(0, 3);

  const steps = [
    {
      title: 'Create Your Profile',
      desc: 'Fill in your experience, skills, and details in under 5 minutes.',
      icon: UserCheck,
      color: 'bg-blue-50 text-blue-600 border-blue-100'
    },
    {
      title: 'Showcase Extra Skills',
      desc: 'Link video portfolios, GitHub repositories, or Behance layouts to prove your extra talents.',
      icon: Film,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    },
    {
      title: 'Get Discovered',
      desc: 'Recruiters browse your interactive skills portfolio and shortlist you directly.',
      icon: Award,
      color: 'bg-purple-50 text-purple-600 border-purple-100'
    }
  ];

  return (
    <div className="bg-gray-50/50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold mb-6 border border-blue-100 dark:border-blue-900/40">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping" />
            <span>Over 12,000+ Active Roles Listed Today</span>
          </span>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight">
            The Smart Way to <span className="text-blue-600 dark:text-blue-400">Showcase Extra Skills</span> & Find Your Next Role
          </h1>
          
          <p className="mt-6 text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            SkillBox lets candidates upload PDFs, link video portfolios, Behance designs, and GitHub code. Recruiters get a high-fidelity visual of who you really are.
          </p>

          {/* Integrated Search Bar */}
          <div className="mt-10 sm:mt-12 px-2 max-w-5xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-400 dark:text-gray-500">
            <span>Popular Searches:</span>
            <Link to="/jobs" state={{ query: 'Frontend' }} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium underline">Frontend</Link>
            <Link to="/jobs" state={{ query: 'Designer' }} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium underline">UI/UX Design</Link>
            <Link to="/jobs" state={{ query: 'Remote' }} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium underline">Remote Roles</Link>
          </div>
        </div>

        {/* Ambient Decorative Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none -z-0" />
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Featured Job Openings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Discover premium, verified roles matching your skill set.</p>
          </div>
          <Link
            to="/jobs"
            className="flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer group shrink-0"
          >
            <span>View All Openings</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-white dark:bg-slate-900 border-y border-gray-100 dark:border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">How SkillBox Works</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
              Traditional resumes don't tell the whole story. SkillBox bridges the gap with a skills-first platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xs transition-shadow">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center border mb-5 ${step.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {idx + 1}. {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top Companies hiring */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Top Companies Hiring</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Leading brands and tech startups trust SkillBox to discover vetted candidate portfolios.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {COMPANIES.map((company, idx) => (
            <Link
              key={idx}
              to="/jobs"
              state={{ query: company.name }}
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 text-center hover:border-blue-200 dark:hover:border-blue-800/40 hover:shadow-xs transition-all cursor-pointer flex flex-col items-center justify-center"
            >
              <div className="text-3xl mb-3 h-12 w-12 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center border border-gray-100/50 dark:border-slate-700">
                {company.logo}
              </div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 line-clamp-1">{company.name}</h3>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1 uppercase">{company.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="bg-blue-600 py-16 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to Land Your Next Role?</h2>
          <p className="mt-4 text-blue-100 text-sm sm:text-base max-w-lg mx-auto">
            Stop sending boring Word document resumes. Build an interactive portfolio on SkillBox and show recruiters your true potential today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-blue-600 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 shadow-sm transition-all text-sm"
            >
              Get Started (Free)
            </Link>
            <Link
              to="/jobs"
              className="bg-blue-700 text-white border border-blue-500 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-800 transition-all text-sm"
            >
              Browse Careers
            </Link>
          </div>
        </div>
        {/* Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-700 rounded-full blur-3xl opacity-50" />
      </section>
    </div>
  );
};
