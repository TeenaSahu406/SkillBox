import { Job, CandidateProfile, JobApplication } from '../types';

export const INITIAL_JOBS: Job[] = [];

export const INITIAL_PROFILE: CandidateProfile = {
  name: '',
  email: '',
  phone: '',
  location: '',
  profilePic: '',
  education: '',
  skills: [],
  projects: [],
  certifications: [] as any,
  profileSummary: '',
  resumePdfName: '',
  linkedin: '',
  github: '',
  hasExtraSkills: false,
  extraSkills: {
    skillName: '',
    youtube: '',
    instagram: '',
    behance: '',
    portfolioWebsite: ''
  }
};

export const INITIAL_APPLICATIONS: JobApplication[] = [];

export const CATEGORIES = [
  'Software Development',
  'Design & Creative',
  'Marketing',
  'Human Resources',
  'Finance',
  'Data Science',
  'Customer Support',
  'Product Management'
];

export const COMPANIES: any[] = [];
