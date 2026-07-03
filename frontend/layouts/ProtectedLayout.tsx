import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CandidateSidebar } from '../components/CandidateSidebar';
import { RecruiterSidebar } from '../components/RecruiterSidebar';
import { AlertCircle } from 'lucide-react';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  allowedRole?: 'Candidate' | 'Recruiter';
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children, allowedRole }) => {
  const { currentUser, userRole, setUserRole } = useApp();
  const location = useLocation();

  if (!currentUser) {
    // Redirect to login page and save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if current user role matches the required role
  if (allowedRole && userRole !== allowedRole) {
    const dashboardLink = userRole === 'Recruiter' ? '/recruiter-dashboard' : '/candidate-dashboard';
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 max-w-lg mx-auto text-center shadow-xs">
          <AlertCircle className="h-12 w-12 text-blue-600 dark:text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Restricted</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            This workspace is configured exclusively for <strong>{allowedRole}s</strong>.<br />
            You are currently authenticated under a <strong>{userRole}</strong> account.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={dashboardLink}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm cursor-pointer transition-colors"
            >
              <span>Go to My Dashboard</span>
            </Link>
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Choose the sidebar based on active role
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {userRole === 'Candidate' ? <CandidateSidebar /> : <RecruiterSidebar />}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
