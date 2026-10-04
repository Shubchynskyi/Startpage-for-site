# Portfolio · shubchynskyi.pp.ua

Static portfolio site in English and German, with case studies for selected projects.

## Structure

| Path | Content |
|---|---|
| `/` and `/de/` | Home: projects, how I work, contact |
| `/projects/garda/`, `/de/projects/garda/` | Case study: Garda Agent Orchestrator |
| `/projects/auth-service/`, `/de/projects/auth-service/` | Case study: Authentication Service |
| `css/site.css`, `js/site.js` | One stylesheet and one small script shared by every page |
| `cv/` | CV in English and German, plus plain-text versions for applicant tracking systems |
| `img/projects/` | Screenshots in WebP; Garda UI shots have light and dark variants |
| `fonts/` | Self-hosted Instrument Sans and JetBrains Mono (SIL OFL 1.1) |

There is no build step: every page is plain HTML. When you change a shared part (header, footer, contact), update all six pages.

## Behaviour

- Light and dark themes follow the system setting. The toggle in the header stores an explicit choice in `localStorage` (`theme`), and an inline script applies it before first paint.
- On the English home page, a first-time visitor whose browser prefers German is sent to `/de/`. A language picked in the header is remembered (`lang`).
- The page makes no third-party requests: fonts are local, there is no CDN, and GitHub stars come from `data/github-stats.json`.

## GitHub stats

Jenkins refreshes `data/github-stats.json` with `node scripts/update-github-stats.js` before copying the site to nginx; the pipeline also runs on a schedule.
