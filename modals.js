import { RESUMES, buildTailoredResume, pickResume } from './resumeData.js';
import { VISA_LABELS, matchTagClass } from './jobData.js';
import { state, addApplication, addActivity, addNotification } from './state.js';

// ── Generic modal wrapper ────────────────────────────────────────
export function openModal(contentHTML, { large = false, onClose } = {}) {
  closeModal();
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'active-modal';
  backdrop.innerHTML = `<div class="modal ${large ? 'modal-lg' : ''}">${contentHTML}</div>`;
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) { closeModal(); onClose?.(); } });
  document.body.appendChild(backdrop);
}

export function closeModal() {
  document.getElementById('active-modal')?.remove();
}

// ── Job detail / "I'm interested" modal ─────────────────────────
export function openJobModal(job) {
  const resume = pickResume(job.resumeType || job.role);
  const skillTags = job.skills.map(s => `<span class="tag tag-blue">${s}</span>`).join(' ');
  const reqList = (job.requirements || []).map(r => `<li style="margin-bottom:5px;font-size:12px;color:var(--text-secondary)">${r}</li>`).join('');

  openModal(`
    <div class="modal-header">
      <div>
        <div class="modal-title">${job.role}</div>
        <div class="modal-subtitle">${job.company} · ${job.location} · ${job.salary}</div>
      </div>
      <button class="modal-close" onclick="window._closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
        <span class="tag ${matchTagClass(job.match)}">${job.match}% match</span>
        <span class="tag tag-gray">${job.type}</span>
        <span class="tag tag-gray">${job.postedDate}</span>
      </div>
      <p style="font-size:12px;color:var(--text-secondary);line-height:1.6;margin-bottom:14px">${job.description}</p>
      <div style="font-size:11px;font-weight:600;color:var(--text-secondary);margin-bottom:8px">Requirements</div>
      <ul style="padding-left:16px;margin-bottom:14px">${reqList}</ul>
      <div style="font-size:11px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">Skills</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">${skillTags}</div>
      <div style="background:var(--bg-secondary);border-radius:var(--radius-md);padding:10px 12px;display:flex;align-items:center;gap:10px">
        <span style="font-size:18px">📄</span>
        <div>
          <div style="font-size:12px;font-weight:600;color:var(--text-primary)">${resume.filename}</div>
          <div style="font-size:11px;color:var(--text-secondary)">Auto-selected · Will be tailored to match this JD</div>
        </div>
      </div>
      <div class="banner banner-info" style="margin-top:10px;font-size:11px">
        ✨ The AI will optimize your resume content for this role — your experience won't be fabricated, only reframed to match job priorities.
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="window._closeModal()">Skip</button>
      <button class="btn btn-success" onclick="window._tailorResume('${job.id}')">
        I'm interested — tailor &amp; preview resume →
      </button>
    </div>
  `);

  window._closeModal = closeModal;
  window._tailorResume = (jobId) => {
    const j = [...(state.jobs || []), ...(window._allJobs || [])].find(x => x.id === jobId) || job;
    showTailoringLoader(j);
  };
  window._allJobs = window._allJobs || [];
  if (!window._allJobs.find(j => j.id === job.id)) window._allJobs.push(job);
}

// ── Tailoring loader ─────────────────────────────────────────────
function showTailoringLoader(job) {
  openModal(`
    <div class="modal-header">
      <div>
        <div class="modal-title">Tailoring your resume...</div>
        <div class="modal-subtitle">${job.role} at ${job.company}</div>
      </div>
    </div>
    <div class="modal-body">
      <div class="loading-overlay">
        <div class="spinner spinner-lg"></div>
        <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:6px">AI is analysing the job description</div>
        <div style="font-size:12px;color:var(--text-secondary);line-height:1.6">
          Identifying key requirements · Reframing your experience · Reordering skills · Preserving your format
        </div>
      </div>
    </div>
  `);

  setTimeout(() => showDiffModal(job), 2000);
}

// ── Diff / side-by-side preview modal ───────────────────────────
function showDiffModal(job) {
  const resume = pickResume(job.resumeType || job.role);
  const { content: tailoredContent, changes } = buildTailoredResume(resume, job.role);
  const orig = resume.content;

  const renderBullets = (experience, bulletTweaks = {}) =>
    experience.map(exp => `
      <div class="diff-section-label">${exp.title} · ${exp.company} (${exp.period})</div>
      ${exp.bullets.map(b => {
        const tweaked = bulletTweaks[b] || b;
        const changed = tweaked !== b;
        return `<div class="diff-bullet ${changed ? 'changed' : ''}">• ${changed ? `<span class="text-highlight">${tweaked}</span>` : b}</div>`;
      }).join('')}
    `).join('');

  const origBulletTweaks = {};
  const tailoredBulletTweaks = {};
  const rules = buildTailoredResume(resume, job.role);
  // Build tweak map from original to tailored for display
  orig.experience.forEach(exp => {
    exp.bullets.forEach(b => {
      const tw = tailoredContent.experience.flatMap(e => e.bullets).find((_, i) =>
        tailoredContent.experience.flatMap(e => e.bullets)[i] !== orig.experience.flatMap(e => e.bullets)[i]
      );
    });
  });

  const origBullets = renderBullets(orig.experience);
  const tailoredBullets = (() => {
    return tailoredContent.experience.map((exp, ei) => {
      const origExp = orig.experience[ei];
      return `
        <div class="diff-section-label">${exp.title} · ${exp.company} (${exp.period})</div>
        ${exp.bullets.map((b, bi) => {
          const origB = origExp?.bullets[bi] || '';
          const changed = b !== origB;
          return `<div class="diff-bullet ${changed ? 'changed' : ''}">• ${changed ? `<span class="text-highlight">${b}</span>` : b}</div>`;
        }).join('')}
      `;
    }).join('');
  })();

  const changesHTML = changes.map(c => `
    <div class="change-item">
      <span class="change-item-icon">${c.icon}</span>
      <div class="change-item-body">
        <div class="change-item-text">${c.text}</div>
        <div class="change-item-why">Why: ${c.why}</div>
      </div>
    </div>
  `).join('');

  const tailoredFilename = resume.filename.replace('.pdf', `_${job.company}_tailored.pdf`);

  openModal(`
    <div class="modal-header">
      <div>
        <div class="modal-title">Review tailored resume</div>
        <div class="modal-subtitle">${job.role} at ${job.company} · ${changes.length} change${changes.length !== 1 ? 's' : ''} made</div>
      </div>
      <button class="modal-close" onclick="window._closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div class="steps">
        <div class="step done"><div class="step-num">✓</div> Job found</div>
        <div class="step-sep"></div>
        <div class="step done"><div class="step-num">✓</div> Resume tailored</div>
        <div class="step-sep"></div>
        <div class="step active"><div class="step-num">3</div> Review &amp; approve</div>
        <div class="step-sep"></div>
        <div class="step"><div class="step-num">4</div> Submit</div>
      </div>

      <div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:8px">What changed</div>
      ${changesHTML}

      <div class="divider"></div>

      <div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:10px">Side-by-side comparison</div>
      <div class="diff-grid">
        <div class="diff-panel">
          <div class="diff-panel-header original">📄 Original · ${resume.filename}</div>
          <div class="diff-panel-body">
            <div class="diff-section-label">Summary</div>
            <p style="margin-bottom:10px;font-size:11px;line-height:1.6">${orig.summary}</p>
            ${origBullets}
            <div class="diff-section-label">Skills</div>
            <p style="font-size:11px">${orig.skills.join(' · ')}</p>
            <div class="diff-section-label">Education</div>
            <p style="font-size:11px">${orig.education.degree}, ${orig.education.school} ${orig.education.year}</p>
          </div>
        </div>
        <div class="diff-panel">
          <div class="diff-panel-header tailored">✨ Tailored · ${tailoredFilename}</div>
          <div class="diff-panel-body">
            <div class="diff-section-label">Summary</div>
            <p style="margin-bottom:10px;font-size:11px;line-height:1.6">
              ${tailoredContent.summary !== orig.summary
                ? `<span class="text-highlight">${tailoredContent.summary}</span>`
                : tailoredContent.summary}
            </p>
            ${tailoredBullets}
            <div class="diff-section-label">Skills</div>
            <p style="font-size:11px">
              ${tailoredContent.skills.join(' · ') !== orig.skills.join(' · ')
                ? `<span class="text-added">${tailoredContent.skills.join(' · ')}</span>`
                : tailoredContent.skills.join(' · ')}
            </p>
            <div class="diff-section-label">Education</div>
            <p style="font-size:11px">${tailoredContent.education.degree}, ${tailoredContent.education.school} ${tailoredContent.education.year}</p>
          </div>
        </div>
      </div>

      <div class="banner banner-success">
        ✅ All changes use only your actual experience. No new roles, degrees, or skills were invented. Section order, formatting, and layout are unchanged.
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="window._closeModal()">Discard</button>
      <button class="btn btn-warning" onclick="window._applyOriginal('${job.id}')">Apply with original resume</button>
      <button class="btn btn-success" onclick="window._applyTailored('${job.id}','${tailoredFilename}')">Approve &amp; fill application →</button>
    </div>
  `, { large: true });

  window._closeModal = closeModal;
  window._applyOriginal = (jobId) => {
    const j = window._allJobs?.find(x => x.id === jobId) || job;
    showFillForm(j, resume.filename, false, changes.length);
  };
  window._applyTailored = (jobId, fname) => {
    const j = window._allJobs?.find(x => x.id === jobId) || job;
    showFillForm(j, fname, true, changes.length);
  };
}

// ── Application fill form ────────────────────────────────────────
function showFillForm(job, resumeFilename, tailored, changeCount) {
  const profile = state.profile;
  const visaLabel = VISA_LABELS[profile.visa] || VISA_LABELS['us-citizen'];
  const tailoredBadge = tailored
    ? `<span class="tag tag-green" style="font-size:10px">✨ Tailored (${changeCount} changes)</span>`
    : `<span class="tag tag-gray" style="font-size:10px">Original version</span>`;

  openModal(`
    <div class="modal-header">
      <div>
        <div class="modal-title">Filling application</div>
        <div class="modal-subtitle">${job.role} at ${job.company}</div>
      </div>
      <button class="modal-close" onclick="window._closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div class="steps">
        <div class="step done"><div class="step-num">✓</div> Found</div>
        <div class="step-sep"></div>
        <div class="step done"><div class="step-num">✓</div> Tailored</div>
        <div class="step-sep"></div>
        <div class="step done"><div class="step-num">✓</div> Approved</div>
        <div class="step-sep"></div>
        <div class="step active"><div class="step-num">4</div> Fill &amp; submit</div>
      </div>

      <div class="qa-block">
        <div class="qa-label">Resume attached</div>
        <div class="qa-answer" style="display:flex;align-items:center;gap:6px">📄 ${resumeFilename} ${tailoredBadge}</div>
      </div>
      <div class="qa-block">
        <div class="qa-label">Personal details</div>
        <div class="qa-answer">${profile.name} · ${profile.email} · ${profile.phone}</div>
      </div>
      <div class="qa-block">
        <div class="qa-label">Location</div>
        <div class="qa-answer">${profile.location}</div>
      </div>
      <div class="qa-block">
        <div class="qa-label">Work authorization</div>
        <div class="qa-answer">${visaLabel}</div>
      </div>
      <div class="qa-block">
        <div class="qa-label">LinkedIn / GitHub</div>
        <div class="qa-answer">${profile.linkedin || '—'} · ${profile.github || '—'}</div>
      </div>
      <div class="qa-block">
        <div class="qa-label">Cover letter (AI-generated)</div>
        <div class="qa-answer" style="line-height:1.6">
          Dear Hiring Manager,<br><br>
          I'm excited to apply for the <strong>${job.role}</strong> role at <strong>${job.company}</strong>.
          With ${profile.summary ? profile.summary.substring(0, 120) + '…' : '7+ years of engineering experience'}, I'm confident I can make an immediate and meaningful impact on your team.
          I look forward to discussing how my background aligns with your needs.<br><br>
          Best regards, ${profile.name}
        </div>
      </div>
      <div class="qa-block">
        <div class="qa-label">Salary expectation</div>
        <div class="qa-answer">Within posted range (${job.salary})</div>
      </div>

      <div class="qa-block needs-input" id="q-onsite">
        <div class="qa-label">⚠️ Needs your input: Are you open to on-site work?</div>
        <div class="qa-actions">
          <button class="btn btn-success btn-sm" onclick="window._answerQ('Yes, open to hybrid or on-site')">Yes, hybrid/on-site</button>
          <button class="btn btn-sm" onclick="window._answerQ('Prefer remote, open to discussion')">Prefer remote</button>
          <button class="btn btn-sm" onclick="window._answerQ('Remote only')">Remote only</button>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="window._closeModal()">Cancel</button>
      <button class="btn btn-success" id="submit-app-btn" onclick="window._submitApp()">
        Submit application →
      </button>
    </div>
  `);

  window._closeModal = closeModal;
  window._answerQ = (answer) => {
    const block = document.getElementById('q-onsite');
    if (!block) return;
    block.className = 'qa-block';
    block.innerHTML = `<div class="qa-label">On-site preference</div><div class="qa-answer">${answer}</div>`;
  };
  window._submitApp = () => submitApplication(job, resumeFilename, tailored, changeCount);
}

// ── Submit application ───────────────────────────────────────────
function submitApplication(job, resumeFilename, tailored, changeCount) {
  closeModal();

  const app = {
    id: `app-${Date.now()}`,
    role: job.role,
    company: job.company,
    location: job.location,
    salary: job.salary,
    resumeFilename,
    tailored,
    changeCount,
    submittedAt: new Date(),
    status: 'applied',
  };

  addApplication(app);
  addActivity({
    type: 'success',
    text: `Applied to <strong>${job.role}</strong> at ${job.company}${tailored ? ' · Resume tailored' : ''}`,
    time: 'just now',
    color: '#639922',
  });

  // Show success modal
  openModal(`
    <div class="modal-body">
      <div class="success-content">
        <div class="success-icon">🎉</div>
        <div class="success-title">Application submitted!</div>
        <div class="success-sub">
          Your ${tailored ? 'tailored ' : ''}resume was submitted for <strong>${job.role}</strong> at <strong>${job.company}</strong>.
          ${tailored ? `<br><br><span style="color:var(--text-success)">${changeCount} resume optimizations were applied to match the job description.</span>` : ''}
          <br><br>We'll notify you of any updates from the employer.
        </div>
        <div style="margin-top:20px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-success" onclick="window._closeModal();window._navigateTo('applications')">View applications</button>
          <button class="btn" onclick="window._closeModal()">Done</button>
        </div>
      </div>
    </div>
  `);

  window._closeModal = closeModal;
  window._navigateTo = (section) => {
    closeModal();
    document.querySelector(`.nav-item[data-section="${section}"]`)?.click();
  };

  // Dispatch event so the app state can re-render
  document.dispatchEvent(new CustomEvent('applicationAdded', { detail: app }));
}

// ── Notification renderer ────────────────────────────────────────
export function renderNotification(job, container) {
  const el = document.createElement('div');
  el.className = 'notification';
  el.dataset.notifId = job.id;
  el.innerHTML = `
    <span class="notif-icon">🔔</span>
    <div class="notif-body">
      <div class="notif-title">New job found: ${job.role} at ${job.company}</div>
      <div class="notif-sub">${job.salary} · ${job.location} · ${job.match}% match · Resume will be tailored before applying</div>
      <div class="notif-actions">
        <button class="btn btn-success btn-sm" data-job-id="${job.id}">I'm interested</button>
        <button class="btn btn-sm notif-skip" data-notif-id="${job.id}">Skip</button>
      </div>
    </div>
    <button class="notif-dismiss" data-notif-id="${job.id}">×</button>
  `;

  el.querySelector('[data-job-id]').addEventListener('click', () => {
    el.remove();
    openJobModal(job);
  });
  el.querySelectorAll('[data-notif-id]').forEach(btn => {
    btn.addEventListener('click', () => el.remove());
  });

  container.prepend(el);
}
