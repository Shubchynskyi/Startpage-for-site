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

    // On the home page the hero already offers the CV, so the header copy waits
    // until the hero's button scrolls out of view. Pages without a hero keep it visible.
    function setupHeaderCv() {
        var headerCv = document.querySelector('.site-header .cv-button');
        var heroCv = document.querySelector('.hero .button-primary');
        if (!headerCv || !heroCv || !('IntersectionObserver' in window)) return;
        var header = headerCv.closest('.site-header');
        var offset = header.offsetHeight;

        function setHidden(hidden) {
            header.classList.toggle('cv-deferred', hidden);
        }

        var rect = heroCv.getBoundingClientRect();
        setHidden(rect.bottom > offset && rect.top < window.innerHeight);
        window.requestAnimationFrame(function () {
            header.classList.add('cv-animate');
        });
        new IntersectionObserver(function (entries) {
            setHidden(entries[entries.length - 1].isIntersecting);
        }, { rootMargin: '-' + offset + 'px 0px 0px 0px' }).observe(heroCv);
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
    setupHeaderCv();
    setupLanguageLinks();
    setupMenu();
    setupGitHubStars();
}());
