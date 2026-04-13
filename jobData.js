// ── Static job listings (demo data) ─────────────────────────────
export const DEMO_JOBS = [
  {
    id: 'stripe-sfe',
    role: 'Senior Frontend Engineer',
    company: 'Stripe',
    location: 'San Francisco, CA',
    salary: '$180k–$230k',
    type: 'Full-time',
    skills: ['React', 'TypeScript', 'GraphQL', 'Node.js'],
    match: 94,
    resumeType: 'frontend',
    description: `We're looking for a Senior Frontend Engineer to build financial infrastructure products used by millions of businesses. You'll work across the stack but own the frontend experience.`,
    requirements: [
      '5+ years with React and modern JS/TS',
      'Deep GraphQL experience (client & schema design)',
      'Passion for accessibility and performance',
      'Experience with design systems at scale',
    ],
    postedDate: '2 hours ago',
  },
  {
    id: 'linear-staff',
    role: 'Staff Software Engineer',
    company: 'Linear',
    location: 'Remote',
    salary: '$200k–$250k',
    type: 'Full-time',
    skills: ['React', 'Go', 'PostgreSQL', 'APIs'],
    match: 91,
    resumeType: 'frontend',
    description: `Linear builds the issue tracker for high-performance teams. As a Staff Engineer you'll define technical direction, build critical features, and raise the bar for the whole engineering org.`,
    requirements: [
      '8+ years engineering, 2+ at staff level',
      'Full-stack experience (React + Go preferred)',
      'Strong system design and architecture skills',
      'Track record of driving org-wide technical improvements',
    ],
    postedDate: '5 hours ago',
  },
  {
    id: 'openai-ml',
    role: 'ML Engineer',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    salary: '$220k–$300k',
    type: 'Full-time',
    skills: ['Python', 'PyTorch', 'LLMs', 'RLHF'],
    match: 79,
    resumeType: 'ml',
    description: `Join the team building the next generation of AI systems. You'll train and fine-tune large language models, design evaluation pipelines, and ship models that millions use daily.`,
    requirements: [
      '3+ years ML engineering in production',
      'PyTorch expertise and transformer architecture knowledge',
      'Experience with RLHF or preference learning a plus',
      'Strong Python and distributed systems skills',
    ],
    postedDate: '1 day ago',
  },
];

// ── Simulated radar discoveries ──────────────────────────────────
export const RADAR_JOBS = [
  {
    id: 'figma-principal',
    role: 'Principal Engineer',
    company: 'Figma',
    location: 'Remote',
    salary: '$210k–$260k',
    type: 'Full-time',
    skills: ['React', 'TypeScript', 'WebGL', 'Performance'],
    match: 96,
    resumeType: 'frontend',
    description: 'Lead technical direction for Figma\'s core editor — one of the most complex React applications ever built.',
    requirements: ['10+ years engineering', 'WebGL or canvas experience', 'React performance expertise', 'Technical leadership at scale'],
    postedDate: 'Just now',
  },
  {
    id: 'vercel-techlead',
    role: 'Tech Lead, Platform',
    company: 'Vercel',
    location: 'Remote',
    salary: '$190k–$240k',
    type: 'Full-time',
    skills: ['Node.js', 'Go', 'Kubernetes', 'Edge computing'],
    match: 88,
    resumeType: 'frontend',
    description: 'Lead the platform team building Vercel\'s global edge infrastructure, used by millions of Next.js developers.',
    requirements: ['7+ years engineering', 'Go or Rust experience', 'Infrastructure and CDN knowledge', 'Team leadership'],
    postedDate: 'Just now',
  },
  {
    id: 'anthropic-ml',
    role: 'Senior ML Researcher',
    company: 'Anthropic',
    location: 'San Francisco, CA',
    salary: '$250k–$350k',
    type: 'Full-time',
    skills: ['Python', 'PyTorch', 'RLHF', 'Constitutional AI'],
    match: 82,
    resumeType: 'ml',
    description: 'Research and implement alignment techniques for large language models. Help build AI that is safe and beneficial.',
    requirements: ['PhD or equivalent in ML/CS', 'RLHF and alignment research experience', 'PyTorch', 'Strong publication record preferred'],
    postedDate: 'Just now',
  },
  {
    id: 'notion-fe',
    role: 'Senior Frontend Engineer',
    company: 'Notion',
    location: 'Remote',
    salary: '$170k–$220k',
    type: 'Full-time',
    skills: ['React', 'TypeScript', 'CRDTs', 'Real-time'],
    match: 90,
    resumeType: 'frontend',
    description: 'Build Notion\'s collaborative editor and block system — real-time, collaborative, and used by 30M+ people.',
    requirements: ['5+ years React', 'Real-time/collaborative tech experience', 'TypeScript', 'Performance mindset'],
    postedDate: 'Just now',
  },
];

// ── Visa status mapping ───────────────────────────────────────────
export const VISA_LABELS = {
  'us-citizen': 'US Citizen — no sponsorship required',
  'h1b': 'H1B Visa holder — requires sponsorship',
  'opt': 'Currently on OPT — eligible to work',
  'green-card': 'Permanent Resident (Green Card)',
  'tn': 'TN Visa holder',
  'other': 'Other — will clarify if asked',
};

// ── Match color helper ────────────────────────────────────────────
export function matchTagClass(pct) {
  if (pct >= 85) return 'tag-green';
  if (pct >= 70) return 'tag-amber';
  return 'tag-red';
}
