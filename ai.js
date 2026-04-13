const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const API_URL = 'https://api.anthropic.com/v1/messages';

export function getApiKey() {
  return localStorage.getItem('claude-api-key') || '';
}
export function setApiKey(key) {
  key ? localStorage.setItem('claude-api-key', key.trim())
      : localStorage.removeItem('claude-api-key');
}
export function hasApiKey() {
  return !!getApiKey();
}

async function callClaude(systemPrompt, userMessage, maxTokens = 2000) {
  const key = getApiKey();
  if (!key) throw new Error('NO_API_KEY');

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error('INVALID_KEY');
    if (res.status === 429) throw new Error('RATE_LIMITED');
    throw new Error(err.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || '';
}

function stripFences(raw) {
  return raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

export async function validateApiKey(key) {
  const prev = getApiKey();
  setApiKey(key);
  try {
    await callClaude('You are a test assistant.', 'Reply with the single word: OK', 10);
    return { valid: true };
  } catch (e) {
    setApiKey(prev);
    if (e.message === 'INVALID_KEY') return { valid: false, error: 'Invalid API key. Please check it and try again.' };
    if (e.message === 'RATE_LIMITED') return { valid: true };
    return { valid: false, error: e.message };
  }
}

export async function tailorResumeWithAI(resume, job) {
  const system = `You are an expert resume coach. Tailor a candidate's resume to better match a specific job description.

STRICT RULES:
1. Only use experience, skills, and accomplishments the candidate ALREADY HAS
2. Never invent new jobs, degrees, certifications, or skills
3. Never change job titles, company names, dates, or education institution
4. Keep the exact same resume sections and structure
5. You MAY: rephrase bullets to highlight relevant aspects, reorder skills, strengthen summary using real background
6. Every change must be truthful and defensible in an interview

Return ONLY valid JSON — no markdown, no text outside the JSON object.`;

  const user = `CANDIDATE RESUME:
${JSON.stringify(resume.content, null, 2)}

JOB:
Role: ${job.role}
Company: ${job.company}
Location: ${job.location}
Salary: ${job.salary}
Description: ${job.description}
Requirements: ${(job.requirements || []).join(', ')}
Key skills: ${(job.skills || []).join(', ')}

Return JSON:
{
  "tailoredContent": {
    "name": "same", "title": "same", "email": "same", "phone": "same",
    "location": "same", "linkedin": "same", "github": "same",
    "summary": "rewritten summary",
    "experience": [{ "title": "same", "company": "same", "period": "same", "bullets": ["..."] }],
    "skills": ["reordered/expanded"],
    "education": { "degree": "same", "school": "same", "year": "same" }
  },
  "changes": [{ "icon": "✏️", "text": "what changed", "why": "why it helps" }]
}
Icons: ✏️ rewrite  ↕️ reorder  ➕ addition`;

  const raw = await callClaude(system, user, 2500);
  const parsed = JSON.parse(stripFences(raw));
  return { content: parsed.tailoredContent, changes: parsed.changes || [], tailored: true };
}

export async function generateCoverLetter(profile, resume, job) {
  const system = `You write compelling, specific cover letters. Warm professional tone.
Reference real numbers and achievements from the resume. Exactly 3 short paragraphs.
Never use cliché openers. No markdown. Plain text only.`;

  const expHighlights = resume.content.experience
    .map(e => `${e.title} at ${e.company} (${e.period}): ${e.bullets.slice(0, 2).join('; ')}`)
    .join('\n');

  const user = `Write a cover letter.

CANDIDATE:
Name: ${profile.name}
Summary: ${profile.summary}
Location: ${profile.location}

TOP EXPERIENCE:
${expHighlights}
Skills: ${resume.content.skills.join(', ')}

TARGET JOB:
Role: ${job.role}
Company: ${job.company}
Description: ${job.description}
Key requirements: ${(job.requirements || []).join(', ')}

Write 3 paragraphs only. No greeting header needed. End with:
Best regards,
${profile.name}`;

  return callClaude(system, user, 700);
}

export async function answerApplicationQuestion(question, profile, resume, job) {
  const system = `You help a job candidate fill out application questions.
Answer honestly and concisely based ONLY on the candidate's real profile and resume.
If the answer is genuinely unknown or requires a personal choice, respond with exactly:
NEEDS_USER_INPUT: [brief reason why you cannot answer]
Keep answers under 3 sentences. No preamble.`;

  const expSummary = resume.content.experience
    .map(e => `${e.title} at ${e.company}: ${e.bullets.join('; ')}`)
    .join('\n');

  const user = `APPLICATION QUESTION: "${question}"

CANDIDATE PROFILE:
Name: ${profile.name}
Location: ${profile.location}
Work authorization: ${profile.visa}
Willing to relocate: ${profile.relocate}
Summary: ${profile.summary}
LinkedIn: ${profile.linkedin}
GitHub: ${profile.github}

EXPERIENCE:
${expSummary}

Skills: ${resume.content.skills.join(', ')}
Education: ${resume.content.education?.degree} from ${resume.content.education?.school} (${resume.content.education?.year})

APPLYING FOR: ${job.role} at ${job.company} · ${job.location} · ${job.salary}

Answer the question.`;

  return callClaude(system, user, 350);
}

export async function scoreJobMatch(resume, job) {
  const system = `Recruiter scoring candidate-to-job fit. Return ONLY valid JSON, no markdown.`;
  const user = `Score 0-100.
Candidate skills: ${resume.content.skills.join(', ')}
Candidate experience: ${resume.content.experience.map(e => `${e.title} at ${e.company}`).join(', ')}
Job: ${job.role} at ${job.company}
Requirements: ${(job.requirements || []).join(', ')}
Return: { "score": 85, "reason": "one sentence" }`;

  try {
    const raw = await callClaude(system, user, 120);
    return JSON.parse(stripFences(raw));
  } catch {
    return { score: 75, reason: 'Score estimated (AI unavailable)' };
  }
}

export async function parseResumeText(rawText) {
  const system = `Resume parser. Extract structured data. Return ONLY valid JSON.`;
  const user = `Parse this resume:

${rawText.slice(0, 4000)}

Return:
{
  "name": "", "title": "", "email": "", "phone": "", "location": "",
  "linkedin": "", "github": "", "summary": "",
  "experience": [{ "title": "", "company": "", "period": "", "bullets": [] }],
  "skills": [],
  "education": { "degree": "", "school": "", "year": "" }
}`;

  const raw = await callClaude(system, user, 2000);
  return JSON.parse(stripFences(raw));
}
