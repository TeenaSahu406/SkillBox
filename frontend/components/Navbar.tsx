import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Menu, X, User as UserIcon, LogOut, RefreshCw, Info, Phone, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { currentUser, userRole, setUserRole, logoutUser, theme, toggleTheme, profile, recruiterProfile } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeProfilePic = currentUser
    ? (userRole === 'Candidate' ? profile?.profilePic : recruiterProfile?.recruiterImage)
    : '';

  const activeName = currentUser
    ? (userRole === 'Candidate' ? (profile?.name || currentUser.name) : (recruiterProfile?.recruiterName || currentUser.name))
    : '';

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.trim().split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const handleRoleToggle = () => {
    const nextRole = userRole === 'Candidate' ? 'Recruiter' : 'Candidate';
    setUserRole(nextRole);
    // Redirect to the appropriate dashboard
    navigate(nextRole === 'Candidate' ? '/candidate-dashboard' : '/recruiter-dashboard');
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
    setDropdownOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinkClass = (path: string) => {
    return `px-3 py-2 rounded-md text-sm font-medium transition-all ${
      isActive(path)
        ? 'bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 rounded-none'
        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-800'
    }`;
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-50 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600">
              <Briefcase className="h-7 w-7 text-blue-600 fill-blue-100" />
              <span>Skill<span className="text-gray-900 dark:text-white">Box</span></span>
            </Link>
            
            {/* Desktop Common Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              {(!currentUser || userRole !== 'Recruiter') && (
                <Link to="/jobs" className={navLinkClass('/jobs')}>Find Jobs</Link>
              )}
              <Link to="/about" className={navLinkClass('/about')}>About Us</Link>
              <Link to="/contact" className={navLinkClass('/contact')}>Contact</Link>
            </div>
          </div>

          {/* Desktop Right Panel */}
          <div className="hidden md:flex md:items-center md:gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-500 fill-amber-100 dark:fill-amber-500/20" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700" />
              )}
            </button>

            {currentUser ? (
              <>
                {/* Active Role Badge */}
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-300 text-xs font-semibold border border-gray-200 dark:border-slate-700"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  <span>{userRole} Account</span>
                </div>

                {/* Dashboard Shortcut */}
                <Link
                  to={userRole === 'Candidate' ? '/candidate-dashboard' : '/recruiter-dashboard'}
                  className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-all"
                >
                  Dashboard
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 focus:outline-hidden cursor-pointer"
                  >
                    {activeProfilePic ? (
                      <img
                        src={activeProfilePic}
                        alt={activeName}
                        className="w-9 h-9 rounded-full object-cover border-2 border-blue-100 hover:border-blue-300 transition-colors"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs border-2 border-blue-100 hover:border-blue-300 transition-all">
                        {getInitials(activeName)}
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight max-w-[120px] truncate">{activeName}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{userRole}</p>
                    </div>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 ring-1 ring-black/5">
                      <div className="px-4 py-2 border-b border-gray-50 dark:border-slate-700">
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{currentUser.email}</p>
                      </div>

                      {userRole === 'Candidate' ? (
                        <>
                          <Link
                            to="/candidate-dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          >
                            My Dashboard
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          >
                            My Profile
                          </Link>
                          <Link
                            to="/applications"
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          >
                            My Applications
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/recruiter-dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          >
                            Recruiter Home
                          </Link>
                          <Link
                            to="/post-job"
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          >
                            Post a Job
                          </Link>
                          <Link
                            to="/manage-jobs"
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          >
                            Manage Jobs
                          </Link>
                        </>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border-t border-gray-50 dark:border-slate-700 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
            {currentUser && (
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-300 text-[10px] font-bold border border-gray-200 dark:border-slate-700"
              >
                <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                <span>{userRole}</span>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-500 fill-amber-100 dark:fill-amber-500/20" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700" />
              )}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1 shadow-sm transition-colors duration-300">
          {(!currentUser || userRole !== 'Recruiter') && (
            <Link
              to="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Find Jobs
            </Link>
          )}
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
          >
            Contact
          </Link>

          {currentUser ? (
            <div className="pt-4 pb-2 border-t border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3 px-3 mb-3">
                {activeProfilePic ? (
                  <img
                    src={activeProfilePic}
                    alt={activeName}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm border border-blue-200">
                    {getInitials(activeName)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{activeName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.email} • <span className="font-semibold text-blue-600 dark:text-blue-400">{userRole}</span></p>
                </div>
              </div>

              {userRole === 'Candidate' ? (
                <>
                  <Link
                    to="/candidate-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    My Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    My Applications
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/recruiter-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    Recruiter Dashboard
                  </Link>
                  <Link
                    to="/post-job"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    Post a Job
                  </Link>
                  <Link
                    to="/manage-jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    Manage Jobs
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 px-3 py-2 mt-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center px-4 py-2 rounded-md text-base font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center px-4 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
