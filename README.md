# LaunchPad — Job Hunt Tracker

A personal job hunt tracker built with vanilla HTML, CSS, and JavaScript, backed by Firebase Firestore for persistent, cross-device data storage.

Built as a portfolio project while job hunting for Data Analyst, Data Science, Frontend Development, and AI Engineering roles — with a goal of landing an offer by January 2027.

## Features
- **Dashboard** — application stats, response rate, and a visual pipeline (Applied → Screening → Interview → Offer → Rejected)
- **My Companies** — track target companies with direct links to their careers page and LinkedIn Jobs page, priority levels, and notes
- **Applications** — log every application, update status inline, filter by stage
- **Suggested Companies** — curated company suggestions across nine tracks (Data Analyst, Data Science, Frontend Dev, AI Engineering, Business Analyst, Product Manager, DevOps, QA/Test, UX Design)

## Tech Stack
- Vanilla HTML, CSS, JavaScript — no frameworks, no build step
- Firebase Firestore — cloud data storage, syncs across devices
- Google Fonts (Syne + DM Sans)
- Hosted on GitHub Pages

## Running Locally
This app uses Firebase, which requires a real server URL (not `file://`) for module imports to work correctly.

1. Open the project folder in VS Code
2. Install the **Live Server** extension
3. Right-click `index.html` → **Open with Live Server**
4. The app will run at `http://127.0.0.1:5500` (or similar)

## Data Storage
All data is stored in Firebase Firestore under the project `launchpad-3d185`. Each signed-in user has their own document at `users/{uid}`, keyed to their Firebase Auth UID — no two users share data.

⚠️ **Security note:** Firebase Authentication (email/password) gates access at the UI level, but that alone does not protect the database. Firestore security rules must explicitly restrict each `users/{uid}` document to requests where `request.auth.uid == uid`. Verify this in the Firebase console under Firestore Database → Rules before relying on this for anything beyond local testing — a rule set left in test mode (or one that doesn't check `request.auth.uid`) would let any authenticated user read or write any other user's data, regardless of what the client-side code does.

## Deploying to GitHub Pages
1. Push this folder to a GitHub repository
2. Go to repo **Settings → Pages**
3. Set source to: **Deploy from branch → main → / (root)**
4. Your app will be live at `https://[yourusername].github.io/[repo-name]`

## Roadmap / Future Ideas
- **Auto-scan job postings** — instead of manually checking each company's careers page or LinkedIn, automatically scan and surface the most recent postings for companies on the watchlist
- **Export/import data** — CSV export for backup and portability
- **Resume version uploads** — store actual resume files per job track, not just metadata
- **Search and sort** — quickly filter companies and applications by name, date, or track

## Project Structure
```
launchpad/
├── index.html
├── style.css
├── app.js
├── README.md
└── .gitignore
```