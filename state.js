// ── App State ─────────────────────────────────────────────────────
export const state = {
  profile: {
    name: 'Alex Rivera',
    email: 'alex.rivera@email.com',
    phone: '+1 (415) 555-0182',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexrivera',
    github: 'github.com/alexrivera',
    visa: 'us-citizen',
    relocate: 'specific',
    summary:
      'Passionate software engineer with 7+ years building scalable web applications. Strong background in React, Node.js, TypeScript, and distributed systems.',
  },
  resumes: [
    { id: 'frontend', filename: 'Alex_Rivera_Frontend.pdf', roleType: 'Frontend / Full-Stack', yearsExp: 7, isDefault: true },
    { id: 'ml', filename: 'Alex_Rivera_ML.pdf', roleType: 'ML / AI', yearsExp: 3, isDefault: false },
  ],
  applications: [
    {
      id: 'app-demo-1',
      role: 'Senior Frontend Engineer',
      company: 'Stripe',
      location: 'San Francisco, CA',
      salary: '$180k–$230k',
      resumeFilename: 'Alex_Rivera_Frontend_Stripe_tailored.pdf',
      tailored: true,
      changeCount: 4,
      submittedAt: new Date(Date.now() - 5 * 60 * 1000),
      status: 'applied',
    },
    {
      id: 'app-demo-2',
      role: 'Staff Software Engineer',
      company: 'Notion',
      location: 'Remote',
      salary: '$200k–$250k',
      resumeFilename: 'Alex_Rivera_Frontend_Notion_tailored.pdf',
      tailored: true,
      changeCount: 4,
      submittedAt: new Date(Date.now() - 22 * 60 * 1000),
      status: 'applied',
    },
  ],
  activity: [
    { type: 'success', text: 'Applied to <strong>Senior Frontend Engineer</strong> at Stripe · Resume tailored', time: '5 min ago', color: '#639922' },
    { type: 'success', text: 'Applied to <strong>Staff Software Engineer</strong> at Notion · Resume tailored', time: '22 min ago', color: '#378ADD' },
    { type: 'info', text: 'Radar scanned 340 new listings across LinkedIn, Greenhouse, Lever', time: '3 hr ago', color: '#888780' },
  ],
  stats: {
    jobsFound: 12,
    radarActive: true,
  },
  settings: {
    scanFrequency: '1hr',
    autoApplyThreshold: 90,
    alwaysTailor: true,
    showDiffBeforeApply: true,
    notifyMethod: 'in-app',
  },
};

// ── Mutations ────────────────────────────────────────────────────
export function updateProfile(updates) {
  Object.assign(state.profile, updates);
  saveToLocalStorage();
}

export function addResume(resume) {
  state.resumes.push(resume);
  saveToLocalStorage();
}

export function removeResume(id) {
  state.resumes = state.resumes.filter(r => r.id !== id);
  saveToLocalStorage();
}

export function addApplication(app) {
  state.applications.unshift(app);
  state.stats.jobsFound++;
  saveToLocalStorage();
}

export function addActivity(item) {
  state.activity.unshift(item);
  if (state.activity.length > 20) state.activity.pop();
  saveToLocalStorage();
}

export function addNotification(job) {
  state.stats.jobsFound++;
  saveToLocalStorage();
}

export function updateSettings(updates) {
  Object.assign(state.settings, updates);
  saveToLocalStorage();
}

// ── Persistence ──────────────────────────────────────────────────
const STORAGE_KEY = 'job-autopilot-state';

export function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      profile: state.profile,
      resumes: state.resumes,
      applications: state.applications,
      activity: state.activity,
      stats: state.stats,
      settings: state.settings,
    }));
  } catch (e) {
    console.warn('Could not save state:', e);
  }
}

export function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved);
    if (parsed.profile) Object.assign(state.profile, parsed.profile);
    if (parsed.resumes?.length) state.resumes = parsed.resumes;
    if (parsed.applications?.length) {
      // Rehydrate dates
      state.applications = parsed.applications.map(a => ({ ...a, submittedAt: new Date(a.submittedAt) }));
    }
    if (parsed.activity?.length) state.activity = parsed.activity;
    if (parsed.stats) Object.assign(state.stats, parsed.stats);
    if (parsed.settings) Object.assign(state.settings, parsed.settings);
  } catch (e) {
    console.warn('Could not load saved state:', e);
  }
}

// ── Formatters ───────────────────────────────────────────────────
export function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}
