import React, { useState } from 'react';
import { Check, X, FileText, Globe, Youtube, Instagram, Github, Palette, ExternalLink, Calendar, ChevronDown, ChevronUp, Linkedin, MessageSquare, Send, Mail, User } from 'lucide-react';
import { JobApplication } from '../types';
import { useApp } from '../context/AppContext';

interface ApplicantCardProps {
  application: JobApplication;
  onShortlist: (id: string) => void;
  onReject: (id: string) => void;
}

export const ApplicantCard: React.FC<ApplicantCardProps> = ({ application, onShortlist, onReject }) => {
  const { addApplicationMessage, recruiterProfile } = useApp();
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const profile = application.applicantProfile;

  const handleSendMessage = async (isEmailSimulated: boolean) => {
    if (!messageText.trim()) return;

    setIsSending(true);
    setEmailStatus('Processing message request and sending...');
    setEmailPreviewUrl(null);

    // Save in-app chat bubble
    addApplicationMessage(application.id, messageText, 'Recruiter', isEmailSimulated);

    if (isEmailSimulated) {
      try {
        const response = await fetch(`/api/supabase/applications/${application.id}/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientEmail: application.applicantEmail,
            recipientName: profile.name,
            senderName: recruiterProfile?.recruiterName || 'HR Team',
            senderRole: 'Recruiter',
            jobTitle: application.jobTitle,
            messageContent: messageText
          })
        });
        const result = await response.json();
        if (result.success) {
          if (result.previewUrl) {
            console.log(`[Developer Debug Mode] Mail Transmission URL: ${result.previewUrl}`);
          }
          setEmailStatus("Success! Email has been delivered directly to the candidate's inbox! ✉");
        } else {
          setEmailStatus(`Mail gateway offline: ${result.error || 'Connection error'}. Opening system email client fallback...`);
          const subject = encodeURIComponent(`Regarding your application for ${application.jobTitle}`);
          const body = encodeURIComponent(messageText);
          const mailtoUrl = `mailto:${application.applicantEmail}?subject=${subject}&body=${body}`;
          window.location.href = mailtoUrl;
        }
      } catch (err: any) {
        setEmailStatus('Network error sending email. Triggering mailto link fallback...');
        const subject = encodeURIComponent(`Regarding your application for ${application.jobTitle}`);
        const body = encodeURIComponent(messageText);
        const mailtoUrl = `mailto:${application.applicantEmail}?subject=${subject}&body=${body}`;
        window.location.href = mailtoUrl;
      }
    } else {
      setEmailStatus('In-App query successfully saved and sent to candidate! ✓');
    }

    setMessageText('');
    setIsSending(false);
    if (!isEmailSimulated) {
      setTimeout(() => setEmailStatus(null), 4000);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-all shadow-xs">
      <div className="flex flex-col sm:flex-row items-start gap-4 justify-between">
        {/* Profile info */}
        <div className="flex items-start gap-3.5">
          <img
            src={profile.profilePic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
            alt={profile.name}
            className="w-14 h-14 rounded-2xl object-cover border border-gray-100"
            referrerPolicy="no-referrer"
          />
          <div>
            <h3 className="text-lg font-bold text-gray-900">{profile.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{profile.location} • {profile.phone}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {(profile.linkedin || profile.extraSkills?.linkedin) && (
                <a
                  href={profile.linkedin || profile.extraSkills?.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold transition-colors"
                >
                  <Linkedin className="h-3.5 w-3.5 fill-blue-600 bg-white text-blue-600" />
                  <span>LinkedIn</span>
                </a>
              )}
              {(profile.github || profile.extraSkills?.github) && (
                <a
                  href={profile.github || profile.extraSkills?.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-slate-800 hover:text-black font-bold transition-colors"
                >
                  <Github className="h-3.5 w-3.5 text-slate-800" />
                  <span>GitHub</span>
                </a>
              )}
            </div>
            <p className="text-xs text-blue-600 font-semibold mt-2.5 bg-blue-50/70 px-2 py-0.5 rounded-md inline-block">
              Applied for: {application.jobTitle}
            </p>
          </div>
        </div>

        {/* Applied Date & Status Badge */}
        <div className="text-right flex flex-col sm:items-end gap-1.5 self-stretch sm:self-auto justify-between sm:justify-start">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {application.appliedDate}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
            application.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
            application.status === 'Shortlisted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
            'bg-rose-50 text-rose-700 border border-rose-100'
          }`}>
            ● {application.status}
          </span>
        </div>
      </div>

      {/* Candidate Summary */}
      <p className="text-sm text-gray-600 mt-4 line-clamp-2 italic bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
        "{profile.profileSummary}"
      </p>

      {/* Skills */}
      <div className="mt-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Skills</h4>
        <div className="flex flex-wrap gap-1.5">
          {profile.skills.map((skill, index) => (
            <span
              key={index}
              className="text-xs font-medium text-gray-700 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Accordion Trigger for Portfolio / Resume details */}
      <div className="mt-5 pt-4 border-t border-gray-50 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {/* Resume button */}
          <button
            onClick={() => {
              setDownloaded(true);
              setTimeout(() => setDownloaded(false), 2000);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <FileText className="h-4 w-4 text-red-500" />
            <span>{downloaded ? 'Downloaded ✓' : 'Resume PDF'}</span>
          </button>

          {/* Portfolio toggler */}
          {profile.hasExtraSkills && profile.extraSkills && (
            <button
              onClick={() => setShowPortfolio(!showPortfolio)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-medium cursor-pointer ${
                showPortfolio
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Globe className="h-4 w-4 text-blue-500 animate-pulse-slow" />
              <span>Show Extra Skills & Portfolios</span>
              {showPortfolio ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}

          {/* Messages & Queries toggler */}
          <button
            onClick={() => setShowMessages(!showMessages)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-medium cursor-pointer ${
              showMessages
                ? 'bg-purple-50 border-purple-200 text-purple-600'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="h-4 w-4 text-purple-500" />
            <span>Messages & Queries</span>
            {application.messages && application.messages.length > 0 && (
              <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5">
                {application.messages.length}
              </span>
            )}
            {showMessages ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Action buttons (Shortlist / Reject) */}
        {application.status === 'Pending' && (
          <div className="flex gap-2">
            <button
              onClick={() => onReject(application.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reject</span>
            </button>
            <button
              onClick={() => onShortlist(application.id)}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Shortlist</span>
            </button>
          </div>
        )}
      </div>

      {/* Expanded Extra Skills and Portfolio Details */}
      {showPortfolio && profile.hasExtraSkills && profile.extraSkills && (
        <div className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
              Specialized Capability:
            </span>
            <span className="text-sm font-semibold text-gray-800">{profile.extraSkills.skillName}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(profile.linkedin || profile.extraSkills?.linkedin) && (
              <a
                href={profile.linkedin || profile.extraSkills?.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100 text-xs font-semibold text-gray-800 hover:text-blue-600 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-blue-700 fill-blue-700 bg-white" />
                  <span>LinkedIn Profile</span>
                </div>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </a>
            )}

            {(profile.github || profile.extraSkills?.github) && (
              <a
                href={profile.github || profile.extraSkills?.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100 text-xs font-semibold text-gray-800 hover:text-blue-600 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-slate-800" />
                  <span>GitHub Profile</span>
                </div>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </a>
            )}

            {profile.extraSkills.portfolioWebsite && (
              <a
                href={profile.extraSkills.portfolioWebsite}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100 text-xs font-semibold text-gray-800 hover:text-blue-600 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span>Portfolio Website</span>
                </div>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </a>
            )}

            {profile.extraSkills.youtube && (
              <a
                href={profile.extraSkills.youtube}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100 text-xs font-semibold text-gray-800 hover:text-blue-600 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-red-500" />
                  <span>YouTube Channel</span>
                </div>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </a>
            )}

            {profile.extraSkills.instagram && (
              <a
                href={profile.extraSkills.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100 text-xs font-semibold text-gray-800 hover:text-blue-600 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-500" />
                  <span>Instagram Profile</span>
                </div>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </a>
            )}

            {profile.extraSkills.behance && (
              <a
                href={profile.extraSkills.behance}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100 text-xs font-semibold text-gray-800 hover:text-blue-600 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-indigo-600" />
                  <span>Behance Project</span>
                </div>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </a>
            )}

            {profile.extraSkills.otherUrl && (
              <a
                href={profile.extraSkills.otherUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100 text-xs font-semibold text-gray-800 hover:text-blue-600 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-purple-600" />
                  <span>{profile.extraSkills.otherName || 'Custom Link'}</span>
                </div>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Expanded Direct Messages & Query Hub */}
      {showMessages && (
        <div className="mt-4 p-4 bg-purple-50/50 dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-purple-100/60 pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              <h4 className="text-xs font-bold text-purple-950 dark:text-purple-300 uppercase tracking-wider">Candidate Direct Messages & Query Hub</h4>
            </div>
            <span className="text-[10px] bg-purple-150 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2.5 py-0.5 rounded-full font-bold">
              Direct Sync
            </span>
          </div>

          {/* Quick presets for recruiter */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-purple-500 uppercase">Quick templates:</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Schedule Interview', text: `Hi ${profile.name},\n\nWe love your portfolio! We would like to schedule a 30-minute interview with you this week to discuss the ${application.jobTitle} role.\n\nPlease let us know your availability.` },
                { label: 'Ask for references', text: `Hi ${profile.name},\n\nCould you please share 2-3 professional references or links to your live creative projects for the ${application.jobTitle} position?\n\nBest,` },
                { label: 'Offer Letter 🎉', text: `Dear ${profile.name},\n\nCongratulations! We are absolutely thrilled to extend an offer to join our team for the ${application.jobTitle} position! Details will follow shortly.\n\nWarm regards,` },
                { label: 'Feedback / Query', text: `Hi ${profile.name},\n\nWe had a quick query regarding your portfolio submission for the ${application.jobTitle} role. Could you clarify...` }
              ].map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setMessageText(preset.text)}
                  className="text-[10px] bg-white dark:bg-slate-800 hover:bg-purple-100/70 border border-purple-100/50 dark:border-purple-900/30 px-2.5 py-1 rounded-lg text-purple-700 dark:text-purple-300 font-semibold cursor-pointer transition-colors animate-pulse-slow"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Thread History */}
          <div className="space-y-2 max-h-48 overflow-y-auto p-1.5 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-purple-100/30">
            {(!application.messages || application.messages.length === 0) ? (
              <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs font-medium">
                No messages exchanged yet. Send a direct query or email template below!
              </div>
            ) : (
              <div className="space-y-3">
                {application.messages.map((msg) => {
                  const isRecruiter = msg.senderRole === 'Recruiter';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isRecruiter ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">
                          {msg.senderName} ({msg.senderRole})
                        </span>
                        <span className="text-[8px] text-gray-400">{msg.timestamp}</span>
                      </div>
                      <div
                        className={`text-xs p-2.5 rounded-2xl max-w-[85%] whitespace-pre-wrap ${
                          isRecruiter
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                        {msg.isEmailSimulated && (
                          <span className="block mt-1 text-[8px] opacity-80 italic font-medium border-t border-white/20 pt-1">
                            ✉ Sent as External Email via Mail Client
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Text Input & Send buttons */}
          <div className="space-y-2">
            <textarea
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={isSending}
              placeholder={`Write a direct message or issue query to ${profile.name}...`}
              className="w-full p-2.5 bg-white dark:bg-slate-800 border border-purple-100 dark:border-slate-700 rounded-xl text-xs focus:outline-hidden focus:border-purple-300 focus:ring-1 focus:ring-purple-200 text-gray-800 dark:text-gray-100 disabled:opacity-60"
            />

            {emailStatus && (
              <div className="text-xs text-purple-700 dark:text-purple-300 font-bold bg-purple-100/60 dark:bg-purple-950/40 p-2.5 rounded-lg animate-pulse-slow">
                {emailStatus}
              </div>
            )}

            <div className="flex flex-wrap justify-between gap-2">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> Candidate Email: <span className="font-bold">{application.applicantEmail}</span>
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSendMessage(false)}
                  disabled={!messageText.trim() || isSending}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/20 disabled:opacity-50 cursor-pointer transition-colors"
                >
                  Post In-App Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage(true)}
                  disabled={!messageText.trim() || isSending}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 cursor-pointer transition-all shadow-xs"
                >
                  {isSending ? (
                    <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>{isSending ? 'Sending...' : 'Send Real Email ✉'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
