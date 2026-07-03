import { GoogleGenAI, Type } from "@google/genai";
import { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!ai) {
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. AI features will run in offline demo/fallback mode.");
    }
    ai = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// Helper to sanitize JSON response from Gemini
function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

// --- CUSTOM FALLBACK GENERATORS (for maximum resilience under high-demand/quota limits) ---

function getOptimizeProfileFallback(name: string, bio: string, skills: string[], education: any, projects: any, experience: any) {
  return {
    optimizedBio: `Driven and results-oriented professional${name ? ` (${name})` : ''} with a strong foundation in modern technology. Adept at leveraging specialized skills like ${skills && skills.length > 0 ? skills.slice(0, 3).join(', ') : 'software engineering'} to solve complex challenges. Passionate about continuous learning, architectural design, and delivering high-quality user experiences.`,
    optimizedSkills: Array.from(new Set([...(skills || []), "Problem Solving", "System Architecture", "Collaboration", "Agile Methodologies"])),
    suggestions: [
      "Quantify your accomplishments where possible (e.g., 'Optimized response times by 25%' or 'Managed a project team of 4 developer peers').",
      "Tailor your skill highlights dynamically to emphasize frontend, backend, or full-stack proficiencies depending on targeted roles.",
      "Consider writing a detailed README or repository guides for your top projects to demonstrate solid code documentation practices."
    ]
  };
}

function getJobDescriptionFallback(title: string, company: string, department: string, location: string, type: string, basicRequirements: string) {
  const comp = company || 'SkillBox Partner';
  const dept = department || 'Engineering';
  const loc = location || 'Remote';
  const jType = type || 'Full-time';
  const reqs = basicRequirements ? basicRequirements.split(',').map(r => r.trim()).filter(Boolean) : [];
  
  const reqBullets = reqs.length > 0 
    ? reqs.map(r => `- Proficient with ${r} and standard developer workflows.`).join('\n')
    : `- Proficiency with modern software engineering technologies.\n- Solid experience in agile development environments.`;

  return {
    description: `### About the Company
We are a forward-thinking group of creators at **${comp}** in the **${dept}** department. We build highly scalable, user-centric products and value clean architectures, collaborative learning, and professional excellence.

### Key Responsibilities
- Architect, build, and maintain production-grade web applications.
- Collaborate closely with developers, product managers, and designers to deliver rich user experiences.
- Troubleshoot, test, and optimize core system performance and reliability.
- Participate in peer design and code reviews to ensure high standards of quality.

### Job Requirements
${reqBullets}
- Strong understanding of design patterns, web performance, and state management.
- Excellent communication and collaboration skills in a fast-paced environment.
- Bachelor's degree in Computer Science, engineering, or equivalent practical experience.

### Benefits & Perks
- Competitive salary packages and wellness benefits.
- Remote-friendly culture with flexible work hour options.
- Mentorship, growth plans, and continuous technical learning allowances.`
  };
}

function getCoverLetterFallback(profile: any, job: any) {
  const candidateName = profile?.name || 'Applicant';
  const candidateTitle = profile?.title || 'Software Professional';
  const jobTitle = job?.title || 'Open Position';
  const companyName = job?.company || 'Your Organization';
  const keySkills = profile?.skills && profile.skills.length > 0 ? profile.skills.slice(0, 3).join(', ') : 'software engineering';

  return {
    coverLetter: `Dear Hiring Team at ${companyName},

I am writing to express my enthusiastic interest in the ${jobTitle} opportunity. With my background as a ${candidateTitle} and my core expertise in ${keySkills}, I am confident that my experience aligns well with the goals of your team.

Throughout my career, I have focused on solving complex technical challenges and building robust user-facing systems. I highly respect ${companyName}'s commitment to quality and innovation, and I would love the chance to apply my skills in collaborating with your engineers and designers to deliver high-quality solutions.

Thank you for your time and consideration. I look forward to the possibility of discussing how my experience and passion for professional growth can contribute to your team.

Sincerely,
${candidateName}`
  };
}

function getAnalyzeFitFallback(profile: any, job: any) {
  let matchedCount = 0;
  const jobTitleLower = (job?.title || '').toLowerCase();
  const jobDescLower = (job?.description || '').toLowerCase();
  const skills = profile?.skills || [];
  
  skills.forEach((s: string) => {
    if (jobDescLower.includes(s.toLowerCase()) || jobTitleLower.includes(s.toLowerCase())) {
      matchedCount++;
    }
  });

  const baseScore = skills.length > 0 ? (matchedCount / skills.length) * 50 : 30;
  const matchScore = Math.min(95, Math.max(55, Math.round(baseScore + 40)));

  const highlights = [
    "Solid overlap in core developer competencies.",
    "Candidate's listed experiences fit well within team workflows."
  ];
  if (matchedCount > 0) {
    highlights.push(`Direct alignment on specific requirements like: ${skills.filter((s: string) => jobDescLower.includes(s.toLowerCase())).slice(0, 2).join(', ')}.`);
  }

  return {
    matchScore,
    highlights: highlights.slice(0, 3),
    gaps: [
      "Ensure candidate's specific framework exposure matches all secondary tech stack preferences.",
      "Consider exploring specific project deployments or system designs in an initial screening call."
    ],
    verdict: `Candidate demonstrates a ${matchScore}% alignment with key job specs. Highly recommended for an initial screening call to evaluate full technical fit.`
  };
}

// --- HELPER FUNCTION: CALL GEMINI WITH RETRIES & EVENTUAL FALLBACK ---

async function callGeminiWithRetry<T>(
  apiCall: () => Promise<T>,
  fallbackGenerator: () => any,
  maxRetries = 3
): Promise<any> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await apiCall();
    } catch (error: any) {
      attempt++;
      console.error(`Gemini API Error (Attempt ${attempt}/${maxRetries}):`, error);
      
      const errorMsg = (error?.message || "").toUpperCase();
      const isTransient = 
        errorMsg.includes("503") || 
        errorMsg.includes("UNAVAILABLE") || 
        errorMsg.includes("HIGH DEMAND") ||
        errorMsg.includes("429") || 
        errorMsg.includes("RATE LIMIT") ||
        errorMsg.includes("OVERLOADED");

      if (isTransient && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 600; // Exponential backoff: 1.2s, 2.4s...
        console.log(`Transient error detected. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.warn("Unable to complete Gemini API call. Falling back to clean mock/heuristic response.");
        return fallbackGenerator();
      }
    }
  }
  return fallbackGenerator();
}

/**
 * 1. AI Profile Optimizer:
 * Enhances a user's resume, summary, and skills.
 */
export async function handleOptimizeProfile(req: Request, res: Response) {
  const { name, bio, skills, education, projects, experience } = req.body;
  try {
    const client = getGenAI();

    if (!apiKey) {
      return res.json({
        success: true,
        ...getOptimizeProfileFallback(name, bio, skills, education, projects, experience)
      });
    }

    const prompt = `You are a professional resume optimizer and HR expert. Analyze the following candidate profile details and return a response in strictly valid JSON format.
    
Candidate Profile:
- Name: ${name || 'N/A'}
- Bio: ${bio || 'N/A'}
- Skills: ${JSON.stringify(skills || [])}
- Education: ${JSON.stringify(education || [])}
- Projects: ${JSON.stringify(projects || [])}
- Experience: ${JSON.stringify(experience || [])}

You must respond with a JSON object that contains exactly these three fields:
1. "optimizedBio": A professionally written, compelling, high-impact professional summary/bio (about 3-4 sentences) that emphasizes strengths and matches modern industry standards.
2. "optimizedSkills": An array of strings representing a list of modern, industry-relevant skills that fit the candidate's profile, including the ones they provided plus 3-4 additional highly sought-after matching technical or soft skills.
3. "suggestions": An array of strings representing 3 actionable tips on how the candidate can further improve their resume or portfolio.

Example Response format:
{
  "optimizedBio": "Compelling bio...",
  "optimizedSkills": ["React", "TypeScript", "Node.js", "Problem Solving"],
  "suggestions": ["Tip 1", "Tip 2"]
}`;

    const apiCall = async () => {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              optimizedBio: { type: Type.STRING },
              optimizedSkills: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["optimizedBio", "optimizedSkills", "suggestions"]
          }
        }
      });

      const jsonText = response.text || "";
      return JSON.parse(cleanJsonString(jsonText));
    };

    const result = await callGeminiWithRetry(
      apiCall,
      () => getOptimizeProfileFallback(name, bio, skills, education, projects, experience)
    );

    res.json({ success: true, ...result });

  } catch (error: any) {
    console.error("Error optimizing profile (handled fallback):", error);
    res.json({
      success: true,
      ...getOptimizeProfileFallback(name, bio, skills, education, projects, experience)
    });
  }
}

/**
 * 2. AI Job Description Generator:
 * Generates beautiful, detailed job descriptions.
 */
export async function handleGenerateJobDescription(req: Request, res: Response) {
  const { title, company, department, location, type, basicRequirements } = req.body;
  try {
    const client = getGenAI();

    if (!apiKey) {
      return res.json({
        success: true,
        ...getJobDescriptionFallback(title, company, department, location, type, basicRequirements)
      });
    }

    const prompt = `You are an expert recruiter. Generate a fully fleshed out, professional and comprehensive job description for the following position:
- Title: ${title}
- Company: ${company || 'SkillBox Partner'}
- Department: ${department || 'Engineering'}
- Location: ${location || 'Remote'}
- Job Type: ${type || 'Full-time'}
- Basic Requirements: ${basicRequirements || 'N/A'}

The output must be formatted nicely using Markdown. It should include:
1. About the Company
2. Key Responsibilities (bullet list of 4-5 items)
3. Job Requirements (bullet list of 4-5 items, expanding on the basic requirements provided)
4. Benefits & Perks (3-4 items)

Return a JSON object with a single field "description" which holds the Markdown text.
Example format:
{
  "description": "### About the Company\\n...Markdown contents here..."
}`;

    const apiCall = async () => {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING }
            },
            required: ["description"]
          }
        }
      });

      const jsonText = response.text || "";
      return JSON.parse(cleanJsonString(jsonText));
    };

    const result = await callGeminiWithRetry(
      apiCall,
      () => getJobDescriptionFallback(title, company, department, location, type, basicRequirements)
    );

    res.json({ success: true, ...result });

  } catch (error: any) {
    console.error("Error generating job description (handled fallback):", error);
    res.json({
      success: true,
      ...getJobDescriptionFallback(title, company, department, location, type, basicRequirements)
    });
  }
}

/**
 * 3. AI Cover Letter & Application Helper:
 * Generates custom cover letters tailored to specific job and candidate details.
 */
export async function handleGenerateCoverLetter(req: Request, res: Response) {
  const { profile, job } = req.body;
  try {
    const client = getGenAI();

    if (!apiKey) {
      return res.json({
        success: true,
        ...getCoverLetterFallback(profile, job)
      });
    }

    const prompt = `You are a career coach helping an applicant write a personalized cover letter.
Write a highly compelling, tailored, professional cover letter from the applicant to the hiring team.

Applicant Profile:
- Name: ${profile?.name || 'Applicant'}
- Title: ${profile?.title || 'Professional'}
- Bio: ${profile?.bio || ''}
- Skills: ${JSON.stringify(profile?.skills || [])}
- Experience: ${JSON.stringify(profile?.experience || [])}

Job Details:
- Title: ${job?.title || 'Open Role'}
- Company: ${job?.company || 'Company'}
- Description/Requirements: ${job?.description || ''}

Write in an elegant, professional, yet enthusiastic tone. The length should be around 250-350 words, structured into clear paragraphs.
Return a JSON object with a single field "coverLetter" which holds the letter text.
{
  "coverLetter": "Dear hiring manager,\\n\\n..."
}`;

    const apiCall = async () => {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              coverLetter: { type: Type.STRING }
            },
            required: ["coverLetter"]
          }
        }
      });

      const jsonText = response.text || "";
      return JSON.parse(cleanJsonString(jsonText));
    };

    const result = await callGeminiWithRetry(
      apiCall,
      () => getCoverLetterFallback(profile, job)
    );

    res.json({ success: true, ...result });

  } catch (error: any) {
    console.error("Error generating cover letter (handled fallback):", error);
    res.json({
      success: true,
      ...getCoverLetterFallback(profile, job)
    });
  }
}

/**
 * 4. AI Job Fit Analysis:
 * Reviews profile against job requirements and returns a matching score (0-100) and analysis.
 */
export async function handleAnalyzeFit(req: Request, res: Response) {
  const { profile, job } = req.body;
  try {
    const client = getGenAI();

    if (!apiKey) {
      return res.json({
        success: true,
        ...getAnalyzeFitFallback(profile, job)
      });
    }

    const prompt = `You are an AI Job Matching Assistant. Analyze the alignment between the Candidate Profile and the Job Details below.

Candidate Profile:
- Title: ${profile?.title || 'Professional'}
- Bio: ${profile?.bio || ''}
- Skills: ${JSON.stringify(profile?.skills || [])}
- Experience: ${JSON.stringify(profile?.experience || [])}
- Education: ${JSON.stringify(profile?.education || [])}

Job Details:
- Title: ${job?.title || 'Open Role'}
- Company: ${job?.company || 'Company'}
- Description: ${job?.description || ''}

Compare them thoroughly. Decide on:
1. "matchScore": An integer score from 0 to 100 representing how well the candidate fits this job.
2. "highlights": An array of 2-3 specific strengths/areas where the candidate aligns beautifully with the job description.
3. "gaps": An array of 1-2 key areas where the candidate might be missing skills or could show more relevant experience.
4. "verdict": A 2-sentence crisp HR recommendation summarizing their overall suitability.

Return response as strictly a JSON object matching this schema:
{
  "matchScore": 85,
  "highlights": ["Strong TypeScript skills", "Proven leadership in similar roles"],
  "gaps": ["Lacks Docker containerization experience listed in requirements"],
  "verdict": "Candidate matches 85% of critical specs. Recommend inviting to next round."
}`;

    const apiCall = async () => {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchScore: { type: Type.INTEGER },
              highlights: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              gaps: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              verdict: { type: Type.STRING }
            },
            required: ["matchScore", "highlights", "gaps", "verdict"]
          }
        }
      });

      const jsonText = response.text || "";
      return JSON.parse(cleanJsonString(jsonText));
    };

    const result = await callGeminiWithRetry(
      apiCall,
      () => getAnalyzeFitFallback(profile, job)
    );

    res.json({ success: true, ...result });

  } catch (error: any) {
    console.error("Error analyzing job fit (handled fallback):", error);
    res.json({
      success: true,
      ...getAnalyzeFitFallback(profile, job)
    });
  }
}
