export function bullets(options) {
    return function (deck) {
        let activeSlideIndex;
        let activeBulletIndex;
        let _isRestoringFromHash = false;

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
            deck._currentBulletIndex = bulletIndex;

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

            if (!_isRestoringFromHash) {
                deck.fire('bulletactivate', { slideIndex, bulletIndex });
            }
        }

        function activeSlideHasBulletByOffset(offset) {
            return bullets[activeSlideIndex]
                && bullets[activeSlideIndex].length > 0
                && (activeBulletIndex + offset <= bullets[activeSlideIndex].length)
                && (activeBulletIndex + offset >= 0);
        }

        deck.bullet = () => activeBulletIndex;

        deck.on('next', next);
        deck.on('prev', prev);

        deck.on('slide', function (e) {
            if (!deck._navigatingFromHash) {
                activateBullet(e.index, 0);
            } else {
                // Keep activeSlideIndex in sync without resetting bullet or firing event.
                // restorebullet will call activateBullet with the correct bulletIndex.
                activeSlideIndex = e.index;
            }
        });

        deck.on('restorebullet', function (e) {
            const slideBullets = bullets[activeSlideIndex] || [];
            const clampedIndex = Math.min(e.bulletIndex, slideBullets.length);
            _isRestoringFromHash = true;
            activateBullet(activeSlideIndex, clampedIndex);
            _isRestoringFromHash = false;
        });

        activateBullet(0, 0);
    };
}
