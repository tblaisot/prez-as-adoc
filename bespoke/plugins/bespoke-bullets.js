export function bullets(options) {
    return function (deck) {
        let activeSlideIndex;
        let activeBulletIndex;

        const bullets = deck.slides.map(function (slide) {
            return [].slice.call(slide.querySelectorAll((typeof options === 'string' ? options : '[data-bespoke-bullet]')), 0);
        });

        function next() {
            const nextSlideIndex = activeSlideIndex + 1;

            if (activeSlideHasBulletByOffset(1)) {
                deck.fire('bullet', {slideIndex: activeSlideIndex, bulletIndex: activeBulletIndex + 1})
                activateBullet(activeSlideIndex, activeBulletIndex + 1);
                return false;
            } else if (bullets[nextSlideIndex]) {
                activateBullet(nextSlideIndex, 0);
            }
        }

        function prev() {
            const prevSlideIndex = activeSlideIndex - 1;

            if (activeSlideHasBulletByOffset(-1)) {
                deck.fire('bullet', {slideIndex: activeSlideIndex, bulletIndex: activeBulletIndex - 1})
                activateBullet(activeSlideIndex, activeBulletIndex - 1);
                return false;
            } else if (bullets[prevSlideIndex]) {
                activateBullet(prevSlideIndex, bullets[prevSlideIndex].length - 1);
            }
        }

        function activateBullet(slideIndex, bulletIndex) {
            activeSlideIndex = slideIndex;
            activeBulletIndex = bulletIndex;

            bullets.forEach(function (slide, s) {
                slide.forEach(function (bullet, b) {
                    bullet.classList.add('bespoke-bullet');

                    if (s < slideIndex || s === slideIndex && b <= bulletIndex) {
                        bullet.classList.add('bespoke-bullet-active');
                        bullet.classList.remove('bespoke-bullet-inactive');
                    } else {
                        bullet.classList.add('bespoke-bullet-inactive');
                        bullet.classList.remove('bespoke-bullet-active');
                    }

                    if (s === slideIndex && b === bulletIndex) {
                        bullet.classList.add('bespoke-bullet-current');
                    } else {
                        bullet.classList.remove('bespoke-bullet-current');
                    }
                });
            });
        }

        function activeSlideHasBulletByOffset(offset) {
            return bullets[activeSlideIndex][activeBulletIndex + offset] !== undefined;
        }

        deck.on('next', next);
        deck.on('prev', prev);

        deck.on('slide', function (e) {
            activateBullet(e.index, 0);
        });

        activateBullet(0, 0);
    };
}
