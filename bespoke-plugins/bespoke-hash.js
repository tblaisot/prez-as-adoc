export default function () {
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

        function navigateToSlide() {
            const hash = deck.hash().main;
            const slideNumberOrName = parseInt(hash, 10);

            if (hash) {
                if (slideNumberOrName) {
                    activateSlide(slideNumberOrName - 1);
                } else {
                    deck.slides.forEach(function (slide, i) {
                        if (slide.getAttribute('data-bespoke-hash') === hash || slide.id === hash) {
                            activateSlide(i);
                        }
                    });
                }
            }
        }

        setTimeout(() => {

            deck.on('activate', (e) => {
                const slideName = e.slide.getAttribute('data-bespoke-hash') || e.slide.id;
                // window.location.hash = slideName || e.index + 1;
                deck.hash({main: (slideName || e.index + 1)})
            });

            deck.on('hashchange', navigateToSlide)
            parseHash();
            window.addEventListener('hashchange', parseHash);
        }, 0);
    };
};
