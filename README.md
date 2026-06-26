# LaunchPad — Job Hunt Tracker

🔗 **Live app:** https://anula513.github.io/launchpad

A personal job hunt tracker built with vanilla HTML, CSS, and JavaScript, backed by Firebase Firestore for persistent, cross-device data storage.

Built as a portfolio project while targeting AI Engineering and Data Science roles — with a goal of landing an offer by January 2027.

## Features
- **Dashboard** — application stats, response rate, and a visual pipeline (Applied → Screening → Interview → Offer → Rejected)
- **My Companies** — track target companies with direct links to their careers page and LinkedIn Jobs page, priority levels, and notes
- **Applications** — log every application, update status inline, filter by stage
- **Suggested Companies** — curated company suggestions across nine tracks (Data Analyst, Data Science, Frontend Dev, AI Engineering, Business Analyst, Product Manager, DevOps, QA/Test, UX Design)

## Tech Stack
- Vanilla HTML, CSS, JavaScript — no frameworks, no build step
- Firebase Firestore — cloud data storage, syncs across devices
- Firebase Authentication — email/password auth, each user's data is fully isolated
- Google Fonts (Syne + DM Sans)
- Hosted on GitHub Pages

## Security
Firestore security rules restrict each `users/{uid}` document to requests where `request.auth.uid == uid` — no user can read or write another user's data.

## Running Locally
This app uses Firebase, which requires a real server URL (not `file://`) for module imports to work correctly.

1. Open the project folder in VS Code
2. Install the **Live Server** extension
3. Right-click `index.html` → **Open with Live Server**
4. The app will run at `http://127.0.0.1:5500` (or similar)

## Deploying to GitHub Pages
1. Push this folder to a GitHub repository
2. Go to repo **Settings → Pages**
3. Set source to: **Deploy from branch → main → / (root)**
4. Your app will be live at `https://[yourusername].github.io/[repo-name]`

## Roadmap / Future Ideas
- **Auto-scan job postings** — automatically surface recent postings for companies on the watchlist
- **Export/import data** — CSV export for backup and portability
- **Resume version uploads** — store resume files per job track
- **Search and sort** — filter companies and applications by name, date, or track

## Project Structure
launchpad/
├── index.html
├── style.css
├── app.js
├── README.md
└── .gitignore
