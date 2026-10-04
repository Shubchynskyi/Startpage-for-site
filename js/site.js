(function () {
    'use strict';

    var THEME_KEY = 'theme';
    var LANG_KEY = 'lang';
    var STATS_URL = '/data/github-stats.json';
    var root = document.documentElement;

    function store(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch (error) {
            // Storage can be unavailable (private mode, blocked site data); the page still works.
        }
    }

    function effectiveTheme() {
        var explicit = root.getAttribute('data-theme');
        if (explicit === 'light' || explicit === 'dark') return explicit;
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function setupThemeToggle() {
        var buttons = document.querySelectorAll('[data-theme-toggle]');
        Array.prototype.forEach.call(buttons, function (button) {
            button.addEventListener('click', function () {
                var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
                root.setAttribute('data-theme', next);
                store(THEME_KEY, next);
            });
        });
    }

    function setupLanguageLinks() {
        var links = document.querySelectorAll('[data-lang-link]');
        Array.prototype.forEach.call(links, function (link) {
            link.addEventListener('click', function () {
                store(LANG_KEY, link.getAttribute('data-lang-link'));
            });
        });
    }

    function setupMenu() {
        var menus = document.querySelectorAll('details.menu');
        Array.prototype.forEach.call(menus, function (menu) {
            menu.addEventListener('click', function (event) {
                if (event.target.closest && event.target.closest('a')) menu.removeAttribute('open');
            });
            document.addEventListener('click', function (event) {
                if (menu.hasAttribute('open') && !menu.contains(event.target)) menu.removeAttribute('open');
            });
            document.addEventListener('keydown', function (event) {
                if (event.key === 'Escape') menu.removeAttribute('open');
            });
        });
    }

    function renderStars(node, count) {
        if (typeof count !== 'number' || !isFinite(count)) return;
        var value = node.querySelector('[data-stars-value]');
        if (value) value.textContent = new Intl.NumberFormat(root.lang || 'en').format(count);
    }

    // Star counts come from data/github-stats.json, which the deploy pipeline refreshes;
    // the page itself makes no third-party requests.
    function setupGitHubStars() {
        var nodes = document.querySelectorAll('[data-github-stars]');
        if (!nodes.length || !window.fetch) return;
        fetch(STATS_URL, { cache: 'no-cache' })
            .then(function (response) { return response.ok ? response.json() : null; })
            .then(function (stats) {
                if (!stats || !stats.repositories) return;
                Array.prototype.forEach.call(nodes, function (node) {
                    var entry = stats.repositories[node.getAttribute('data-github-stars')];
                    if (entry) renderStars(node, entry.stars);
                });
            })
            .catch(function () {});
    }

    setupThemeToggle();
    setupLanguageLinks();
    setupMenu();
    setupGitHubStars();
}());
