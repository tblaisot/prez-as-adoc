export function bullets(options) {
    return function (deck) {
        let activeSlideIndex;
        let activeBulletIndex;

        let bullets = deck.slides.map(function (slide) {
            return [].slice.call(slide.querySelectorAll((typeof options === 'string' ? options : '[data-bespoke-bullet]')), 0);
        });

        function next() {
            const nextSlideIndex = activeSlideIndex + 1;

            if (activeSlideHasBulletByOffset(1)) {
                activateBullet(activeSlideIndex, activeBulletIndex + 1);
                return false;
            } else if (bullets[nextSlideIndex]) {
                activateBullet(nextSlideIndex, 0);
            }
        }

        function prev() {
            const prevSlideIndex = activeSlideIndex - 1;

            if (activeSlideHasBulletByOffset(-1)) {
                activateBullet(activeSlideIndex, activeBulletIndex - 1);
                return false;
            } else if (bullets[prevSlideIndex]) {
                activateBullet(prevSlideIndex, bullets[prevSlideIndex].length);
            }
        }

        function activateBullet(slideIndex, bulletIndex) {
            activeSlideIndex = slideIndex;
            activeBulletIndex = bulletIndex;

            bullets.forEach(function (slide, s) {
                slide.forEach(function (bullet, b) {
                    bullet.classList.add('bespoke-bullet');

                    if (s < activeSlideIndex || s === slideIndex && (b+1) <= activeBulletIndex) {
                        bullet.classList.add('bespoke-bullet-active');
                        bullet.classList.remove('bespoke-bullet-inactive');
                    } else {
                        bullet.classList.add('bespoke-bullet-inactive');
                        bullet.classList.remove('bespoke-bullet-active');
                    }

                    if (s === activeSlideIndex && (b+1) === activeBulletIndex) {
                        bullet.classList.add('bespoke-bullet-current');
                    } else {
                        bullet.classList.remove('bespoke-bullet-current');
                    }
                });
            });
        }

        function activeSlideHasBulletByOffset(offset) {
            return bullets[activeSlideIndex]
                && bullets[activeSlideIndex].length > 0
                && (activeBulletIndex + offset <= bullets[activeSlideIndex].length)
                && (activeBulletIndex + offset >= 0);
        }

        deck.on('next', next);
        deck.on('prev', prev);

        deck.on('slide', function (e) {
            activateBullet(e.index, 0);
        });

        activateBullet(0, 0);
    };
}
