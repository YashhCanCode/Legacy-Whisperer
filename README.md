# 🔍 Legacy Whisperer
### AI-Powered Living Documentation — Powered by IBM Bob

> *Your code changes. Your docs keep up.*

[![Built with IBM Bob](https://img.shields.io/badge/Built%20with-IBM%20Bob-054ADA?style=flat-square)](https://bob.ibm.com)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![IBM Bob Hackathon](https://img.shields.io/badge/IBM%20Bob-Hackathon%202025-054ADA?style=flat-square)](https://bob.ibm.com)

---

## The Problem

Every software team faces the same silent problem: **documentation that lies.**

A developer updates a function, changes an API response, or modifies a config value — and somewhere in a README or API doc, the old information quietly becomes fiction. New developers trust it, get burned, and waste hours debugging something that was never true to begin with.

No linter catches this. No CI pipeline flags it. It just sits there, wrong, until someone suffers.

---

## The Solution

**Legacy Whisperer** hooks into your git workflow and uses IBM Bob to automatically detect when code changes make your documentation outdated — then tells you exactly what to fix and how.

```
Developer commits code
        ↓
Legacy Whisperer hook fires automatically
        ↓
Diff parsed → related docs identified
        ↓
IBM Bob analyzes what changed and why it matters
        ↓
Dashboard shows flagged lines with exact fixes
        ↓
One click → documentation updated on disk
```

---

## Demo

![Legacy Whisperer Dashboard](./assets/dashboard.png)

**The full flow:**
1. Developer changes `TOKEN_EXPIRY` from `1h` to `24h` in `auth.js`
2. `git commit` fires the Legacy Whisperer hook automatically
3. Hook detects `auth.js` changed, scans markdown docs, finds related sections
4. Bob analyzes the change and identifies 7 stale doc sections across 2 files
5. Dashboard lights up 🔴 — showing exactly which lines are wrong and why
6. Click a flagged line → Bob's suggested fix appears
7. Click **Accept Fix** → file updated on disk instantly
8. Dashboard goes 🟢 — docs are true again

---

## How IBM Bob Is Used

IBM Bob is the **core reasoning engine** of Legacy Whisperer — not a wrapper, not an afterthought.

When a commit is detected, Legacy Whisperer constructs a precise prompt containing:
- The exact code diff (added/removed lines, changed functions)
- The content of all potentially affected documentation sections
- A structured task asking Bob to identify stale content

Bob then reasons about *what the change means* for human-readable documentation — understanding intent, not just matching keywords. It returns the exact line numbers, explains what's wrong, and provides corrected text.

IBM Bob was also used as the **development partner** throughout the entire build — scaffolding the CLI, writing the diff parser, generating React components, and building the demo repository.

---

## Features

- **Automatic git hook** — fires on every commit, zero extra steps for developers
- **Intelligent doc matching** — finds related sections by heading and content analysis
- **Bob-powered analysis** — genuine AI reasoning about what changed and why it matters
- **Visual dashboard** — VS Code-style doc viewer with flagged lines highlighted
- **One-click fixes** — accepts Bob's suggestion and writes to disk instantly
- **Live polling** — dashboard updates automatically after each analysis
- **Multi-file support** — scans all markdown files across the repository

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Engine | IBM Bob |
| CLI & Hook | Node.js |
| Backend API | Express.js |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Doc Parsing | Native Node.js (fs, path) |
| Git Integration | Pre-commit hooks |

---

## Project Structure

```
legacy-whisperer/
├── cli/
│   ├── index.js          ← Pre-commit hook entry point
│   ├── diff-parser.js    ← Parses git diff output
│   ├── doc-scanner.js    ← Finds and reads markdown files
│   ├── bob-bridge.js     ← Constructs Bob analysis prompt
│   ├── doc-updater.js    ← Writes fixes back to files
│   ├── result-parser.js  ← Parses Bob's JSON response
│   ├── server.js         ← Express API server
│   └── install-hook.sh   ← Hook installer script
├── web/
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── FileTree.jsx
│           ├── DocViewer.jsx
│           ├── AnalysisPanel.jsx
│           └── StatusBadge.jsx
└── demo-repo/            ← Example repo for demonstration
    ├── src/
    │   ├── auth.js
    │   └── db.js
    ├── README.md
    └── API.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- IBM Bob installed in VS Code
- Git

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/legacy-whisperer
cd legacy-whisperer

# Install CLI dependencies
cd cli && npm install

# Install web dependencies
cd ../web && npm install
```

### Install the hook into a repository

```bash
cd your-target-repo
bash /path/to/legacy-whisperer/cli/install-hook.sh
```

### Start the dashboard

```bash
# Terminal 1 — API server
cd cli && node server.js

# Terminal 2 — React dashboard
cd web && npm run dev
```

### Run the demo

```bash
cd demo-repo

# Make a code change
# Edit src/auth.js — change TOKEN_EXPIRY from '1h' to '24h'

# Commit it
git add src/auth.js
git commit -m "update token expiry to 24h"

# Hook fires automatically
# Open Bob, paste the prompt from /tmp/docsync-analysis.txt
# Save Bob's response to /tmp/bob-raw-output.txt
# Click "Run Analysis" → "Done, Parse Results" in the dashboard
```

---

## Built At

**IBM Bob Hackathon 2025** — *Your repo. Your rules. AI as your dev partner.*

Built solo in under 24 hours using IBM Bob as both the product engine and development partner.

---

## License

MIT
