# Portfolio Landing Page

A modern landing page with information about a developer and their projects. Includes links to resume, GitHub, and various applications with availability indicators.

## Features

- Responsive design for all devices
- Multilingual support (English/German)
- Browser language auto-detection
- Dark/light theme toggle
- Project availability indicators
- GitHub star fallback data refreshed by the deployment pipeline
- Clean and modern design

## GitHub stats

The site reads GitHub star fallback values from `data/github-stats.json`.
Jenkins refreshes this file with `node scripts/update-github-stats.js` before copying static files to nginx, and the pipeline also runs on a scheduled cron trigger.
