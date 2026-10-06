// PulsePower - Interactive Scripts & i18n Controller

// WebApp entry points (US15). Update WEBAPP_URL and the paths when the WebApp is deployed.
var WEBAPP_URL = 'https://upc-pre-202620-1asi0729-7737-sportplus.github.io/pulsepower-website/';
var WEBAPP_PATHS = {
    'sign-in': '',   // e.g. 'sign-in'
    'register': ''   // e.g. 'sign-up'
};
var currentBilling = 'monthly';

var SUPPORTED_LANGS = ['en', 'es'];

// Language priority: ?lang= in the URL, then the saved preference, then English (default)
function getInitialLang() {
    var urlLang = new URLSearchParams(window.location.search).get('lang');
    if (SUPPORTED_LANGS.indexOf(urlLang) !== -1) {
        localStorage.setItem('pulsepower-lang', urlLang);
        return urlLang;
    }
    var savedLang = localStorage.getItem('pulsepower-lang');
    return SUPPORTED_LANGS.indexOf(savedLang) !== -1 ? savedLang : 'en';
}

let currentLang = getInitialLang();

// Flatten nested object: { "nav": { "home": "Inicio" } } -> { "nav.home": "Inicio" }
function flattenTranslations(obj, prefix) {
    prefix = prefix || '';
    return Object.keys(obj).reduce(function (acc, key) {
        var fullKey = prefix ? prefix + '.' + key : key;
        if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            Object.assign(acc, flattenTranslations(obj[key], fullKey));
        } else {
            acc[fullKey] = obj[key];
        }
        return acc;
    }, {});
}


// Build WebApp links that keep the visitor's language (and plan / segment when present)
function buildWebAppUrl(target, lang, extraParams) {
    var url = new URL(WEBAPP_PATHS[target] || '', WEBAPP_URL);
    url.searchParams.set('lang', lang);
    Object.keys(extraParams).forEach(function (key) {
        url.searchParams.set(key, extraParams[key]);
    });
    return url.toString();
}

function updateWebAppLinks(lang) {
    document.querySelectorAll('[data-webapp]').forEach(function (link) {
        var params = {};
        if (link.dataset.plan) {
            params.plan = link.dataset.plan;
            params.billing = currentBilling;
        }
        if (link.dataset.segment) {
            params.segment = link.dataset.segment;
        }
        link.href = buildWebAppUrl(link.dataset.webapp, lang, params);
    });
}

function applyTranslations(lang) {
    var source = lang === 'en' ? translationsEN : translationsES;
    var flat = flattenTranslations(source);

    // Apply to [data-i18n]
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var key = el.getAttribute('data-i18n');
        if (flat[key] === undefined) return;

        // Handle elements with children
        var hasChildElements = el.children.length > 0;
        if (hasChildElements) {
            var textNode = null;
            for (var i = 0; i < el.childNodes.length; i++) {
                if (el.childNodes[i].nodeType === Node.TEXT_NODE && el.childNodes[i].nodeValue.trim().length > 0) {
                    textNode = el.childNodes[i];
                    break;
                }
            }
            if (textNode) {
                textNode.nodeValue = flat[key];
            } else {
                el.insertBefore(document.createTextNode(flat[key]), el.firstChild);
            }
        } else {
            el.textContent = flat[key];
        }
    });

    // Apply to translatable attributes: [data-i18n-alt], [data-i18n-aria-label], [data-i18n-content]
    [['data-i18n-alt', 'alt'], ['data-i18n-aria-label', 'aria-label'], ['data-i18n-content', 'content']].forEach(function (pair) {
        document.querySelectorAll('[' + pair[0] + ']').forEach(function (el) {
            var key = el.getAttribute(pair[0]);
            if (flat[key] !== undefined) {
                el.setAttribute(pair[1], flat[key]);
            }
        });
    });

    // Apply to [data-i18n-placeholder]
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
        var key = el.getAttribute('data-i18n-placeholder');
        if (flat[key] !== undefined) {
            el.placeholder = flat[key];
        }
    });

    // Apply to [data-i18n-html]
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
        var key = el.getAttribute('data-i18n-html');
        if (flat[key] !== undefined) {
            el.innerHTML = flat[key];
        }
    });

    // Synchronize Navbar toggle
    var navSwitch = document.querySelector('.navbar-lang-switch');
    if (navSwitch) {
        var enOption = navSwitch.querySelector('.lang-opt[data-lang="en"]');
        var esOption = navSwitch.querySelector('.lang-opt[data-lang="es"]');
        var thumb = navSwitch.querySelector('.switch-thumb');

        if (enOption && esOption) {
            enOption.classList.toggle('active', lang === 'en');
            esOption.classList.toggle('active', lang === 'es');
        }
        if (thumb) {
            if (lang === 'es') {
                thumb.style.transform = 'translateX(28px)';
            } else {
                thumb.style.transform = 'translateX(0px)';
            }
        }
    }

    // Synchronize Floating switcher
    document.querySelectorAll('.floating-lang-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Keep WebApp links in sync with the selected language
    updateWebAppLinks(lang);

    // Hamburger button label follows the menu state
    var menuButton = document.getElementById('menu-btn');
    if (menuButton) {
        var isOpen = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-label', flat[isOpen ? 'nav.closeMenu' : 'nav.openMenu']);
    }

    // Update HTML lang attribute
    document.documentElement.lang = lang;
}

document.addEventListener('DOMContentLoaded', function () {
    // Initialize translations
    applyTranslations(currentLang);

    // Navbar Language Toggle Click
    var navSwitch = document.querySelector('.navbar-lang-switch');
    if (navSwitch) {
        navSwitch.addEventListener('click', function (e) {
            var opt = e.target.closest('.lang-opt');
            if (opt && opt.dataset.lang) {
                currentLang = opt.dataset.lang;
            } else {
                // Toggle if clicked on track
                currentLang = currentLang === 'en' ? 'es' : 'en';
            }
            localStorage.setItem('pulsepower-lang', currentLang);
            applyTranslations(currentLang);
        });
    }

    // Floating Language Switcher
    document.querySelectorAll('.floating-lang-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            currentLang = btn.dataset.lang;
            localStorage.setItem('pulsepower-lang', currentLang);
            applyTranslations(currentLang);
        });
    });

    // Mobile Navigation Menu Toggle
    var menuBtn = document.getElementById('menu-btn');
    var navbar = document.querySelector('.header .nav-links');
    if (menuBtn && navbar) {
        var setMenuOpen = function (isOpen) {
            navbar.classList.toggle('active', isOpen);
            menuBtn.classList.toggle('fa-times', isOpen);
            menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            applyTranslations(currentLang);
        };

        menuBtn.addEventListener('click', function () {
            setMenuOpen(!navbar.classList.contains('active'));
        });

        navbar.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                setMenuOpen(false);
            });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navbar.classList.contains('active')) {
                setMenuOpen(false);
                menuBtn.focus();
            }
        });
    }

    // Header background on scroll
    var header = document.querySelector('.header');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Features Accordion (one item open at a time)
    var serviceCards = document.querySelectorAll('.service-accordion-card');

    function setCardOpen(card, isOpen) {
        card.classList.toggle('active', isOpen);
        var trigger = card.querySelector('.service-card-header');
        if (trigger) {
            trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }
    }

    serviceCards.forEach(function (card) {
        card.addEventListener('click', function () {
            var isAlreadyActive = card.classList.contains('active');
            serviceCards.forEach(function (c) { setCardOpen(c, false); });
            if (!isAlreadyActive) {
                setCardOpen(card, true);
            }
        });
    });
    // Default first active
    if (serviceCards.length > 0) {
        setCardOpen(serviceCards[0], true);
    }

    // Video Section Tabs
    var videoTabs = document.querySelectorAll('.video-feature-tab');
    var videoTabContent = document.getElementById('video-feature-desc');
    var videoIframe = document.getElementById('pulsepower-video-frame');

    var videoEmbeds = {
        "tab1": "https://www.youtube.com/embed/5qap5aO4i9A?si=pulsepower",
        "tab2": "https://www.youtube.com/embed/vu7Rlkn2lEc?si=pulsepower",
        "tab3": "https://www.youtube.com/embed/LpOAo21-778?si=pulsepower",
        "tab4": "https://www.youtube.com/embed/jNQXAC9IVRw?si=pulsepower"
    };

    videoTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            videoTabs.forEach(function (t) {
                t.classList.remove('active');
                t.setAttribute('aria-pressed', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-pressed', 'true');

            var tabKey = tab.dataset.tab;
            if (videoIframe && videoEmbeds[tabKey]) {
                videoIframe.src = videoEmbeds[tabKey];
            }

            if (videoTabContent) {
                var transKey = 'videoSection.' + tabKey + 'Desc';
                videoTabContent.setAttribute('data-i18n', transKey);
                applyTranslations(currentLang);
            }
        });
    });

    // Benefits by Segment Toggle (Athletes / Wellness Seekers)
    var segmentTabs = Array.prototype.slice.call(document.querySelectorAll('.segment-toggle-btn'));

    function selectSegment(selectedTab, moveFocus) {
        segmentTabs.forEach(function (tab) {
            var isSelected = tab === selectedTab;
            tab.classList.toggle('active', isSelected);
            tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
            tab.setAttribute('tabindex', isSelected ? '0' : '-1');
            var panel = document.getElementById(tab.getAttribute('aria-controls'));
            if (panel) {
                panel.hidden = !isSelected;
            }
        });
        if (moveFocus) {
            selectedTab.focus();
        }
    }

    segmentTabs.forEach(function (tab, index) {
        tab.addEventListener('click', function () {
            selectSegment(tab, false);
        });
        tab.addEventListener('keydown', function (e) {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            e.preventDefault();
            var step = e.key === 'ArrowRight' ? 1 : -1;
            var next = segmentTabs[(index + step + segmentTabs.length) % segmentTabs.length];
            selectSegment(next, true);
        });
    });

    // Pricing Plans Toggle (Monthly / Annual)
    var planToggles = document.querySelectorAll('.plan-toggle-btn');
    var monthlyPrices = document.querySelectorAll('.price-monthly');
    var annualPrices = document.querySelectorAll('.price-annual');
    var saveBadges = document.querySelectorAll('.annual-save-badge');

    planToggles.forEach(function (btn) {
        btn.addEventListener('click', function () {
            planToggles.forEach(function (b) {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            var mode = btn.dataset.plan;
            currentBilling = mode;
            updateWebAppLinks(currentLang);
            if (mode === 'monthly') {
                monthlyPrices.forEach(function (el) { el.style.display = 'inline-block'; });
                annualPrices.forEach(function (el) { el.style.display = 'none'; });
                saveBadges.forEach(function (el) { el.style.display = 'none'; });
            } else {
                monthlyPrices.forEach(function (el) { el.style.display = 'none'; });
                annualPrices.forEach(function (el) { el.style.display = 'inline-block'; });
                saveBadges.forEach(function (el) { el.style.display = 'inline-block'; });
            }
        });
    });
});