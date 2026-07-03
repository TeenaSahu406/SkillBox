import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FileText, Calendar, MapPin, ChevronRight, CheckCircle2, XCircle, Clock, MessageSquare, Send, ChevronDown, ChevronUp, Mail, Info, ExternalLink } from 'lucide-react';

export const MyApplicationsPage: React.FC = () => {
  const { applications, jobs, addApplicationMessage, recruiterProfile, currentUser } = useApp();
  const [expandedAppId, setExpandedAppId] = React.useState<string | null>(null);
  const [queryText, setQueryText] = React.useState('');
  const [queryStatus, setQueryStatus] = React.useState<string | null>(null);
  const [queryEmailPreviewUrl, setQueryEmailPreviewUrl] = React.useState<string | null>(null);
  const [isSendingQuery, setIsSendingQuery] = React.useState(false);

  const handleSendQuery = async (appId: string, isEmailSimulated: boolean) => {
    if (!queryText.trim()) return;

    setIsSendingQuery(true);
    setQueryStatus('Sending email query...');
    setQueryEmailPreviewUrl(null);

    // Save in-app chat bubble
    addApplicationMessage(appId, queryText, 'Candidate', isEmailSimulated);

    if (isEmailSimulated) {
      try {
        const correspondingApp = applications.find(a => a.id === appId);
        const response = await fetch(`/api/supabase/applications/${appId}/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientEmail: recruiterProfile.email,
            recipientName: recruiterProfile.recruiterName,
            senderName: currentUser?.name || 'Candidate',
            senderRole: 'Candidate',
            jobTitle: correspondingApp?.jobTitle || 'Role Inquiry',
            messageContent: queryText
          })
        });
        const result = await response.json();
        if (result.success) {
          if (result.previewUrl) {
            console.log(`[Developer Debug Mode] Mail Transmission URL: ${result.previewUrl}`);
          }
          setQueryStatus("Success! Email has been delivered directly to the recruiter's inbox! ✉");
        } else {
          setQueryStatus(`Mail gateway offline: ${result.error || 'Connection error'}. Opening system email client fallback...`);
          const subject = encodeURIComponent(`Application Inquiry: ${correspondingApp?.jobTitle}`);
          const body = encodeURIComponent(queryText);
          const mailtoUrl = `mailto:${recruiterProfile.email}?subject=${subject}&body=${body}`;
          window.location.href = mailtoUrl;
        }
      } catch (err: any) {
        setQueryStatus('Network error sending email. Triggering mailto link fallback...');
        const correspondingApp = applications.find(a => a.id === appId);
        const subject = encodeURIComponent(`Application Inquiry: ${correspondingApp?.jobTitle}`);
        const body = encodeURIComponent(queryText);
        const mailtoUrl = `mailto:${recruiterProfile.email}?subject=${subject}&body=${body}`;
        window.location.href = mailtoUrl;
      }
    } else {
      setQueryStatus('In-App inquiry successfully saved and sent to recruiter! ✓');
    }

    setQueryText('');
    setIsSendingQuery(false);
    if (!isEmailSimulated) {
      setTimeout(() => setQueryStatus(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-100 dark:border-slate-800">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight font-sans">My Applications</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage your submitted job applications and candidate status.</p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4 transition-colors duration-300">
          <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-500 flex items-center justify-center mx-auto border border-blue-100 dark:border-blue-900/40">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Applications Found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You haven't submitted any job applications yet. Browse active openings and showcase your creative skills portfolio!
          </p>
          <Link
            to="/jobs"
            className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Find a Job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const correspondingJob = jobs.find((j) => j.id === app.jobId);
            return (
              <div
                key={app.id}
                className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-100 dark:hover:border-slate-700 transition-all shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Applied on: {app.appliedDate}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1">{app.jobTitle}</h3>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {app.companyName} {correspondingJob && `• ${correspondingJob.location}`}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1 flex-wrap">
                      <span>Resume Sent:</span>
                      {app.resumePdfData ? (
                        <a
                          href={app.resumePdfData}
                          download={app.resumePdfName || 'profile_resume.pdf'}
                          className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-0.5"
                          title="Download sent resume PDF"
                        >
                          <span>{app.resumePdfName || 'profile_resume.pdf'}</span>
                          <span>💾</span>
                        </a>
                      ) : (
                        <span>{app.resumePdfName || 'profile_resume.pdf'}</span>
                      )}
                    </p>
                  </div>

                  {/* Status Indicator Panel */}
                  <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 border-gray-50 dark:border-slate-800 pt-3 sm:pt-0 flex-wrap">
                    <div className="flex items-center gap-2">
                      {app.status === 'Pending' && (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 px-3 py-1.5 rounded-xl animate-pulse">
                          <Clock className="h-4 w-4" />
                          <span>In Review</span>
                        </span>
                      )}
                      {app.status === 'Shortlisted' && (
                        <span className="flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 px-3 py-1.5 rounded-xl">
                          <CheckCircle2 className="h-4 w-4 fill-teal-50 dark:fill-teal-950/20" />
                          <span>Shortlisted</span>
                        </span>
                      )}
                      {app.status === 'Interviewing' && (
                        <span className="flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 px-3 py-1.5 rounded-xl">
                          <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping mr-1" />
                          <span>Interview Scheduled</span>
                        </span>
                      )}
                      {app.status === 'Hired' && (
                        <span className="flex items-center gap-1 text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 px-3 py-1.5 rounded-xl shadow-xs">
                          <span>Offer Extended 🎉</span>
                        </span>
                      )}
                      {app.status === 'Rejected' && (
                        <span className="flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 px-3 py-1.5 rounded-xl">
                          <XCircle className="h-4 w-4 fill-rose-50 dark:fill-rose-950/20" />
                          <span>Not Selected</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setExpandedAppId(expandedAppId === app.id ? null : app.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
                        expandedAppId === app.id
                          ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-850 text-purple-700 dark:text-purple-300'
                          : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <MessageSquare className="h-4 w-4 text-purple-500" />
                      <span>Contact Recruiter</span>
                      {app.messages && app.messages.length > 0 && (
                        <span className="bg-purple-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                          {app.messages.length}
                        </span>
                      )}
                      {expandedAppId === app.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>

                    {correspondingJob && (
                      <Link
                        to={`/job/${correspondingJob.id}`}
                        className="p-2 bg-gray-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors"
                        title="View job detail specifications"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Collapsible messages feed */}
                {expandedAppId === app.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
                    <div className="bg-purple-50/50 dark:bg-slate-900/50 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100/60 pb-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-purple-600" />
                          <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">Direct Message thread with Recruiter</h4>
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                          Contact Person: <span className="text-purple-700 dark:text-purple-300 font-bold">{recruiterProfile.recruiterName} ({recruiterProfile.designation})</span>
                        </div>
                      </div>

                      {/* Recruiter Identity mini card */}
                      <div className="flex items-center gap-3 bg-white dark:bg-slate-850 p-2.5 rounded-lg border border-purple-100/40">
                        <img
                          src={recruiterProfile.recruiterImage}
                          alt={recruiterProfile.recruiterName}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100';
                          }}
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200">{recruiterProfile.recruiterName}</p>
                          <p className="text-[9px] text-gray-400 dark:text-gray-500">{recruiterProfile.companyName} • {recruiterProfile.email}</p>
                        </div>
                      </div>

                      {/* Query suggestions */}
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-purple-500 uppercase">Preset inquiries:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'Hi, I wanted to follow up on my portfolio feedback.',
                            'Hello, I had a quick query regarding the remote work structure.',
                            'Hi, please let me know if any other portfolio links or reference documents are required.'
                          ].map((suggest, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setQueryText(suggest)}
                              className="text-[9px] bg-white dark:bg-slate-800 hover:bg-purple-100/50 border border-purple-100/30 dark:border-purple-900/30 px-2 py-1 rounded-md text-purple-700 dark:text-purple-300 text-left truncate max-w-xs cursor-pointer transition-colors"
                            >
                              {suggest}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Message List */}
                      <div className="space-y-2 max-h-40 overflow-y-auto p-1.5 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-purple-100/30">
                        {(!app.messages || app.messages.length === 0) ? (
                          <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs font-semibold">
                            No messages exchanged yet. Send a direct query or email below!
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {app.messages.map((msg) => {
                              const isRecruiter = msg.senderRole === 'Recruiter';
                              return (
                                <div
                                  key={msg.id}
                                  className={`flex flex-col ${!isRecruiter ? 'items-end' : 'items-start'}`}
                                >
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">
                                      {msg.senderName} ({msg.senderRole})
                                    </span>
                                    <span className="text-[8px] text-gray-400">{msg.timestamp}</span>
                                  </div>
                                  <div
                                    className={`text-xs p-2.5 rounded-2xl max-w-[85%] whitespace-pre-wrap ${
                                      !isRecruiter
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
                                    }`}
                                  >
                                    {msg.content}
                                    {msg.isEmailSimulated && (
                                      <span className="block mt-1 text-[8px] opacity-80 italic font-medium border-t border-white/20 pt-1">
                                        ✉ Sent as External Email to Recruiter
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Text composer */}
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={queryText}
                          onChange={(e) => setQueryText(e.target.value)}
                          disabled={isSendingQuery}
                          placeholder={`Ask a question or report an issue regarding your ${app.jobTitle} application...`}
                          className="w-full p-2.5 bg-white dark:bg-slate-800 border border-purple-100 dark:border-slate-700 rounded-xl text-xs focus:outline-hidden focus:border-purple-350 focus:ring-1 focus:ring-purple-200 text-gray-800 dark:text-gray-100 disabled:opacity-60"
                        />

                        {queryStatus && (
                          <div className="text-xs text-purple-700 dark:text-purple-300 font-bold bg-purple-100/60 dark:bg-purple-950/40 p-2.5 rounded-lg animate-pulse-slow">
                            {queryStatus}
                          </div>
                        )}

                        <div className="flex flex-wrap justify-between gap-2 items-center">
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" /> Recruiter Email: <span className="font-bold text-purple-700 dark:text-purple-300">{recruiterProfile.email}</span>
                          </span>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleSendQuery(app.id, false)}
                              disabled={!queryText.trim() || isSendingQuery}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/20 disabled:opacity-50 cursor-pointer transition-colors"
                            >
                              Post In-App Inquiry
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendQuery(app.id, true)}
                              disabled={!queryText.trim() || isSendingQuery}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 cursor-pointer transition-all shadow-xs"
                            >
                              {isSendingQuery ? (
                                <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Send className="h-3.5 w-3.5" />
                              )}
                              <span>{isSendingQuery ? 'Sending...' : 'Send Real Email ✉'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
