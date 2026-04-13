import { state, loadFromLocalStorage } from './state.js';
import { renderDashboard, renderProfile, renderJobSearch, renderApplications, renderSettings } from './sections.js';
import { DEMO_JOBS } from './jobData.js';

// ── Bootstrap ────────────────────────────────────────────────────
loadFromLocalStorage();
window._allJobs = [...DEMO_JOBS];

// ── Render shell ─────────────────────────────────────────────────
document.getElementById('app').innerHTML = `
  <div class="app-layout">
    <div class="sidebar-overlay" id="sidebar-overlay"></div>

    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon">🚀</div>
        <div>
          <div class="logo-text">Job Autopilot</div>
          <div class="logo-sub">AI-powered · v2.0</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label">Main</div>
        <div class="nav-item active" data-section="dashboard">
          <span class="nav-icon">📊</span> Dashboard
        </div>
        <div class="nav-item" data-section="profile">
          <span class="nav-icon">👤</span> Profile &amp; Resumes
        </div>
        <div class="nav-section-label" style="margin-top:6px">Jobs</div>
        <div class="nav-item" data-section="search">
          <span class="nav-icon">🔍</span> Job Search
          <span class="nav-badge red" id="new-jobs-badge">3</span>
        </div>
        <div class="nav-item" data-section="applications">
          <span class="nav-icon">📋</span> Applications
          <span class="nav-badge green" id="apps-badge">${state.applications.length}</span>
        </div>
        <div class="nav-section-label" style="margin-top:6px">Config</div>
        <div class="nav-item" data-section="settings">
          <span class="nav-icon">⚙️</span> Settings
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="radar-status">
          <div class="radar-dot"></div>
          <span>Radar active · scanning hourly</span>
        </div>
      </div>
    </aside>

    <div class="main-area">
      <div class="topbar">
        <button class="menu-btn" id="menu-btn" aria-label="Toggle menu">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect y="2" width="18" height="1.5" rx="1" fill="currentColor"/>
            <rect y="8" width="18" height="1.5" rx="1" fill="currentColor"/>
            <rect y="14" width="18" height="1.5" rx="1" fill="currentColor"/>
          </svg>
        </button>
        <span class="topbar-title" id="page-title">Dashboard</span>
        <div class="topbar-actions">
          <span style="font-size:11px;color:var(--text-tertiary)" id="profile-name">${state.profile.name}</span>
        </div>
      </div>

      <div class="content-area" id="content-area">
        <!-- sections render here -->
      </div>
    </div>
  </div>
`;

// ── Navigation ───────────────────────────────────────────────────
const SECTIONS = {
  dashboard: { title: 'Dashboard', render: renderDashboard },
  profile: { title: 'Profile & Resumes', render: renderProfile },
  search: { title: 'Job Search', render: renderJobSearch },
  applications: { title: 'Applications', render: renderApplications },
  settings: { title: 'Settings', render: renderSettings },
};

let currentSection = 'dashboard';

function navigate(sectionId) {
  if (!SECTIONS[sectionId]) return;
  currentSection = sectionId;

  // Update nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.section === sectionId);
  });

  // Update title
  document.getElementById('page-title').textContent = SECTIONS[sectionId].title;

  // Render section
  const content = document.getElementById('content-area');
  SECTIONS[sectionId].render(content);

  // Update badges
  document.getElementById('apps-badge').textContent = state.applications.length;

  // Close mobile sidebar
  closeSidebar();
}

document.querySelectorAll('.nav-item[data-section]').forEach(el => {
  el.addEventListener('click', () => navigate(el.dataset.section));
});

// ── Mobile sidebar ───────────────────────────────────────────────
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');

document.getElementById('menu-btn').addEventListener('click', () => {
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
});
overlay.addEventListener('click', closeSidebar);

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('open');
}

// ── Listen for application added to update badge ─────────────────
document.addEventListener('applicationAdded', () => {
  document.getElementById('apps-badge').textContent = state.applications.length;
});

// ── Initial render ───────────────────────────────────────────────
navigate('dashboard');
