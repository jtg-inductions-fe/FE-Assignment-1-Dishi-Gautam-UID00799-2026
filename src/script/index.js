import Splide from '@splidejs/splide';
import '@splidejs/splide/css';

import '../styles/main.scss';
import '../script/navigation.js';
import '../script/footer.js';

const splideElement = document.querySelector('.splide');
if (splideElement) {
    var splide = new Splide('.splide', {
        type: 'loop',
        arrows: false,
        pagination: false,
    });

    const prevBtn = document.querySelector('.testimonials__nav-btn--prev');
    const nextBtn = document.querySelector('.testimonials__nav-btn--next');
    const dots = document.querySelectorAll('.testimonials__dot');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => splide.go('<'));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => splide.go('>'));
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => splide.go(index));
    });

    splide.on('move', (newIndex) => {
        dots.forEach((dot, index) => {
            if (index === newIndex) {
                dot.classList.add('testimonials__dot--active');
                dot.setAttribute('aria-selected', 'true');
            } else {
                dot.classList.remove('testimonials__dot--active');
                dot.setAttribute('aria-selected', 'false');
            }
        });
    });

    splide.mount();
}
