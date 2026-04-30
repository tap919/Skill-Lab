# Changelog

All notable changes to Skill Lab will be documented in this file.

## [1.0.0] - 2026-04-30

### Added
- **Zero-Config Auto Forge** — Single function chains: propose → test → verify → secure
  - Auto-detects JS vs text-only skills by scanning for `run_js`, `javascript` keywords
  - Auto-generates test scenarios if none provided
  - Security scoring with leak/smell detection
  - `autoForgeSkill()` and `autoRefineFromFeedback()` functions

- **Phone-Aware Auto-Creation** — Real OS telemetry
  - Battery info via `navigator.getBattery()`
  - Network info via `navigator.connection`
  - Screen, device, idle tracking
  - Geolocation with permission handling
  - Gap detection suggests skills based on phone state

- **Self-Evolving Skills** — Usage analytics
  - IndexedDB storage for events and feedback
  - `trackSkillEvent()`, `collectFeedback()`, `getSkillAnalytics()`
  - Track invokes, successes, failures, duration

- **Edge Gallery Export**
  - SKILL.md generation with kebab-case naming
  - 04_EDGE tab with isJsSkill, requireSecret, toolCalls
  - 05_TOOLS tab with run_js, run_intent configuration

- **Capacitor Android App**
  - Native plugins: geolocation, network, filesystem, clipboard, status-bar
  - APK build via GitHub Actions CI/CD
  - Debug APK release with every push to master

### Technical
- TypeScript strict mode, 0 type errors
- Mobile-first responsive UI (sm/md/lg breakpoints)
- Fixed bottom navigation for phone thumb zone
- Error boundary for crash recovery
- GitHub Actions auto-build on push