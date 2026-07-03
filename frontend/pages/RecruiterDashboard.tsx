import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Briefcase, Users, PlusCircle, Settings, ArrowRight, Clock, CheckCircle2, XCircle, User, Mail, Phone, Building } from 'lucide-react';
import { COUNTRIES } from '../data/locationData';

export const RecruiterDashboard: React.FC = () => {
  const { jobs, applications, updateApplicationStatus, recruiterProfile, setRecruiterProfile } = useApp();
  const navigate = useNavigate();

  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState('India');
  const [profileForm, setProfileForm] = React.useState({
    companyLogo: recruiterProfile?.companyLogo || '',
    companyName: recruiterProfile?.companyName || '',
    recruiterName: recruiterProfile?.recruiterName || '',
    recruiterImage: recruiterProfile?.recruiterImage || '',
    designation: recruiterProfile?.designation || '',
    email: recruiterProfile?.email || '',
    phone: recruiterProfile?.phone || '',
  });

  React.useEffect(() => {
    if (recruiterProfile) {
      const countryObj = COUNTRIES.find(c => recruiterProfile.phone?.startsWith(c.phoneCode));
      const extractedPhone = countryObj 
        ? recruiterProfile.phone.slice(countryObj.phoneCode.length).replace(/[^0-9]/g, '')
        : (recruiterProfile.phone || '').replace(/[^0-9]/g, '');

      setProfileForm({
        companyName: recruiterProfile.companyName || '',
        recruiterName: recruiterProfile.recruiterName || '',
        recruiterImage: recruiterProfile.recruiterImage || '',
        designation: recruiterProfile.designation || '',
        email: recruiterProfile.email || '',
        phone: extractedPhone,
      });

      if (countryObj) {
        setSelectedCountry(countryObj.name);
      }
    }
  }, [recruiterProfile]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verify phone number based on country code and length
    const countryObj = COUNTRIES.find(c => c.name === selectedCountry);
    const rawDigits = profileForm.phone.replace(/[^0-9]/g, '');
    if (countryObj) {
      if (rawDigits.length !== countryObj.phoneLength) {
        alert(`For ${selectedCountry}, phone number must have exactly ${countryObj.phoneLength} digits. (Currently: ${rawDigits.length} digits)`);
        return;
      }
    }

    const finalPhone = countryObj ? (countryObj.phoneCode + rawDigits) : rawDigits;
    const finalProfile = {
      ...profileForm,
      phone: finalPhone
    };

    setRecruiterProfile(finalProfile);
    setIsEditingProfile(false);
  };

  // Stats calculation
  const totalJobs = jobs.length;
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(a => a.status === 'Pending').length;
  const shortlistedApplications = applications.filter(a => a.status === 'Shortlisted').length;

  const quickActions = [
    { title: 'Post a New Job', desc: 'Add a new career role with skill targets', link: '/post-job', icon: PlusCircle, color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' },
    { title: 'Manage Open Jobs', desc: 'Edit, review, or delete existing posts', link: '/manage-jobs', icon: Settings, color: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-950 dark:from-slate-900 dark:to-black border border-transparent dark:border-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden transition-all duration-300">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700 dark:bg-slate-800 text-slate-200 dark:text-slate-300 text-xs font-bold mb-3">
            <span>Recruiter Console Active</span>
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Hiring Workspace</h1>
          <p className="mt-2 text-sm text-slate-300 dark:text-slate-400 leading-relaxed">
            Welcome to the SkillBox employer workspace. Review visual candidate portfolios, manage job listings, and make hiring decisions instantly.
          </p>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Jobs */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Jobs Posted</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">{totalJobs}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1 uppercase">Active recruitment listings</p>
        </div>

        {/* Total Applications */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Candidates</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">{totalApplications}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1 uppercase">Applications received</p>
        </div>

        {/* Pending Screen */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Awaiting Review</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">{pendingApplications}</p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1 uppercase">Needs vetting attention</p>
        </div>

        {/* Shortlisted */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Vetted Shortlists</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">{shortlistedApplications}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 uppercase">Ready for interviews</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Recent Applications list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Applicants</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">Browse live candidates applying for your listed job openings.</p>
              </div>
              <Link to="/manage-jobs" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">
                <span>Manage Lists</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                <p className="text-sm font-medium">No candidates have applied to your job postings yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <img
                        src={app.applicantProfile.profilePic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                        alt={app.applicantProfile.name}
                        className="w-11 h-11 rounded-xl object-cover border border-gray-100 dark:border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{app.applicantProfile.name}</h4>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Applied for: <strong className="text-blue-600 dark:text-blue-400">{app.jobTitle}</strong></p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{app.applicantProfile.location}</p>
                      </div>
                    </div>

                    {/* Action button status or screen shortcuts */}
                    <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-50 dark:border-slate-800">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        app.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/40' :
                        app.status === 'Shortlisted' ? 'bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 border-teal-100 dark:border-teal-900/40' :
                        app.status === 'Interviewing' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/40' :
                        app.status === 'Hired' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40' :
                        'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40'
                      }`}>
                        {app.status === 'Pending' ? 'Pending' : 
                         app.status === 'Shortlisted' ? 'Shortlisted' : 
                         app.status === 'Interviewing' ? 'Interviewing' : 
                         app.status === 'Hired' ? 'Hired' : 'Rejected'}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        {app.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => updateApplicationStatus(app.id, 'Rejected')}
                              className="p-1 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg cursor-pointer"
                              title="Reject candidate"
                            >
                              <XCircle className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(app.id, 'Shortlisted')}
                              className="p-1 text-teal-500 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/20 rounded-lg cursor-pointer"
                              title="Shortlist candidate"
                            >
                              <CheckCircle2 className="h-4.5 w-4.5" />
                            </button>
                          </>
                        )}
                        {app.status === 'Shortlisted' && (
                          <>
                            <button
                              onClick={() => updateApplicationStatus(app.id, 'Rejected')}
                              className="p-1 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg cursor-pointer"
                              title="Reject candidate"
                            >
                              <XCircle className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(app.id, 'Interviewing')}
                              className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold text-[9px] rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 cursor-pointer"
                              title="Move to Interview Round"
                            >
                              Interview ➔
                            </button>
                          </>
                        )}
                        {app.status === 'Interviewing' && (
                          <>
                            <button
                              onClick={() => updateApplicationStatus(app.id, 'Rejected')}
                              className="p-1 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg cursor-pointer"
                              title="Reject candidate"
                            >
                              <XCircle className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(app.id, 'Hired')}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] rounded cursor-pointer shadow-xs"
                              title="Hire candidate & offer role"
                            >
                              Hire 🎉
                            </button>
                          </>
                        )}
                        {app.status === 'Rejected' && (
                          <button
                            onClick={() => updateApplicationStatus(app.id, 'Pending')}
                            className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold text-[9px] rounded hover:bg-gray-200 dark:hover:bg-slate-700 cursor-pointer"
                            title="Reset application to review"
                          >
                            Re-evaluate
                          </button>
                        )}
                      </div>

                      <Link
                        to="/manage-jobs"
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline px-2.5 py-1 rounded-lg bg-blue-50/50 dark:bg-blue-950/20"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Quick Actions */}
        <div className="space-y-6">
          {/* Recruiter & Company Profile Identity Card */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recruiter & Company</h3>
              <button
                type="button"
                onClick={() => {
                  setIsEditingProfile(!isEditingProfile);
                  setProfileForm({
                    companyLogo: recruiterProfile?.companyLogo || '',
                    companyName: recruiterProfile?.companyName || '',
                    recruiterName: recruiterProfile?.recruiterName || '',
                    recruiterImage: recruiterProfile?.recruiterImage || '',
                    designation: recruiterProfile?.designation || '',
                    email: recruiterProfile?.email || '',
                    phone: recruiterProfile?.phone || '',
                  });
                }}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {isEditingProfile ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleProfileSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Company Name</label>
                  <input
                    type="text"
                    value={profileForm.companyName}
                    onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-xs focus:outline-hidden text-gray-800 dark:text-gray-100"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Company Logo (Image URL)</label>
                  <input
                    type="text"
                    value={profileForm.companyLogo}
                    onChange={(e) => setProfileForm({ ...profileForm, companyLogo: e.target.value })}
                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-xs focus:outline-hidden text-gray-800 dark:text-gray-100"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Recruiter Name</label>
                  <input
                    type="text"
                    value={profileForm.recruiterName}
                    onChange={(e) => setProfileForm({ ...profileForm, recruiterName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-xs focus:outline-hidden text-gray-800 dark:text-gray-100"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Recruiter Portrait (Image URL)</label>
                  <input
                    type="text"
                    value={profileForm.recruiterImage}
                    onChange={(e) => setProfileForm({ ...profileForm, recruiterImage: e.target.value })}
                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-xs focus:outline-hidden text-gray-800 dark:text-gray-100"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Designation</label>
                  <input
                    type="text"
                    value={profileForm.designation}
                    onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-xs focus:outline-hidden text-gray-800 dark:text-gray-100"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-xs focus:outline-hidden text-gray-800 dark:text-gray-100"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Country (for Phone Prefix & Length Validation)</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      const countryName = e.target.value;
                      setSelectedCountry(countryName);
                    }}
                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-xs focus:outline-hidden text-gray-800 dark:text-gray-100"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Phone</label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-xs text-gray-700 dark:text-gray-300 font-bold shrink-0">
                      <span>{COUNTRIES.find(c => c.name === selectedCountry)?.phoneCode || '+91'}</span>
                    </div>
                    <input
                      type="text"
                      maxLength={10}
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/[^0-9]/g, '') })}
                      placeholder="Enter 10-digit number"
                      className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-xs focus:outline-hidden text-gray-800 dark:text-gray-100"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                    Must be exactly {COUNTRIES.find(c => c.name === selectedCountry)?.phoneLength || 10} digits.
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Settings
                </button>
              </form>
            ) : (
              <div className="space-y-3.5">
                <div className="flex items-center gap-3 bg-gray-50/50 dark:bg-slate-800/20 p-3 rounded-xl border border-gray-50 dark:border-slate-800/60">
                  <img
                    src={recruiterProfile?.companyLogo}
                    alt={recruiterProfile?.companyName}
                    className="w-10 h-10 rounded-lg object-cover bg-white border border-gray-100 dark:border-slate-700 p-0.5 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100';
                    }}
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-gray-900 dark:text-white tracking-tight truncate">{recruiterProfile?.companyName}</h4>
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">Company Hub</p>
                  </div>
                </div>

                <div className="space-y-2.5 pl-0.5">
                  <div className="flex items-start gap-2.5">
                    {recruiterProfile?.recruiterImage ? (
                      <img
                        src={recruiterProfile.recruiterImage}
                        alt={recruiterProfile.recruiterName}
                        className="w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-slate-800 shrink-0 mt-0.5"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100';
                        }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200">{recruiterProfile?.recruiterName}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">{recruiterProfile?.designation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 truncate">{recruiterProfile?.email}</p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
                    <p className="text-[11px] text-gray-600 dark:text-gray-300">{recruiterProfile?.phone}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 transition-colors duration-300">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Workspace Shortcuts</h3>
            <div className="space-y-3">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={idx}
                    to={action.link}
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-50 dark:border-slate-800/60 hover:border-blue-100 dark:hover:border-slate-700 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all group"
                  >
                    <div className={`p-2.5 rounded-lg ${action.color} shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{action.title}</h4>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-normal">{action.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="p-5 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl text-[11px] text-blue-800 dark:text-blue-300 leading-normal space-y-2">
            <p className="font-bold uppercase text-blue-900 dark:text-blue-200">💡 Recruitment Tip:</p>
            <p>Evaluating video portfolios or live code links listed under <strong>Extra Skills</strong> helps reduce interview screening overhead by up to 50%!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
