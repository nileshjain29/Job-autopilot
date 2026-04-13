# 🚀 Job Autopilot

AI-powered job search and application assistant. Automatically finds matching jobs, tailors your resume to each job description (without fabricating experience), and walks you through the application — prompting you only when it needs input.

## Features

- **Job radar** — simulates scanning job boards (LinkedIn, Greenhouse, Lever) for matching roles
- **AI resume tailoring** — rewrites bullet points and reorders skills to match the JD, using only your real experience. Format is preserved exactly.
- **Side-by-side diff view** — review every change before approving
- **Application auto-fill** — fills personal details, visa status, cover letter, salary expectations
- **Smart prompting** — asks you only for answers it can't infer from your profile
- **Multiple resumes** — upload different resumes per role type (frontend, ML, backend, etc.)
- **Application tracker** — tracks every application with which resume version was used
- **Local persistence** — your profile, resumes, and history are saved in browser localStorage
- **Responsive** — works on desktop, tablet, and mobile
- **Dark mode** — automatically follows your system preference

## Quick start (no install needed)

Just open `index.html` in any modern browser — no build step, no server required.

```bash
git clone https://github.com/YOUR_USERNAME/job-autopilot.git
cd job-autopilot
open index.html   # macOS
# or double-click index.html in your file manager
```

## Deploy to GitHub Pages (free hosting)

1. Push this repo to GitHub (see below)
2. Go to your repo → **Settings** → **Pages**
3. Under "Source", select **Deploy from a branch**
4. Choose `main` branch → `/ (root)` → **Save**
5. Your app will be live at `https://YOUR_USERNAME.github.io/job-autopilot`

## Push to GitHub

```bash
cd job-autopilot
git init
git add .
git commit -m "Initial commit — Job Autopilot v2"
git remote add origin https://github.com/YOUR_USERNAME/job-autopilot.git
git branch -M main
git push -u origin main
```

## Project structure

```
job-autopilot/
├── index.html          # Entry point
├── src/
│   ├── main.js         # App bootstrap and navigation
│   ├── styles.css      # Full design system (dark mode included)
│   ├── state.js        # App state + localStorage persistence
│   ├── resumeData.js   # Resume templates and tailoring engine
│   ├── jobData.js      # Job listings and radar simulation
│   ├── modals.js       # Modal UI components
│   └── sections.js     # Page renderers (dashboard, profile, search, etc.)
└── public/
    └── favicon.svg
```

## Connecting real job APIs

The app is structured so you can swap `jobData.js` mock data for real APIs:

- **LinkedIn Jobs API** — requires LinkedIn partner access
- **Greenhouse** — `GET https://boards-api.greenhouse.io/v1/boards/{company}/jobs`
- **Lever** — `GET https://api.lever.co/v0/postings/{company}`
- **Adzuna / RapidAPI** — general job search APIs available with free tiers

Replace the `DEMO_JOBS` and `RADAR_JOBS` arrays in `src/jobData.js` with your API responses.

## Connecting real AI (Claude API)

To use real Claude AI for resume tailoring and cover letter generation, replace the `buildTailoredResume` function in `src/resumeData.js` with an API call:

```js
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': YOUR_KEY },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Tailor this resume for the job description. Only change phrasing and emphasis — do not invent experience.\n\nRESUME:\n${JSON.stringify(resume)}\n\nJOB DESCRIPTION:\n${jobDescription}`
    }]
  })
});
```

## License

MIT — use freely, modify as you like.
