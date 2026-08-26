const menuButton = document.querySelector('.navbar__menu');
const closeButton = document.querySelector('.navbar__mobile-close');
const navbar = document.querySelector('.navbar');
const mobileMenu = document.querySelector('.navbar__mobile-menu');

if (menuButton && closeButton && navbar && mobileMenu) {
    const toggleMenu = (isOpen) => {
        navbar.classList.toggle('navbar--open', isOpen);

        document.body.classList.toggle(
            'u-overflow-hidden',
            isOpen,
        );

        menuButton.setAttribute(
            'aria-expanded',
            String(isOpen),
        );
    };

    const closeMenu = () => {
        toggleMenu(false);
        menuButton.focus();
    };

    menuButton.addEventListener('click', () => {
        const isOpen = navbar.classList.contains('navbar--open');

        toggleMenu(!isOpen);

        if (!isOpen) {
            closeButton.focus();
        }
    });

    closeButton.addEventListener('click', closeMenu);

    mobileMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
        if (!navbar.classList.contains('navbar--open')) {
            return;
        }

        const elements = [
            closeButton,
            ...mobileMenu.querySelectorAll('a'),
        ];

        const currentIndex = elements.indexOf(
            document.activeElement,
        );

        const menuActions = new Map([
            ['Escape', closeMenu],

            [
                'ArrowDown',
                () => {
                    event.preventDefault();

                    const nextIndex =
                        currentIndex === elements.length - 1
                            ? 0
                            : currentIndex + 1;

                    elements[nextIndex].focus();
                },
            ],

            [
                'ArrowUp',
                () => {
                    event.preventDefault();

                    const previousIndex =
                        currentIndex <= 0
                            ? elements.length - 1
                            : currentIndex - 1;

                    elements[previousIndex].focus();
                },
            ],

            [
                'Home',
                () => {
                    event.preventDefault();
                    elements[0].focus();
                },
            ],

            [
                'End',
                () => {
                    event.preventDefault();
                    elements[elements.length - 1].focus();
                },
            ],
        ]);

        const action = menuActions.get(event.key);

        if (action) {
            event.preventDefault();
            action();
        }
    });
}