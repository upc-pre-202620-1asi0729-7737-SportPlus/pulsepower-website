// PulsePower - Interactive Scripts & i18n Controller

let currentLang = localStorage.getItem('pulsepower-lang') || 'es';

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
        menuBtn.addEventListener('click', function () {
            navbar.classList.toggle('active');
            menuBtn.classList.toggle('fa-times');
        });

        navbar.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navbar.classList.remove('active');
                menuBtn.classList.remove('fa-times');
            });
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

    // Coaching Services Accordion
    var serviceCards = document.querySelectorAll('.service-accordion-card');
    serviceCards.forEach(function (card) {
        card.addEventListener('click', function () {
            var isAlreadyActive = card.classList.contains('active');
            serviceCards.forEach(function (c) { c.classList.remove('active'); });
            if (!isAlreadyActive) {
                card.classList.add('active');
            }
        });
    });
    // Default first active
    if (serviceCards.length > 0) {
        serviceCards[0].classList.add('active');
    }

    // Video Section Tabs
    var videoTabs = document.querySelectorAll('.video-feature-tab');
    var videoTabContent = document.getElementById('video-feature-desc');
    var videoIframe = document.getElementById('pulsepower-video-frame');
