export function hash() {
    return function (deck) {

        let _hash = {main: '', query: {}}

        deck.hash = function (value = undefined) {
            if (value) {
                if (value.main !== undefined) {
                    _hash.main = value.main;
                }
                if (value.query !== undefined) {
                    Object.assign(_hash.query, value.query);
                }
                const searchParams = new URLSearchParams();
                Object.keys(_hash.query).forEach((e) => {
                    if (_hash.query[e] !== null) {
                        searchParams.set(e, _hash.query[e]);
                    }
                });
                let hash = _hash.main || '';
                const query = searchParams.toString();
                if (query.length > 0) {
                    hash += '?';
                    hash += query;
                }
                window.location.hash = hash;
            }
            return _hash;
        }

        function activateSlide(index) {
            const indexToActivate = -1 < index && index < deck.slides.length ? index : 0;
            if (indexToActivate !== deck.slide()) {
                deck.slide(indexToActivate);
            }
        }

        function parseHash() {
            const hash = window.location.hash.slice(1).split('?');
            const main = hash[0];
            let query = {};
            if (hash.length > 1) {
                const searchParams = new URLSearchParams(hash[1]);
                query = Array.from(searchParams.entries()).reduce(
                    (acc, e) => {
                        acc[e[0]] = e[1];
                        return acc;
                    },
                    {}
                );
            }
            _hash = {
                main,
                query
            };
            deck.fire('hashchange', _hash);
        }

        function parseMain(main) {
            const [slidepart, bulletpart] = main.split(',');
            return {
                slidePart: slidepart,
                bulletIndex: bulletpart !== undefined ? parseInt(bulletpart, 10) : 0,
            };
        }

        function navigateToSlide() {
            const { slidePart, bulletIndex } = parseMain(deck.hash().main);
            const slideNumberOrName = parseInt(slidePart, 10);

            if (slidePart) {
                deck._navigatingFromHash = true;
                if (slideNumberOrName) {
                    activateSlide(slideNumberOrName - 1);
                } else {
                    deck.slides.forEach(function (slide, i) {
                        if (slide.getAttribute('data-bespoke-hash') === slidePart || slide.id === slidePart) {
                            activateSlide(i);
                        }
                    });
                }
                deck.fire('restorebullet', { bulletIndex });
                deck._navigatingFromHash = false;
            }
        }

        setTimeout(() => {

            deck.on('bulletactivate', (e) => {
                const slide = deck.slides[e.slideIndex];
                const slideName = slide.getAttribute('data-bespoke-hash') || slide.id;
                const slidePart = slideName || e.slideIndex + 1;
                const hashMain = e.bulletIndex > 0
                    ? `${slidePart},${e.bulletIndex}`
                    : `${slidePart}`;
                deck.hash({ main: hashMain });
            });

            deck.on('hashchange', navigateToSlide);
            parseHash();
            window.addEventListener('hashchange', parseHash);
        }, 0);
    };
};
