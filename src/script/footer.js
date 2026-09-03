function initFooterAccordion() {
    const columnHeaders = document.querySelectorAll('.footer__column-header');

    columnHeaders.forEach((header) => {
        header.addEventListener('click', () => {
            const column = header.closest('.footer__column');
            if (!column) return;

            const isExpanded = header.getAttribute('aria-expanded') === 'true';

            // Toggle active class on column
            column.classList.toggle('footer__column--active');
            header.setAttribute('aria-expanded', !isExpanded);
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooterAccordion);
} else {
    initFooterAccordion();
}
