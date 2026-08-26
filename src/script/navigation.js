const menuButton = document.querySelector('.navbar__menu');
const closeButton = document.querySelector('.mobile-navigation__close');
const mobileNavigation = document.querySelector('#mobile-navigation');

if (menuButton && closeButton && mobileNavigation) {
    const getFocusableElements = () => [
        ...mobileNavigation.querySelectorAll('a[href], button:not([disabled])'),
    ];

    const openMenu = () => {
        mobileNavigation.classList.add('mobile-navigation--open');

        mobileNavigation.setAttribute('aria-hidden', 'false');

        menuButton.setAttribute('aria-expanded', 'true');

        menuButton.setAttribute('aria-label', 'Close navigation menu');

        document.body.classList.add('menu-open');

        closeButton.focus();
    };

    const closeMenu = (returnFocus = true) => {
        mobileNavigation.classList.remove('mobile-navigation--open');

        mobileNavigation.setAttribute('aria-hidden', 'true');

        menuButton.setAttribute('aria-expanded', 'false');

        menuButton.setAttribute('aria-label', 'Open navigation menu');

        document.body.classList.remove('menu-open');

        if (returnFocus) {
            menuButton.focus();
        }
    };

    menuButton.addEventListener('click', () => {
        const isOpen = mobileNavigation.classList.contains(
            'mobile-navigation--open',
        );

        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    closeButton.addEventListener('click', () => {
        closeMenu();
    });

    mobileNavigation.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            closeMenu(false);
        });
    });

    document.addEventListener('keydown', (event) => {
        const isOpen = mobileNavigation.classList.contains(
            'mobile-navigation--open',
        );

        if (!isOpen) {
            return;
        }

        const elements = getFocusableElements();

        if (!elements.length) {
            return;
        }

        const currentIndex = elements.indexOf(document.activeElement);

        if (event.key === 'Escape') {
            event.preventDefault();
            closeMenu();
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();

            const nextIndex =
                currentIndex < elements.length - 1 ? currentIndex + 1 : 0;

            elements[nextIndex].focus();
            return;
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();

            const previousIndex =
                currentIndex > 0 ? currentIndex - 1 : elements.length - 1;

            elements[previousIndex].focus();
            return;
        }

        if (event.key === 'Home') {
            event.preventDefault();
            elements[0].focus();
            return;
        }

        if (event.key === 'End') {
            event.preventDefault();
            elements[elements.length - 1].focus();
            return;
        }

        if (event.key !== 'Tab') {
            return;
        }

        const firstElement = elements[0];
        const lastElement = elements[elements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        }

        if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    });
}
