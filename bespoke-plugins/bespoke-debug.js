
const KEY_D = "d";
const DEBUG_CLASS='debug';

export default function () {
    return function (deck) {

        function debugOverflow(){
            if(deck.parent.classList.contains(DEBUG_CLASS)) {
                const currentSlide = deck.slides[deck.slide()];
                Array.from(currentSlide.children).forEach(el => {
                    if (el.scrollHeight > currentSlide.clientHeight) {
                        deck.parent.classList.add("overflowing");
                    } else {
                        deck.parent.classList.remove("overflowing");
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
