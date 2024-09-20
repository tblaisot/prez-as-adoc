export function classesNoBespoke () {
    return function (deck) {
        function addClass(el, cls) {
            el.classList.add(cls);
        }

        function removeClass(el, cls) {
            el.className = el.className
                .replace(new RegExp('(\\s|^)' +cls + '(\\s|$)', 'g'), ' ')
                .trim();
        }

        function deactivate(el, index) {
            const activeSlide = deck.slides[deck.slide()];
            const offset = index - deck.slide();
            const offsetClass = offset > 0 ? 'after' : 'before';

            // removeClass(el, 'before(-\\d+)?');
            // removeClass(el, 'after(-\\d+)?');
            removeClass(el, 'active');
            removeClass(el, 'inactive');
            removeClass(el, 'before');
            removeClass(el, 'after');

            if (el !== activeSlide) {
                addClass(el, 'inactive');
                addClass(el, offsetClass);
                // addClass(el, 'slide-' + offsetClass);
                // addClass(el, 'slide-' + offsetClass + '-' + Math.abs(offset));
            }
        }

        addClass(deck.parent, 'parent');
        // deck.slides.map(function (el) {
        //     addClass(el, 'slide');
        // });

        deck.on('activate', function (e) {
            deck.slides.map(deactivate);
            addClass(e.slide, 'active');
            removeClass(e.slide, 'inactive');
        });
    };
};
