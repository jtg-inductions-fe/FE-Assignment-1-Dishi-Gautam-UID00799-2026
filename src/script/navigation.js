const KEYS = {
    ESCAPE: 'Escape',
    ARROW_DOWN: 'ArrowDown',
    ARROW_UP: 'ArrowUp',
    HOME: 'Home',
    END: 'End',
    TAB: 'Tab',
};

const menuButton = document.querySelector('.navbar__menu');
const closeButton = document.querySelector('.navbar__mobile-close');
const navbar = document.querySelector('.navbar');
const mobileMenu = document.querySelector('.navbar__mobile-menu');

const desktopQuery = window.matchMedia('(min-width: 1025px)');

const updateAriaHidden = () => {
    if (!mobileMenu) return;

    if (desktopQuery.matches) {
        mobileMenu.setAttribute('aria-hidden', 'false');
    } else {
        const isOpen = navbar
            ? navbar.classList.contains('navbar--open')
            : false;
        mobileMenu.setAttribute('aria-hidden', String(!isOpen));
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
    updateAriaHidden();
};

const closeMenu = (shouldFocus = true) => {
    toggleMenu(false);
    if (shouldFocus && menuButton) {
        menuButton.focus();
    }
};

const handleKeyboardNav = (event) => {
    if (!navbar || !navbar.classList.contains('navbar--open') || !mobileMenu) {
        return;
    }

    const links = Array.from(mobileMenu.querySelectorAll('a'));
    const actionButtons = Array.from(
        navbar.querySelectorAll('.navbar__actions a, .navbar__actions button'),
    );
    const elements = [closeButton, ...links, ...actionButtons].filter(Boolean);

    if (elements.length === 0) {
        return;
    }

    const currentIndex = elements.indexOf(document.activeElement);

    if (event.key === KEYS.TAB) {
        if (event.shiftKey) {
            if (currentIndex <= 0) {
                event.preventDefault();
                elements[elements.length - 1]?.focus();
            }
        } else {
            if (currentIndex === elements.length - 1 || currentIndex === -1) {
                event.preventDefault();
                elements[0]?.focus();
            }
        }
        return;
    }

    const menuActions = {
        [KEYS.ESCAPE]: () => closeMenu(),

        [KEYS.ARROW_DOWN]: () => {
            event.preventDefault();
            const nextIndex =
                currentIndex === elements.length - 1 ? 0 : currentIndex + 1;
            elements[nextIndex]?.focus();
        },

        [KEYS.ARROW_UP]: () => {
            event.preventDefault();
            const previousIndex =
                currentIndex <= 0 ? elements.length - 1 : currentIndex - 1;
            elements[previousIndex]?.focus();
        },

        [KEYS.HOME]: () => {
            event.preventDefault();
            elements[0]?.focus();
        },

        [KEYS.END]: () => {
            event.preventDefault();
            elements[elements.length - 1]?.focus();
        },
    };

    const action = menuActions[event.key];

    if (typeof action === 'function') {
        action();
    }
};

const setupNavigation = () => {
    if (desktopQuery) {
        desktopQuery.addEventListener('change', updateAriaHidden);
    }
    updateAriaHidden();

    if (menuButton) {
        menuButton.addEventListener('click', () => {
            const isOpen = navbar
                ? navbar.classList.contains('navbar--open')
                : false;
            toggleMenu(!isOpen);

            if (!isOpen) {
                if (closeButton) {
                    closeButton.focus();
                } else if (mobileMenu) {
                    const firstLink = mobileMenu.querySelector('a');
                    firstLink?.focus();
                }
            }
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            closeMenu();
        });
    }

    if (mobileMenu) {
        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                closeMenu(false);
            });
        });
    }

    if (navbar) {
        navbar.querySelectorAll('.navbar__actions a').forEach((link) => {
            link.addEventListener('click', () => {
                if (!desktopQuery.matches) {
                    closeMenu(false);
                }
            });
        });
    }

    document.addEventListener('keydown', handleKeyboardNav);
};

setupNavigation();
