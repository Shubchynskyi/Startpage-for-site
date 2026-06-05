const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

const statsPath = path.join(__dirname, '..', 'data', 'github-stats.json');
const today = new Date().toISOString().slice(0, 10);

async function main() {
    const stats = readStatsFile();
    const repositories = stats.repositories || {};
    const repoNames = Object.keys(repositories);

    if (repoNames.length === 0) {
        console.warn('[github-stats] No repositories configured.');
        return;
    }

    let updatedCount = 0;

    for (const repo of repoNames) {
        const source = repositories[repo].source || `https://api.github.com/repos/${repo}`;

        try {
            const repoData = await fetchJson(source);
            const stars = repoData.stargazers_count;

            if (!Number.isFinite(stars)) {
                logPreviousValue(repo, repositories[repo].stars, 'GitHub response did not include stargazers_count.');
                continue;
            }

            repositories[repo] = {
                ...repositories[repo],
                stars,
                updatedAt: today,
                source
            };
            updatedCount += 1;
            console.log(`[github-stats] ${repo}: ${stars} stars`);
        } catch (error) {
            logPreviousValue(repo, repositories[repo].stars, error.message);
        }
    }

    stats.repositories = repositories;
    writeStatsFile(stats);
    console.log(`[github-stats] Updated ${updatedCount}/${repoNames.length} repositories.`);
}

function readStatsFile() {
    return JSON.parse(fs.readFileSync(statsPath, 'utf8'));
}

function writeStatsFile(stats) {
    fs.writeFileSync(statsPath, `${JSON.stringify(stats, null, 2)}\n`, 'utf8');
}

function logPreviousValue(repo, previousStars, reason) {
    console.warn(`[github-stats] ${repo}: keeping previous value (${previousStars ?? 'none'}). ${reason}`);
}

async function fetchJson(url) {
    const errors = [];

    try {
        return await fetchJsonWithNode(url);
    } catch (nodeFetchError) {
        errors.push(`node fetch failed: ${nodeFetchError.message}`);
    }

    try {
        return await fetchJsonWithCurl(url);
    } catch (curlError) {
        errors.push(`curl fallback failed: ${curlError.message}`);
    }

    if (process.platform === 'win32') {
        try {
            return await fetchJsonWithPowerShell(url);
        } catch (powerShellError) {
            errors.push(`PowerShell fallback failed: ${powerShellError.message}`);
        }
    }

    throw new Error(errors.join('; '));
}

async function fetchJsonWithNode(url) {
    if (typeof fetch !== 'function') {
        throw new Error('Node fetch is not available.');
    }

    const headers = {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'portfolio-github-stats-updater'
    };

    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(url, {
        cache: 'no-store',
        headers
    });

    if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}`);
    }

    return response.json();
}

async function fetchJsonWithCurl(url) {
    const args = [
        '-fsSL',
        '-H',
        'Accept: application/vnd.github+json',
        '-H',
        'User-Agent: portfolio-github-stats-updater'
    ];

    if (process.env.GITHUB_TOKEN) {
        args.push('-H', `Authorization: Bearer ${process.env.GITHUB_TOKEN}`);
    }

    args.push(url);

    const { stdout } = await execFileAsync('curl', args, {
        maxBuffer: 1024 * 1024
    });

    return JSON.parse(stdout);
}

async function fetchJsonWithPowerShell(url) {
    const headers = {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'portfolio-github-stats-updater'
    };

    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const headerRows = Object.entries(headers)
        .map(([key, value]) => `'${escapePowerShellString(key)}' = '${escapePowerShellString(value)}'`)
        .join('; ');
    const command = [
        '$ProgressPreference = "SilentlyContinue"',
        `$headers = @{ ${headerRows} }`,
        `Invoke-RestMethod -Uri '${escapePowerShellString(url)}' -Headers $headers | ConvertTo-Json -Depth 8 -Compress`
    ].join('; ');

    const { stdout } = await execFileAsync('powershell.exe', [
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        command
    ], {
        maxBuffer: 1024 * 1024
    });

    return JSON.parse(stdout);
}

function escapePowerShellString(value) {
    return String(value).replace(/'/g, "''");
}

main().catch(error => {
    console.error(`[github-stats] ${error.message}`);
    process.exitCode = 1;
});
