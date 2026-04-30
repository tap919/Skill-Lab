<div align="center">
  <img width="100%" height="auto" alt="Skill Lab" src="https://raw.githubusercontent.com/tap919/Skill-Lab/main/docs/screenshots/home.png" onerror="this.style.display='none'">
</div>

<div align="center">

# ⚡ Skill Lab

### AI Skill Forge for Google AI Edge Gallery

[![Release](https://img.shields.io/github/v/release/tap919/Skill-Lab?style=for-the-badge&logo=android&logoColor=white&label=APK)](https://github.com/tap919/Skill-Lab/releases/latest/download/app-debug.apk)
[![License](https://img.shields.io/github/license/tap919/Skill-Lab?style=for-the-badge)](LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/tap919/Skill-Lab/build.yml?style=for-the-badge)](https://github.com/tap919/Skill-Lab/actions)
[![Stars](https://img.shields.io/github/stars/tap919/Skill-Lab?style=for-the-badge)](https://github.com/tap919/Skill-Lab/stargazers)

</div>

## Features

| | Feature | Description |
|---|---------|-------------|
| ⚡ | **Zero-Config Auto Forge** | Describe what you want → AI proposes, tests, verifies, and secures the skill |
| 📱 | **Phone-Aware Creation** | Real device telemetry (battery, network, location) suggests skills you actually need |
| 🧠 | **Self-Evolving Skills** | Usage analytics, feedback collection, auto-refine from real usage |
| 📦 | **Edge Gallery Export** | One-tap download: `SKILL.md` with YAML frontmatter, `index.html` for JS skills |
| 🔌 | **Native Android** | Capacitor app with geolocation, filesystem, clipboard, network, status-bar plugins |
| 🔒 | **Security Built In** | Secret scanning, leak/smell detection, privacy-first local storage |
| 🤖 | **Agent Control** | Screen browser agent, betting agent with configurable targets |
| 🗂️ | **Skill Builder** | 9-tab editor: naming, rules, samples, Edge config, tools, workflow, schedule, tests, share |

## Quick Start

### Download APK

[Download the latest APK](https://github.com/tap919/Skill-Lab/releases/latest/download/app-debug.apk) and install on Android (enable "Unknown sources" in Settings).

### Build from Source

```bash
# Prerequisites: Node.js 20+, Android SDK, Java 17+
git clone https://github.com/tap919/Skill-Lab.git
cd Skill-Lab
npm install

# Set your Gemini API key
cp .env.example .env.local
# Edit .env.local with your API key

# Build web app & APK
npm run build
npm run android:sync
./android/gradlew assembleDebug

# APK at: android/app/build/outputs/apk/debug/app-debug.apk
```

### Development Server

```bash
npm run dev      # Vite dev server (port 3000)
npm run serve    # Static file server (port 9000)
```

## Screenshots

<div align="center">
  <table>
    <tr>
      <td><img src="docs/screenshots/home.png" width="250" alt="Skill Directory"></td>
      <td><img src="docs/screenshots/forge.png" width="250" alt="Skill Forge"></td>
      <td><img src="docs/screenshots/builder.png" width="250" alt="Skill Builder"></td>
    </tr>
    <tr align="center">
      <td><b>Skill Directory</b></td>
      <td><b>AI Skill Forge</b></td>
      <td><b>Skill Builder</b></td>
    </tr>
  </table>
</div>

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 6, Tailwind CSS 4 |
| **Mobile** | Capacitor 8 (Android native wrapper) |
| **AI** | Google Gemini API (via `@google/genai`) |
| **Database** | Firebase Auth + Firestore (with offline fallback) |
| **Animations** | Motion (Framer Motion) |
| **CI/CD** | GitHub Actions (auto-build APK) |
| **Plugins** | geolocation, filesystem, clipboard, network, status-bar |

## Environment Variables

```bash
GEMINI_API_KEY=your_gemini_api_key   # Required for AI features
```

Keys can also be configured in-app: **Settings → 05_APIS**

## Edge Gallery Export Format

Exported skills follow the [Google AI Edge Gallery](https://edgegallery.google/) specification:

```
skll-name/
├── SKILL.md          # YAML frontmatter + markdown instructions
└── scripts/
    └── index.html    # (JS skills only) HTML with ai_edge_gallery_get_result
```

**SKILL.md frontmatter:**
```yaml
---
name: kebab-case-name
description: What the skill does
homepage: https://...
metadata:
  require-secret: true
  require-secret-description: API key from Settings
---
```

## Project Structure

```
├── src/
│   ├── components/       # React components (SkillCard, SkillForge, Settings, Agent...)
│   ├── services/         # aiSkillAgent, edgeGalleryExporter, phoneStateScanner, usageAnalytics, localModelScanner
│   ├── lib/              # Firebase, id generation, utilities
│   ├── constants/        # Preset skills
│   └── types.ts          # TypeScript interfaces
├── android/              # Capacitor Android native project
├── docs/                 # GitHub Pages docs site
├── scripts/              # Playwright screenshot & diagnostic tools
├── server.mjs            # Simple static file server
└── package.json
```

## Support

| Method | Contact |
|--------|---------|
| 💸 **Donate** | [`$helptools` on CashApp](https://cash.app/$helptools) |
| 📧 **Email** | [tap4500@gmail.com](mailto:tap4500@gmail.com) |
| 🐛 **Issues** | [GitHub Issues](https://github.com/tap919/Skill-Lab/issues) |
| ⭐ **Star** | [Star on GitHub](https://github.com/tap919/Skill-Lab) |

---

<div align="center">

[Download APK](https://github.com/tap919/Skill-Lab/releases/latest/download/app-debug.apk) • [Releases](https://github.com/tap919/Skill-Lab/releases) • [Changelog](docs/CHANGELOG.md) • [Docs Site](https://tap919.github.io/Skill-Lab/)

</div>