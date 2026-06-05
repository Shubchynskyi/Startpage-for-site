const GITHUB_STATS_FALLBACK_URL = 'data/github-stats.json';

document.addEventListener('DOMContentLoaded', function() {
    // Theme initialization
    initializeTheme();
    
    // Theme switcher setup
    setupThemeSwitcher();
    
    // Language initialization
    initializeLanguage();
    
    // Language switcher setup
    setupLanguageButtons();
    

    
    // Service availability check
    checkServicesAvailability();

    // GitHub stars badges
    initializeGitHubStars();
});

/**
 * Initializes theme based on localStorage or system preferences
 */
function initializeTheme() {
    // Check saved theme
    const savedTheme = localStorage.getItem('preferred_theme');
    
    if (savedTheme) {
        // Use saved theme
        document.body.classList.toggle('dark-theme', savedTheme === 'dark');
        updateThemeIcon(savedTheme === 'dark');
    } else {
        // Check system preferences
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        
        if (prefersDarkScheme.matches) {
            document.body.classList.add('dark-theme');
            updateThemeIcon(true);
            localStorage.setItem('preferred_theme', 'dark');
        } else {
            localStorage.setItem('preferred_theme', 'light');
        }
    }
}

/**
 * Sets up theme switcher
 */
function setupThemeSwitcher() {
    const themeToggle = document.getElementById('theme-toggle');
    
    themeToggle.addEventListener('click', function() {
        // Toggle dark theme class
        document.body.classList.toggle('dark-theme');
        
        // Determine current theme
        const isDarkTheme = document.body.classList.contains('dark-theme');
        
        // Save preference
        localStorage.setItem('preferred_theme', isDarkTheme ? 'dark' : 'light');
        
        // Update icon
        updateThemeIcon(isDarkTheme);
    });
}

/**
 * Updates theme switcher icon
 * @param {boolean} isDarkTheme - Dark theme flag
 */
function updateThemeIcon(isDarkTheme) {
    const themeIcon = document.getElementById('theme-icon');
    
    if (isDarkTheme) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

/**
 * Initializes interface language based on localStorage, browser language or default value
 */
function initializeLanguage() {
    // Check if user has a saved preference
    let savedLanguage = localStorage.getItem('preferred_language');
    
    // If saved language exists but is not supported, reset it
    if (savedLanguage && !translations[savedLanguage]) {
        savedLanguage = null;
    }
    
    // If no saved language, detect browser language
    if (!savedLanguage) {
        const browserLang = navigator.language || navigator.userLanguage;
        
        // From browserLang (e.g., "en-US") take only the first part (e.g., "en")
        const shortLang = browserLang.split('-')[0];
        
        // If browser language is English, use English
        if (shortLang === 'en') {
            savedLanguage = 'en';
        } else {
            // Otherwise, use German as default
            savedLanguage = 'de';
        }
    }
    
    // Set language
    setLanguage(savedLanguage);
}

/**
 * Sets interface language and updates all translatable elements
 * @param {string} lang - Language code
 */
function setLanguage(lang) {
    // Check if translations exist for selected language
    if (!translations[lang]) {
        console.error(`Translations for language "${lang}" not found. Using default language.`);
        // Use German as default if language is not supported
        lang = 'de';
    }
    
    // Save user preference
    localStorage.setItem('preferred_language', lang);
    
    // Update current language display in switcher
    updateLanguageSwitcherDisplay(lang);
    
    // Update all translatable elements
    const elements = document.querySelectorAll('[data-lang-key]');
    elements.forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Update lang attribute in html tag
    document.documentElement.lang = lang;
    
    // Update name title based on language
    updateNameTitle(lang);
}

/**
 * Updates name display in header based on selected language
 * @param {string} lang - Language code
 */
function updateNameTitle(lang) {
    const nameMap = {
        'en': 'Dmytro Shubchynskyi',
        'de': 'Dmytro Shubchynskyi'
    };
    
    const nameElement = document.querySelector('.profile h1');
    if (nameElement && nameMap[lang]) {
        nameElement.textContent = nameMap[lang];
    }
}

/**
 * Updates current language display in switcher
 * @param {string} lang - Language code
 */
function updateLanguageSwitcherDisplay(lang) {
    const currentLang = document.getElementById('current-lang');
    const langNameMap = {
        'en': 'EN',
        'de': 'DE'
    };
    
    if (currentLang && langNameMap[lang]) {
        currentLang.querySelector('span').textContent = langNameMap[lang];
    }
}

/**
 * Sets up language dropdown
 */
function setupLanguageButtons() {
    const currentLang = document.getElementById('current-lang');
    const options = document.querySelectorAll('.lang-option');
    
    // Handle current language click
    currentLang.addEventListener('click', function(e) {
        e.stopPropagation();
        const options = document.querySelector('.lang-options');
        options.style.display = options.style.display === 'block' ? 'none' : 'block';
    });
    
    // Handle language selection
    options.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
            
            // Close dropdown
            document.querySelector('.lang-options').style.display = 'none';
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.language-dropdown')) {
            document.querySelector('.lang-options').style.display = 'none';
        }
    });
}


/**
 * Initializes GitHub star badges with site fallback values and live refresh.
 */
function initializeGitHubStars() {
    const badges = Array.from(document.querySelectorAll('[data-github-stars-repo]'));
    if (badges.length === 0) return;

    loadGitHubStatsFallback()
        .then(fallbackStats => {
            badges.forEach(badge => {
                const repo = badge.getAttribute('data-github-stars-repo');
                if (!repo) return;

                const fallbackCount = getFallbackGitHubStars(fallbackStats, repo);
                if (Number.isFinite(fallbackCount)) {
                    renderGitHubStarsBadge(badge, fallbackCount);
                }

                fetchGitHubStars(repo)
                    .then(count => renderGitHubStarsBadge(badge, count))
                    .catch(() => {
                        if (Number.isFinite(fallbackCount)) {
                            renderGitHubStarsBadge(badge, fallbackCount);
                        }
                    });
            });
        });
}

/**
 * Fetches star count for a public GitHub repository.
 * @param {string} repo - GitHub repository in owner/name format
 * @returns {Promise<number>} - Repository star count
 */
function fetchGitHubStars(repo) {
    return fetch(`https://api.github.com/repos/${repo}`, {
        cache: 'no-store',
        headers: {
            Accept: 'application/vnd.github+json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`GitHub API returned ${response.status}`);
            }

            return response.json();
        })
        .then(data => {
            const count = data.stargazers_count;
            if (!Number.isFinite(count)) {
                throw new Error('GitHub API response did not include stargazers_count');
            }

            return count;
        });
}

/**
 * Loads site-level fallback GitHub stats.
 * @returns {Promise<object|null>} - Fallback stats from the deployed site
 */
function loadGitHubStatsFallback() {
    return fetch(GITHUB_STATS_FALLBACK_URL, { cache: 'no-store' })
        .then(response => {
            if (!response.ok) {
                return null;
            }

            return response.json();
        })
        .catch(() => null);
}

/**
 * Reads a repository star count from site-level fallback stats.
 * @param {object|null} fallbackStats - Fallback stats from the deployed site
 * @param {string} repo - GitHub repository in owner/name format
 * @returns {number|null} - Fallback star count
 */
function getFallbackGitHubStars(fallbackStats, repo) {
    if (!fallbackStats || !fallbackStats.repositories || !fallbackStats.repositories[repo]) {
        return null;
    }

    const count = fallbackStats.repositories[repo].stars;
    if (!Number.isFinite(count)) {
        return null;
    }

    return count;
}

/**
 * Updates a GitHub stars badge in the project card.
 * @param {HTMLElement} badge - Badge element
 * @param {number} count - Repository star count
 */
function renderGitHubStarsBadge(badge, count) {
    const valueElement = badge.querySelector('[data-github-stars-value]');
    if (!valueElement || !Number.isFinite(count)) return;

    valueElement.textContent = formatStarCount(count);
    badge.hidden = false;
    badge.setAttribute('title', `${count} GitHub stars`);
}

/**
 * Formats star count for display.
 * @param {number} count - Repository star count
 * @returns {string} - Formatted star count
 */
function formatStarCount(count) {
    return new Intl.NumberFormat(document.documentElement.lang || 'en').format(count);
}


/**
 * Checks availability of all services and updates status indicators
 */
function checkServicesAvailability() {
    const statusIndicators = document.querySelectorAll('.status-indicator');
    
    statusIndicators.forEach(indicator => {
        // Set "loading" state for indicator
        indicator.classList.add('loading');
        
        const url = indicator.getAttribute('data-url');
        if (!url) return;
        
        // Check service availability
        checkServiceStatus(url)
            .then(isAvailable => {
                // Remove loading state
                indicator.classList.remove('loading');
                
                // Set appropriate class
                if (isAvailable) {
                    indicator.classList.add('online');
                    indicator.setAttribute('title', 'Service is available');
                } else {
                    indicator.classList.add('offline');
                    indicator.setAttribute('title', 'Service is unavailable');
                }
            });
    });
}

/**
 * Checks service availability at specified URL
 * @param {string} url - Service URL to check
 * @returns {Promise<boolean>} - Promise that resolves to true if service is available, false otherwise
 */
function checkServiceStatus(url) {
    return new Promise(resolve => {
        const img = new Image();
        const timeout = setTimeout(() => {
            img.onload = img.onerror = null;
            resolve(false);
        }, 5000); // 5 second timeout
        
        img.onload = function() {
            clearTimeout(timeout);
            resolve(true);
        };
        
        img.onerror = function() {
            clearTimeout(timeout);
            
            // Use fetch as fallback since img.onerror may trigger due to CORS
            fetch(url, { mode: 'no-cors', cache: 'no-store' })
                .then(() => resolve(true))
                .catch(() => resolve(false));
        };
        
        // Add timestamp to prevent caching
        img.src = `${url}favicon.ico?t=${new Date().getTime()}`;
    });
}

// Periodically check service availability
setInterval(checkServicesAvailability, 60000); // Check every minute 
