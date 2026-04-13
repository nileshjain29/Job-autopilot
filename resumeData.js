// ── Resume Templates ──────────────────────────────────────────────
export const RESUMES = {
  frontend: {
    id: 'frontend',
    filename: 'Alex_Rivera_Frontend.pdf',
    roleType: 'Frontend / Full-Stack',
    yearsExp: 7,
    content: {
      name: 'Alex Rivera',
      title: 'Senior Software Engineer',
      email: 'alex.rivera@email.com',
      phone: '+1 (415) 555-0182',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/alexrivera',
      github: 'github.com/alexrivera',
      summary:
        'Software engineer with 7+ years of experience building production web applications. Proficient in JavaScript, React, Node.js, and TypeScript.',
      experience: [
        {
          title: 'Senior Software Engineer',
          company: 'Acme Corp',
          period: '2021–Present',
          bullets: [
            'Built and maintained React-based dashboard used by 50,000+ customers',
            'Led migration of legacy codebase to TypeScript, improving reliability by 40%',
            'Designed RESTful API layer with Node.js serving 5M+ daily requests',
            'Mentored 3 junior engineers on frontend best practices',
          ],
        },
        {
          title: 'Software Engineer',
          company: 'TechStart Inc',
          period: '2018–2021',
          bullets: [
            'Developed cross-platform features using React and Redux',
            'Integrated third-party payment APIs into checkout flow',
            'Reduced page load time by 60% via code splitting and lazy loading',
          ],
        },
      ],
      skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'GraphQL', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
      education: { degree: 'B.S. Computer Science', school: 'UC Berkeley', year: '2018' },
    },
  },
  ml: {
    id: 'ml',
    filename: 'Alex_Rivera_ML.pdf',
    roleType: 'ML / AI',
    yearsExp: 3,
    content: {
      name: 'Alex Rivera',
      title: 'ML Engineer',
      email: 'alex.rivera@email.com',
      phone: '+1 (415) 555-0182',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/alexrivera',
      github: 'github.com/alexrivera',
      summary:
        'Software engineer with ML experience spanning 3 years. Skilled in Python, PyTorch, and building scalable data pipelines.',
      experience: [
        {
          title: 'ML Engineer (part-time scope)',
          company: 'Acme Corp',
          period: '2022–Present',
          bullets: [
            'Built recommendation model improving CTR by 18%',
            'Developed NLP pipeline for customer feedback classification using transformers',
            'Maintained model training infrastructure on AWS SageMaker',
          ],
        },
        {
          title: 'Software Engineer',
          company: 'TechStart Inc',
          period: '2018–2021',
          bullets: [
            'Built data ingestion pipelines processing 2M records/day with Python',
            'Wrote ETL jobs and data validation layers for analytics team',
          ],
        },
      ],
      skills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'AWS SageMaker', 'SQL', 'Docker', 'Pandas', 'NumPy'],
      education: { degree: 'B.S. Computer Science', school: 'UC Berkeley', year: '2018' },
    },
  },
};

// ── Job→Resume mapping ───────────────────────────────────────────
export function pickResume(roleType) {
  const lower = roleType.toLowerCase();
  if (lower.includes('ml') || lower.includes('ai') || lower.includes('machine') || lower.includes('data scientist')) {
    return RESUMES.ml;
  }
  return RESUMES.frontend;
}

// ── Tailoring rules per role ────────────────────────────────────
const TAILORING = {
  'Senior Frontend Engineer': {
    summaryTweak:
      'Software engineer with 7+ years specializing in high-scale frontend architecture and React ecosystems. Expert in TypeScript, GraphQL, and building interfaces for millions of users.',
    bulletTweaks: {
      'Built and maintained React-based dashboard used by 50,000+ customers':
        'Architected and maintained React/GraphQL dashboard serving 50,000+ customers, optimizing rendering performance and query efficiency',
      'Led migration of legacy codebase to TypeScript, improving reliability by 40%':
        'Led TypeScript migration across a 100k-line codebase, reducing runtime errors by 40% and accelerating team velocity',
    },
    skillsReorder: ['React', 'TypeScript', 'GraphQL', 'Node.js', 'JavaScript', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
    changes: [
      { icon: '✏️', text: 'Summary rewritten to emphasize frontend specialization and GraphQL expertise', why: 'Job description prioritizes frontend architecture and GraphQL' },
      { icon: '✏️', text: 'First bullet enhanced to highlight GraphQL (key JD requirement)', why: 'GraphQL mentioned 4× in the job description' },
      { icon: '✏️', text: 'TypeScript bullet expanded to show scale and business impact', why: 'Company values quantified impact and TypeScript mastery' },
      { icon: '↕️', text: 'Skills reordered: React, TypeScript, GraphQL moved to top', why: 'Matches exact order of requirements in job description' },
    ],
  },
  'Staff Software Engineer': {
    summaryTweak:
      'Staff-level software engineer with 7+ years building scalable products. Strong track record of technical leadership, system design, and cross-functional collaboration.',
    bulletTweaks: {
      'Mentored 3 junior engineers on frontend best practices':
        'Mentored and leveled-up 3 junior engineers; established frontend guild and coding standards adopted org-wide',
      'Designed RESTful API layer with Node.js serving 5M+ daily requests':
        'Designed and owned high-throughput API layer (5M+ req/day) — drove architecture decisions, capacity planning, and incident runbooks',
    },
    skillsReorder: ['React', 'Node.js', 'PostgreSQL', 'Go', 'TypeScript', 'GraphQL', 'Redis', 'Docker', 'AWS'],
    changes: [
      { icon: '✏️', text: 'Summary elevated to staff-level framing with leadership emphasis', why: 'Staff roles demand evidence of scope and influence beyond individual contribution' },
      { icon: '✏️', text: 'Mentorship bullet expanded to show org-wide impact', why: 'Company values engineers who scale teams, not just themselves' },
      { icon: '✏️', text: 'API bullet reframed to show ownership and architecture thinking', why: 'Staff engineers own systems end-to-end' },
      { icon: '↕️', text: 'Go added to skills list (adjacent backend experience)', why: 'Go is in the JD — your Node.js/backend experience is adjacent and honest' },
    ],
  },
  'ML Engineer': {
    summaryTweak:
      'ML engineer with hands-on experience training and deploying production models. Skilled in PyTorch, transformer architectures, and building robust ML pipelines on AWS.',
    bulletTweaks: {
      'Built recommendation model improving CTR by 18%':
        'Designed and shipped recommendation model (PyTorch) improving CTR by 18%; experimented with transformer-based architectures for sequence modeling',
      'Maintained model training infrastructure on AWS SageMaker':
        'Maintained and optimized model training infrastructure (SageMaker, EC2), reducing training cost by 30% through spot instance strategies',
    },
    skillsReorder: ['Python', 'PyTorch', 'LLM fine-tuning', 'AWS SageMaker', 'TensorFlow', 'Scikit-learn', 'SQL', 'Docker', 'Pandas'],
    changes: [
      { icon: '✏️', text: 'Summary updated to emphasize LLMs and PyTorch', why: 'Role prioritizes LLM and PyTorch expertise' },
      { icon: '✏️', text: 'Recommendation model bullet expanded to mention transformer architecture', why: 'Employer expects familiarity with transformer-based approaches' },
      { icon: '✏️', text: 'Infrastructure bullet updated to show cost optimization', why: 'Compute efficiency is critical at this scale' },
      { icon: '↕️', text: 'LLM fine-tuning added to skills (based on transformer work in experience)', why: 'You have adjacent experience — this is honest upleveling, not fabrication' },
    ],
  },
};

export function getTailoring(roleName) {
  return TAILORING[roleName] || null;
}

// ── Build tailored resume content ───────────────────────────────
export function buildTailoredResume(originalResume, roleName) {
  const rules = getTailoring(roleName);
  if (!rules) return { content: originalResume.content, changes: [], tailored: false };

  const orig = originalResume.content;

  // Tailor summary
  const newSummary = rules.summaryTweak || orig.summary;

  // Tailor bullets
  const newExperience = orig.experience.map((exp) => ({
    ...exp,
    bullets: exp.bullets.map((b) => rules.bulletTweaks?.[b] || b),
  }));

  // Reorder skills
  const newSkills = rules.skillsReorder || orig.skills;

  return {
    content: { ...orig, summary: newSummary, experience: newExperience, skills: newSkills },
    changes: rules.changes || [],
    tailored: true,
  };
}
