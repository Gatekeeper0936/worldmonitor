# Local Setup Guide

Step-by-step instructions for cloning, running, and updating WorldMonitor (including the TaskDock dashboard features) on your local machine.

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| **Git** | Any recent version | [git-scm.com](https://git-scm.com/) |
| **Node.js** | 18 or higher | [nodejs.org](https://nodejs.org/) — LTS recommended |
| **npm** | Bundled with Node.js | v9+ |
| **Go** *(optional)* | 1.21+ | Only needed to regenerate proto stubs (`make generate`) |

---

## 1. Clone the Repository

### Option A — Clone directly (read-only / personal use)

```bash
git clone https://github.com/Gatekeeper0936/worldmonitor.git
cd worldmonitor
```

### Option B — Fork first (to contribute changes back)

1. Click **Fork** on GitHub to create your own copy.
2. Clone your fork:

```bash
git clone https://github.com/<your-username>/worldmonitor.git
cd worldmonitor
```

3. Add the upstream remote so you can pull future updates:

```bash
git remote add upstream https://github.com/Gatekeeper0936/worldmonitor.git
```

Verify remotes:

```bash
git remote -v
# origin    https://github.com/<your-username>/worldmonitor.git (fetch)
# origin    https://github.com/<your-username>/worldmonitor.git (push)
# upstream  https://github.com/Gatekeeper0936/worldmonitor.git (fetch)
# upstream  https://github.com/Gatekeeper0936/worldmonitor.git (push)
```

---

## 2. Install Dependencies

```bash
npm install
```

This also installs the blog-site dependencies automatically via `postinstall`.

---

## 3. (Optional) Configure Environment Variables

The dashboard runs with **zero configuration** — no API keys are required for basic operation. External data sources that require keys will simply show as unavailable.

For full functionality:

```bash
cp .env.example .env.local
```

Open `.env.local` in your editor and fill in only the keys you need. Every variable is documented inside the file. Common ones to start with:

| Variable | Purpose | Where to get it |
|---|---|---|
| `GROQ_API_KEY` | AI news summaries | [console.groq.com](https://console.groq.com/) (free tier) |
| `FINNHUB_API_KEY` | Stock market data | [finnhub.io](https://finnhub.io/) (free tier) |
| `UPSTASH_REDIS_REST_URL` + `TOKEN` | Cross-user caching | [upstash.com](https://upstash.com/) (free tier) |

---

## 4. Start the Development Server

```bash
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### Dashboard variants

Each variant has its own URL and panel configuration:

| Command | URL | Focus |
|---|---|---|
| `npm run dev` | localhost:5173 | Full / geopolitics (default) |
| `npm run dev:tech` | localhost:5173 | Technology & AI |
| `npm run dev:finance` | localhost:5173 | Markets & finance |
| `npm run dev:commodity` | localhost:5173 | Commodity markets |
| `npm run dev:happy` | localhost:5173 | Positive news only |

---

## 5. Using TaskDock Features

The TaskDock dashboard adds a **Profile Switcher** to the top header, plus two new panels available in the **Full** variant.

### Panels

| Panel ID | Description |
|---|---|
| `philippines` | Local Philippines news (Inquirer.net, Rappler, ABS-CBN, GMA, and more) |
| `taskdock-coding` | Coding launcher — VS Code, PyCharm, GitHub, Colab, Replit, PowerShell |
| `taskdock-social` | Social feeds — YouTube, TikTok, Instagram, Facebook, X, Discord, Reddit, LinkedIn |

### Profile Switcher

Click the **🗂️** icon in the dashboard header to:

- **Switch** between saved profiles (each profile shows/hides a specific set of panels)
- **Create** a new profile with a custom name
- **Save Current Layout** — captures which panels are currently visible and saves them as a profile
- **Rename / Delete** existing profiles

Profiles are stored in `localStorage` — they persist across browser sessions without any server or sign-in.

**Default profiles seeded on first load:**

| Profile | Panels included |
|---|---|
| News | World news, Philippines news, AI/ML news |
| Social & Coding | TaskDock Coding Launchers + TaskDock Social |
| All Panels | Every panel enabled |

---

## 6. Run Tests

```bash
# TypeScript type checking (fast, recommended before any commit)
npm run typecheck

# Data integrity and unit tests
npm run test:data

# Sidecar / API handler tests
npm run test:sidecar
```

---

## 7. Production Build

```bash
# Full variant (default — includes all panels and TaskDock features)
npm run build

# Specific variants
npm run build:tech
npm run build:finance
npm run build:commodity
npm run build:happy
```

Built output lands in `dist/`. Serve it with any static file server:

```bash
npm run preview       # Vite's built-in preview server (localhost:4173)
```

---

## 8. Keeping Your Clone Up to Date

### If you cloned directly:

```bash
git pull origin main
npm install          # re-run if package.json changed
npm run dev
```

### If you forked (pull from upstream):

```bash
git fetch upstream
git checkout main
git merge upstream/main
npm install
npm run dev
```

### Working on a feature branch:

```bash
# Create a branch
git checkout -b feature/my-improvement

# ... make your changes ...

# Stage and commit
git add .
git commit -m "feat: describe your change"

# Push to your fork
git push origin feature/my-improvement
```

Then open a Pull Request from your fork's branch to `Gatekeeper0936/worldmonitor:main`.

---

## 9. Useful Commands Reference

| Command | What it does |
|---|---|
| `git status` | Show changed / staged files |
| `git diff` | Show unstaged changes |
| `git log --oneline -10` | Show the last 10 commits |
| `git stash` | Temporarily shelve uncommitted changes |
| `git stash pop` | Restore stashed changes |
| `npm run typecheck` | TypeScript type-check (no emit) |
| `npm run lint` | Biome lint |
| `npm run lint:fix` | Biome lint with auto-fix |
| `npm run build` | Production build (full variant) |
| `npm run preview` | Preview production build locally |

---

## 10. Troubleshooting

### Port already in use

Vite defaults to port 5173. If it is taken, Vite will automatically try the next available port and print the URL in the terminal output.

### `npm install` fails

- Make sure you are on Node.js 18+: `node --version`
- Delete `node_modules` and the lock file, then reinstall:

  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### Blog-site install fails

The `postinstall` hook runs `cd blog-site && npm ci`. If you hit a network error:

```bash
cd blog-site
npm install
cd ..
```

### TypeScript errors after pulling

Generated stubs in `src/generated/` are committed — they should always match the checked-in `.proto` files. If you see TS errors after a pull, a `node_modules` refresh usually fixes them:

```bash
npm install
npm run typecheck
```

If you modified `.proto` files yourself, regenerate the stubs (requires Go 1.21+ and `buf`):

```bash
make generate
```

---

For further details see [CONTRIBUTING.md](./CONTRIBUTING.md) and the [documentation site](https://docs.worldmonitor.app).
