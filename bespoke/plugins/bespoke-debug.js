
const KEY_D = "d";
const DEBUG_CLASS='debug';

export function debug() {
    return function (deck) {

        function debugOverflow(){
            if(deck.parent.classList.contains(DEBUG_CLASS)) {
                const currentSlide = deck.slides[deck.slide()];
                Array.from(currentSlide.children).forEach(el => {
                    if (el.scrollHeight > currentSlide.clientHeight) {
                        deck.parent.classList.add("bespoke-overflowing");
                    } else {
                        deck.parent.classList.remove("bespoke-overflowing");
                    }
                });
            }
        }
        deck.addKeyHandler(KEY_D, () => {
            deck.parent.classList.toggle(DEBUG_CLASS);
            debugOverflow();
        });

        deck.on('activate', function (e) {
            debugOverflow()
        });

    };
};
