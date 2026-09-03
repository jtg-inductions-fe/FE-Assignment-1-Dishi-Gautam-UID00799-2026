const KEYS = {
    ESCAPE: 'Escape',
    ARROW_DOWN: 'ArrowDown',
    ARROW_UP: 'ArrowUp',
    HOME: 'Home',
    END: 'End',
    TAB: 'Tab',
};

const menuButton = document.querySelector('.navbar__menu-btn');
const closeButton = document.querySelector('.navbar__menu-close-btn');
const navbar = document.querySelector('.navbar');
const menuDrawer = document.querySelector('.navbar__menu-drawer');
const logo = document.querySelector('.navbar__logo');
const desktopQuery = window.matchMedia('(min-width: 1025px)');

const updateDomOrder = () => {
    if (!navbar || !logo || !menuButton) return;

    if (window.innerWidth <= 768) {
        if (navbar.firstElementChild !== logo) {
            navbar.insertBefore(logo, menuButton);
        }
    } else if (window.innerWidth <= 1024) {
        if (navbar.firstElementChild !== menuButton) {
            navbar.insertBefore(menuButton, logo);
        }
    } else {
        if (navbar.firstElementChild !== logo) {
            navbar.insertBefore(logo, menuButton);
        }
    }
};

let cachedFocusableElements = [];

const getFocusableElements = () => {
    if (!menuDrawer) return [];
    const FOCUSABLE_SELECTOR =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(menuDrawer.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) =>
            !el.hasAttribute('disabled') &&
            el.getAttribute('aria-hidden') !== 'true',
    );
};

const updateAriaHidden = () => {
    if (!menuDrawer) return;

    if (desktopQuery.matches) {
        menuDrawer.setAttribute('aria-hidden', 'false');
    } else {
        const isOpen = navbar
            ? navbar.classList.contains('navbar--open')
            : false;
        menuDrawer.setAttribute('aria-hidden', String(!isOpen));
    }
};

const handleKeyboardNav = (event) => {
    if (!cachedFocusableElements.length) return;

    const currentIndex = cachedFocusableElements.indexOf(
        document.activeElement,
    );

    if (event.key === KEYS.TAB) {
        if (event.shiftKey) {
            if (currentIndex <= 0) {
                event.preventDefault();
                cachedFocusableElements[
                    cachedFocusableElements.length - 1
                ]?.focus();
            }
        } else {
            if (
                currentIndex === cachedFocusableElements.length - 1 ||
                currentIndex === -1
            ) {
                event.preventDefault();
                cachedFocusableElements[0]?.focus();
            }
        }
        return;
    }

    const menuActions = {
        [KEYS.ESCAPE]: () => closeMenu(),

        [KEYS.ARROW_DOWN]: () => {
            event.preventDefault();
            const nextIndex =
                currentIndex === cachedFocusableElements.length - 1
                    ? 0
                    : currentIndex + 1;
            cachedFocusableElements[nextIndex]?.focus();
        },

        [KEYS.ARROW_UP]: () => {
            event.preventDefault();
            const previousIndex =
                currentIndex <= 0
                    ? cachedFocusableElements.length - 1
                    : currentIndex - 1;
            cachedFocusableElements[previousIndex]?.focus();
        },

        [KEYS.HOME]: () => {
            event.preventDefault();
            cachedFocusableElements[0]?.focus();
        },

        [KEYS.END]: () => {
            event.preventDefault();
            cachedFocusableElements[
                cachedFocusableElements.length - 1
            ]?.focus();
        },
    };

    const action = menuActions[event.key];

    if (typeof action === 'function') {
        action();
    }
};

const toggleMenu = (isOpen) => {
    if (navbar) {
        navbar.classList.toggle('navbar--open', isOpen);
    }
    if (document.body) {
        document.body.classList.toggle('u-overflow-hidden', isOpen);
    }
    if (menuButton) {
        menuButton.setAttribute('aria-expanded', String(isOpen));
    }

    if (isOpen) {
        cachedFocusableElements = getFocusableElements();
        document.addEventListener('keydown', handleKeyboardNav);
    } else {
        cachedFocusableElements = [];
        document.removeEventListener('keydown', handleKeyboardNav);
    }

    updateAriaHidden();
};

const closeMenu = (shouldFocus = true) => {
    toggleMenu(false);
    if (shouldFocus && menuButton) {
        menuButton.focus();
    }
};

const setupNavigation = () => {
    desktopQuery.addEventListener('change', (e) => {
        if (e.matches) {
            closeMenu(false);
        }
        updateAriaHidden();
        updateDomOrder();
    });
    window.addEventListener('resize', updateDomOrder);
    updateAriaHidden();
    updateDomOrder();

    if (menuButton) {
        menuButton.addEventListener('click', () => {
            const isOpen = navbar
                ? navbar.classList.contains('navbar--open')
                : false;
            toggleMenu(!isOpen);

            if (!isOpen) {
                if (closeButton) {
                    closeButton.focus();
                } else if (cachedFocusableElements.length > 0) {
                    cachedFocusableElements[0].focus();
                }
            }
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            closeMenu();
        });
    }

    if (menuDrawer) {
        menuDrawer.querySelectorAll('a, button').forEach((element) => {
            if (element !== closeButton) {
                element.addEventListener('click', () => {
                    if (!desktopQuery.matches) {
                        closeMenu(false);
                    }
                });
            }
        });
    }
};

setupNavigation();
