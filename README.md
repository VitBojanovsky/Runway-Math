# Runway Math

Table of contents
- Features
- Quick start
- Scripts
- Project layout
- Usage
- Notes & TODOs
- Contributing
- License

Features
- Simple UI for takeoff-performance pages (linked from `index.html`)
- Node/Express static server for local hosting
- Minimal test that validates an aircraft JSON file

Quick start

Prerequisites
- Node.js (v16+ recommended)
- npm

Install dependencies
```bash
npm install
```

Run locally
```bash
npm start
# Server starts at http://localhost:3000
```

Run tests
```bash
npm test
# Runs test.js which validates data/Cessna 152.json
```

Available scripts
- `start` — runs `node server.js` and starts the web server (default port: 3000)
- `test` — runs `node test.js` to validate aircraft JSON in `data/`

Project layout 
- `index.html` — main landing page (links to `pages/takeoff.html`)
- `pages/` — directory intended for individual pages (e.g., `takeoff.html`)
- `data/` — aircraft JSON files (test expects `data/Cessna 152.json`)
- `server.js` — Node/Express server:
  - serves static files from a `public` directory (see note below)
  - provides a health endpoint at `/api/health`
- `test.js` — simple Node test that loads `data/Cessna 152.json` and asserts fields
- `package.json` / `package-lock.json` — package metadata and dependencies (express)
- `.github/` — present but not detailed here
- `index.html.css` and `index.html.js` — present as files but currently empty

Usage
- Open http://localhost:3000 after `npm start`. The server logs:
  ```
  Server running at http://localhost:3000
  ```
- The landing page (`index.html`) links to `pages/takeoff.html` for the takeoff-performance calculator.
- The tests are standalone and read JSON files from the `data/` folder, so make sure the expected JSON files exist before running `npm test`.

Notes & TODOs 
- server.js serves static files from a `public` directory:
  ```js
  app.use(express.static(path.join(__dirname, "public")));
  ```
  But `index.html` and `pages/` are currently in the repository root. You should either:
  - Move `index.html`, `pages/`, and other static assets into a `public/` directory, or
  - Change server.js to serve the repository root (or the directory where those files live). Example change:
    ```js
    // serve files from repo root:
    app.use(express.static(path.join(__dirname)));
    ```
- `test.js` expects `data/Cessna 152.json`. If that file is missing, tests will fail. Make sure your aircraft JSON files are in `data/`.
- `index.html.css` and `index.html.js` are empty placeholder files — populate or remove them as needed.
- package.json "name" is currently "takeoff-performance" which differs from the repository name; consider aligning naming if desired.
- Consider adding a `public/` directory, or reorganizing static assets for clearer structure.
- Add a LICENSE file if you want to declare the project license.

Links 
- Repository: https://github.com/VitBojanovsky/Runway-math
- package.json: https://github.com/VitBojanovsky/Runway-math/blob/main/package.json
- server.js: https://github.com/VitBojanovsky/Runway-math/blob/main/server.js
- index.html: https://github.com/VitBojanovsky/Runway-math/blob/main/index.html
- test.js: https://github.com/VitBojanovsky/Runway-math/blob/main/test.js

NOTE ABOUT THE REPOSITORY SEARCH: results used to assemble this README were fetched programmatically and may be incomplete. For the full repository view and to see any additional files, browse the repository on GitHub: https://github.com/VitBojanovsky/Runway-math

Contributing
- Feel free to open issues or pull requests describing improvements (UI enhancements, more aircraft data, better validations, CI/tests, etc.).
License:
LICENSE.md
