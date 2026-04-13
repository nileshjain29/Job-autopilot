import { state, updateProfile, addResume, removeResume, updateSettings, timeAgo, saveToLocalStorage } from './state.js';
import { DEMO_JOBS, matchTagClass } from './jobData.js';
import { openJobModal, renderNotification } from './modals.js';

// ── Dashboard ────────────────────────────────────────────────────
export function renderDashboard(container) {
  const applied = state.applications.length;
  const avgMatch = state.applications.length
    ? Math.round(state.applications.reduce((s, a) => s + (a.match || 90), 0) / state.applications.length)
    : 87;

  container.innerHTML = `
    <div id="notif-area"></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-value" id="stat-found">${state.stats.jobsFound}</div><div class="stat-label">Jobs found</div></div>
      <div class="stat-card"><div class="stat-value" id="stat-applied">${applied}</div><div class="stat-label">Applied</div></div>
      <div class="stat-card"><div class="stat-value">${avgMatch}%</div><div class="stat-label">Avg match</div></div>
    </div>
    <div class="card">
      <div class="card-header">
        <div><div class="card-title">Recent activity</div></div>
        <button class="btn btn-primary" id="sim-btn">Simulate new job found</button>
      </div>
      <div class="timeline" id="activity-log">
        ${state.activity.map(a => `
          <div class="tl-item">
            <div class="tl-dot" style="background:${a.color}"></div>
            <div class="tl-content">${a.text}<div class="tl-time">${a.time}</div></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('sim-btn').addEventListener('click', simulateNewJob);
  document.addEventListener('applicationAdded', updateDashboardStats);
}

let simIdx = 0;
import { RADAR_JOBS } from './jobData.js';

function simulateNewJob() {
  const job = RADAR_JOBS[simIdx % RADAR_JOBS.length];
  simIdx++;
  state.stats.jobsFound++;
  document.getElementById('stat-found').textContent = state.stats.jobsFound;
  if (!window._allJobs) window._allJobs = [];
  if (!window._allJobs.find(j => j.id === job.id)) window._allJobs.push(job);
  const notifArea = document.getElementById('notif-area');
  if (notifArea) renderNotification(job, notifArea);
}

function updateDashboardStats() {
  const el = document.getElementById('stat-applied');
  if (el) el.textContent = state.applications.length;
  const foundEl = document.getElementById('stat-found');
  if (foundEl) foundEl.textContent = state.stats.jobsFound;
  // Refresh activity log
  const log = document.getElementById('activity-log');
  if (log) {
    log.innerHTML = state.activity.map(a => `
      <div class="tl-item">
        <div class="tl-dot" style="background:${a.color}"></div>
        <div class="tl-content">${a.text}<div class="tl-time">${a.time}</div></div>
      </div>
    `).join('');
  }
}

// ── Profile ──────────────────────────────────────────────────────
export function renderProfile(container) {
  const p = state.profile;
  container.innerHTML = `
    <div class="card">
      <div class="card-header"><div class="card-title">Your profile</div></div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Full name</label><input class="form-input" id="p-name" value="${p.name}" /></div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" type="email" id="p-email" value="${p.email}" /></div>
        <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="p-phone" value="${p.phone}" /></div>
        <div class="form-group"><label class="form-label">Location</label><input class="form-input" id="p-loc" value="${p.location}" /></div>
        <div class="form-group">
          <label class="form-label">Work authorization</label>
          <select class="form-select" id="p-visa">
            <option value="us-citizen" ${p.visa==='us-citizen'?'selected':''}>US Citizen</option>
            <option value="h1b" ${p.visa==='h1b'?'selected':''}>H1B Visa</option>
            <option value="opt" ${p.visa==='opt'?'selected':''}>OPT/CPT</option>
            <option value="green-card" ${p.visa==='green-card'?'selected':''}>Green Card</option>
            <option value="tn" ${p.visa==='tn'?'selected':''}>TN Visa</option>
            <option value="other" ${p.visa==='other'?'selected':''}>Other</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Willing to relocate?</label>
          <select class="form-select" id="p-reloc">
            <option value="anywhere" ${p.relocate==='anywhere'?'selected':''}>Yes, anywhere</option>
            <option value="specific" ${p.relocate==='specific'?'selected':''}>Yes, specific cities</option>
            <option value="no" ${p.relocate==='no'?'selected':''}>No, remote only</option>
          </select>
        </div>
      </div>
      <div class="form-group"><label class="form-label">LinkedIn URL</label><input class="form-input" id="p-linkedin" value="${p.linkedin}" /></div>
      <div class="form-group"><label class="form-label">GitHub URL</label><input class="form-input" id="p-github" value="${p.github}" /></div>
      <div class="form-group">
        <label class="form-label">Personal summary (used for cover letters)</label>
        <textarea class="form-textarea" id="p-summary" rows="4">${p.summary}</textarea>
      </div>
      <div style="text-align:right"><button class="btn btn-primary" id="save-profile-btn">Save profile</button></div>
    </div>

    <div class="card">
      <div class="card-header">
        <div><div class="card-title">Uploaded resumes</div><div class="card-subtitle">Each resume is preserved as-is; only content is optimized when tailoring</div></div>
        <button class="btn btn-primary" id="upload-resume-btn">+ Upload resume</button>
      </div>
      <div id="resume-list">
        ${renderResumeList()}
      </div>
    </div>
  `;

  document.getElementById('save-profile-btn').addEventListener('click', () => {
    updateProfile({
      name: document.getElementById('p-name').value,
      email: document.getElementById('p-email').value,
      phone: document.getElementById('p-phone').value,
      location: document.getElementById('p-loc').value,
      visa: document.getElementById('p-visa').value,
      relocate: document.getElementById('p-reloc').value,
      linkedin: document.getElementById('p-linkedin').value,
      github: document.getElementById('p-github').value,
      summary: document.getElementById('p-summary').value,
    });
    const btn = document.getElementById('save-profile-btn');
    btn.textContent = 'Saved!'; btn.classList.add('btn-success');
    setTimeout(() => { btn.textContent = 'Save profile'; btn.classList.remove('btn-success'); }, 1600);
  });

  document.getElementById('upload-resume-btn').addEventListener('click', showUploadModal);
}

function renderResumeList() {
  return state.resumes.map(r => `
    <div class="resume-chip" data-resume-id="${r.id}">
      <span class="resume-icon">📄</span>
      <div style="flex:1">
        <div class="resume-name">${r.filename}</div>
        <div class="resume-role">For: ${r.roleType} · ${r.yearsExp} yrs exp · Format locked</div>
      </div>
      ${r.isDefault ? '<span class="tag tag-green">Default</span>' : '<span class="tag tag-blue">'+r.roleType.split('/')[0].trim()+'</span>'}
    </div>
  `).join('');
}

function showUploadModal() {
  import('./modals.js').then(({ openModal, closeModal }) => {
    openModal(`
      <div class="modal-header">
        <div class="modal-title">Upload resume</div>
        <button class="modal-close" onclick="document.getElementById('active-modal').remove()">×</button>
      </div>
      <div class="modal-body">
        <div class="upload-zone" id="upload-zone">
          <div class="upload-zone-icon">📄</div>
          <div class="upload-zone-title">Click or drag to upload resume</div>
          <div class="upload-zone-sub">PDF or DOCX · Max 5MB · Your format will be preserved exactly</div>
          <input type="file" id="resume-file-input" accept=".pdf,.docx" style="display:none" />
        </div>
        <div id="file-chosen" style="display:none;margin-top:10px" class="banner banner-success"></div>
        <div class="form-group" style="margin-top:12px">
          <label class="form-label">This resume is best for (role type)</label>
          <input class="form-input" id="resume-role-tag" placeholder="e.g. Backend, Data Science, DevOps, Product" />
        </div>
        <div class="form-group">
          <label class="form-label">Years of experience in this domain</label>
          <input class="form-input" type="number" id="resume-yrs" placeholder="e.g. 5" min="0" max="40" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="document.getElementById('active-modal').remove()">Cancel</button>
        <button class="btn btn-primary" id="confirm-upload-btn">Upload &amp; save</button>
      </div>
    `);

    const zone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('resume-file-input');
    zone.addEventListener('click', () => fileInput.click());
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault(); zone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) handleFileChosen(file);
    });
    fileInput.addEventListener('change', (e) => { if (e.target.files[0]) handleFileChosen(e.target.files[0]); });

    let chosenFilename = null;
    function handleFileChosen(file) {
      chosenFilename = file.name;
      const el = document.getElementById('file-chosen');
      el.style.display = 'block';
      el.textContent = `✅ Selected: ${file.name}`;
    }

    document.getElementById('confirm-upload-btn').addEventListener('click', () => {
      const roleTag = document.getElementById('resume-role-tag').value.trim() || 'General';
      const yrs = parseInt(document.getElementById('resume-yrs').value) || 0;
      const filename = chosenFilename || `Resume_${roleTag.replace(/\s/g, '_')}.pdf`;
      addResume({ id: `resume-${Date.now()}`, filename, roleType: roleTag, yearsExp: yrs, isDefault: false });
      document.getElementById('active-modal').remove();
      // Refresh resume list
      const rl = document.getElementById('resume-list');
      if (rl) rl.innerHTML = renderResumeList();
    });
  });
}

// ── Job Search ───────────────────────────────────────────────────
export function renderJobSearch(container) {
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div><div class="card-title">Search preferences</div><div class="card-subtitle">Radar uses these to surface matching jobs</div></div>
        <button class="btn btn-primary" id="radar-btn">🔍 Run radar now</button>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Target roles (comma separated)</label><input class="form-input" id="s-roles" value="Senior Frontend Engineer, Staff Engineer, Tech Lead" /></div>
        <div class="form-group"><label class="form-label">Locations</label><input class="form-input" id="s-locs" value="San Francisco, Remote" /></div>
        <div class="form-group"><label class="form-label">Minimum salary</label><input class="form-input" id="s-sal" value="$160,000" /></div>
        <div class="form-group"><label class="form-label">Job type</label><select class="form-select"><option selected>Full-time</option><option>Contract</option><option>Either</option></select></div>
      </div>
      <div class="form-group"><label class="form-label">Exclude companies</label><input class="form-input" value="Meta, Amazon" /></div>
    </div>

    <div id="job-list">
      ${DEMO_JOBS.map(job => renderJobCard(job)).join('')}
    </div>
  `;

  document.querySelectorAll('.job-card[data-job-id]').forEach(card => {
    card.addEventListener('click', () => {
      const jobId = card.dataset.jobId;
      const job = DEMO_JOBS.find(j => j.id === jobId);
      if (job) openJobModal(job);
    });
  });

  document.getElementById('radar-btn').addEventListener('click', () => {
    const btn = document.getElementById('radar-btn');
    btn.innerHTML = '<span class="spinner"></span> Scanning...';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = '🔍 Run radar now';
      btn.disabled = false;
      simulateRadarFind(container);
    }, 2200);
  });
}

function renderJobCard(job, isNew = false) {
  const skillTags = job.skills.slice(0, 4).map(s => `<span class="tag tag-blue">${s}</span>`).join(' ');
  return `
    <div class="job-card ${isNew ? 'new-ping' : ''}" data-job-id="${job.id}">
      <div class="job-card-top">
        <div>
          <div class="job-role">${job.role}</div>
          <div class="job-company">${job.company} · ${job.location}</div>
        </div>
        <span class="tag ${matchTagClass(job.match)}">${job.match}% match</span>
      </div>
      <div class="job-meta">${skillTags}<span class="tag tag-gray">${job.salary}</span><span class="tag tag-gray">${job.postedDate}</span></div>
    </div>
  `;
}

function simulateRadarFind(container) {
  const job = RADAR_JOBS[simIdx % RADAR_JOBS.length];
  // Add to job list
  const list = document.getElementById('job-list');
  if (list) {
    list.insertAdjacentHTML('afterbegin', renderJobCard(job, true));
    const newCard = list.querySelector(`[data-job-id="${job.id}"]`);
    if (newCard) {
      newCard.addEventListener('click', () => openJobModal(job));
    }
  }
  // Also show a notification on dashboard if visible
  const notifArea = document.getElementById('notif-area');
  if (notifArea) renderNotification(job, notifArea);
  if (!window._allJobs) window._allJobs = [];
  if (!window._allJobs.find(j => j.id === job.id)) window._allJobs.push(job);
  simIdx++;
  state.stats.jobsFound++;
}

// ── Applications ─────────────────────────────────────────────────
export function renderApplications(container) {
  if (state.applications.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-text">No applications yet. Find a job and click "I'm interested" to apply.</div>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="card">
      <div class="card-header"><div class="card-title">Application tracker</div><div class="card-subtitle">${state.applications.length} application${state.applications.length !== 1 ? 's' : ''} submitted</div></div>
      <div id="app-list">
        ${state.applications.map(app => `
          <div class="app-card">
            <div class="job-card-top">
              <div>
                <div class="job-role">${app.role}</div>
                <div class="job-company">${app.company}${app.location ? ' · ' + app.location : ''}</div>
              </div>
              <span class="tag tag-green">Applied</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:100%"></div></div>
            <div style="font-size:10px;color:var(--text-tertiary);margin-top:6px;display:flex;gap:10px;flex-wrap:wrap">
              <span>📅 ${timeAgo(app.submittedAt)}</span>
              <span>📄 ${app.resumeFilename}</span>
              ${app.tailored ? `<span style="color:var(--text-success)">✨ ${app.changeCount} optimizations applied</span>` : '<span>Original resume used</span>'}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.addEventListener('applicationAdded', () => renderApplications(container));
}

// ── Settings ─────────────────────────────────────────────────────
export function renderSettings(container) {
  const s = state.settings;
  container.innerHTML = `
    <div class="card">
      <div class="card-header"><div class="card-title">Radar settings</div></div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Scan frequency</label>
          <select class="form-select" id="s-freq">
            <option value="30min" ${s.scanFrequency==='30min'?'selected':''}>Every 30 minutes</option>
            <option value="1hr" ${s.scanFrequency==='1hr'?'selected':''}>Every hour</option>
            <option value="4hr" ${s.scanFrequency==='4hr'?'selected':''}>Every 4 hours</option>
            <option value="daily" ${s.scanFrequency==='daily'?'selected':''}>Once a day</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Auto-apply threshold (match %)</label>
          <input class="form-input" type="number" id="s-threshold" value="${s.autoApplyThreshold}" min="50" max="100" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Resume tailoring</label>
        <select class="form-select" id="s-tailor">
          <option value="always" ${s.alwaysTailor?'selected':''}>Always tailor before applying</option>
          <option value="ask" ${!s.alwaysTailor?'selected':''}>Ask me each time</option>
          <option value="never">Never tailor (use original)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Show tailored resume for review before submitting</label>
        <select class="form-select" id="s-diff">
          <option value="yes" ${s.showDiffBeforeApply?'selected':''}>Yes, always show me the diff</option>
          <option value="significant">Only if changes are significant</option>
          <option value="no" ${!s.showDiffBeforeApply?'selected':''}>No, submit automatically</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Notification method</label>
        <select class="form-select" id="s-notif">
          <option value="in-app" ${s.notifyMethod==='in-app'?'selected':''}>In-app only</option>
          <option value="email" ${s.notifyMethod==='email'?'selected':''}>In-app + Email</option>
        </select>
      </div>
      <div style="text-align:right"><button class="btn btn-primary" id="save-settings-btn">Save settings</button></div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Data &amp; privacy</div></div>
      <div style="font-size:12px;color:var(--text-secondary);line-height:1.6;margin-bottom:12px">
        Your profile, resumes, and application history are stored locally in your browser. Nothing is sent to any server in this demo version.
      </div>
      <button class="btn btn-danger btn-sm" id="clear-data-btn">Clear all saved data</button>
    </div>
  `;

  document.getElementById('save-settings-btn').addEventListener('click', () => {
    updateSettings({
      scanFrequency: document.getElementById('s-freq').value,
      autoApplyThreshold: parseInt(document.getElementById('s-threshold').value),
      alwaysTailor: document.getElementById('s-tailor').value === 'always',
      showDiffBeforeApply: document.getElementById('s-diff').value === 'yes',
      notifyMethod: document.getElementById('s-notif').value,
    });
    const btn = document.getElementById('save-settings-btn');
    btn.textContent = 'Saved!'; btn.classList.add('btn-success');
    setTimeout(() => { btn.textContent = 'Save settings'; btn.classList.remove('btn-success'); }, 1600);
  });

  document.getElementById('clear-data-btn').addEventListener('click', () => {
    if (confirm('This will clear all saved data. Are you sure?')) {
      localStorage.removeItem('job-autopilot-state');
      location.reload();
    }
  });
}
