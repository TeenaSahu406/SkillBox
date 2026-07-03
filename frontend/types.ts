export type UserRole = 'Candidate' | 'Recruiter';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePic?: string;
  phone?: string;
  location?: string;
  companyName?: string;
}

export interface RecruiterProfile {
  companyLogo: string;
  companyName: string;
  recruiterName: string;
  recruiterImage: string;
  designation: string;
  email: string;
  phone: string;
}

export interface ExtraSkills {
  skillName: string;
  youtube?: string;
  instagram?: string;
  github?: string;
  behance?: string;
  portfolioWebsite?: string;
  linkedin?: string;
  otherUrl?: string;
  otherName?: string;
}

export interface Project {
  title: string;
  description: string;
  link?: string;
}

export interface CandidateProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  profilePic: string;
  education: string;
  skills: string[];
  projects: Project[];
  certifications: string[];
  profileSummary: string;
  resumePdfName?: string;
  resumePdfData?: string;
  hasExtraSkills: boolean;
  extraSkills?: ExtraSkills;
  linkedin?: string;
  github?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  salary: string;
  category: string;
  skillsRequired: string[];
  description: string;
  postedDate: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
  experience: string;
}

export interface ApplicationMessage {
  id: string;
  senderRole: UserRole;
  senderName: string;
  content: string;
  timestamp: string;
  isEmailSimulated: boolean;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantProfile: CandidateProfile;
  resumePdfName?: string;
  resumePdfData?: string;
  status: 'Pending' | 'Shortlisted' | 'Rejected' | 'Interviewing' | 'Hired';
  appliedDate: string;
  messages?: ApplicationMessage[];
}
