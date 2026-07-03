import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedLayout } from './layouts/ProtectedLayout';

// Importing Page Components
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { Profile } from './pages/Profile';
import { JobListingPage } from './pages/JobListingPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { ApplyJobPage } from './pages/ApplyJobPage';
import { MyApplicationsPage } from './pages/MyApplicationsPage';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { PostJobPage } from './pages/PostJobPage';
import { ManageJobsPage } from './pages/ManageJobsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

export default function App() {
  return (
    <Router>
      <AppProvider>
        <div className="flex flex-col min-h-screen bg-slate-50/30 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
          <Navbar />
          
          <div className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Protected Candidate Routes */}
              <Route
                path="/jobs"
                element={
                  <ProtectedLayout allowedRole="Candidate">
                    <JobListingPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/job/:id"
                element={
                  <ProtectedLayout allowedRole="Candidate">
                    <JobDetailPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/apply/:id"
                element={
                  <ProtectedLayout allowedRole="Candidate">
                    <ApplyJobPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/applications"
                element={
                  <ProtectedLayout allowedRole="Candidate">
                    <MyApplicationsPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/candidate-dashboard"
                element={
                  <ProtectedLayout allowedRole="Candidate">
                    <CandidateDashboard />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedLayout allowedRole="Candidate">
                    <Profile />
                  </ProtectedLayout>
                }
              />

              {/* Protected Recruiter Routes */}
              <Route
                path="/recruiter-dashboard"
                element={
                  <ProtectedLayout allowedRole="Recruiter">
                    <RecruiterDashboard />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/post-job"
                element={
                  <ProtectedLayout allowedRole="Recruiter">
                    <PostJobPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/manage-jobs"
                element={
                  <ProtectedLayout allowedRole="Recruiter">
                    <ManageJobsPage />
                  </ProtectedLayout>
                }
              />

              {/* Fallback redirection */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </AppProvider>
    </Router>
  );
}
