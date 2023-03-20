const KEY_V = "v";
export default function (modes) {
    return function (deck) {
        function applyMode(current, previous = undefined) {
            if (previous) {
                document.body.classList.remove(previous);
                deck.parent.classList.remove(previous);
            }
            document.body.classList.add(current);
            deck.parent.classList.add(current);
        }

        deck.mode = function (value = undefined) {
            const currentValue = (deck.hash().query || {}).mode || modes[0];
            if (value) {
                let mode = value;
                if (value === 'default') {
                    mode = modes[0];
                    deck.hash({query: {mode: null}});
                } else {
                    deck.hash({query: {mode: value}});
                }
                applyMode(mode, currentValue)
                deck.fire('viewmode', {current: mode, previous: currentValue});
            }
            return currentValue;
        }

        deck.toogleMode = function (value) {
            if (deck.mode() === value) {
                deck.mode('default');
            } else {
                deck.mode(value)
            }
        }

        function cycleViewMode() {
            const current = modes.indexOf(deck.mode());
            deck.mode(modes[(current + 1) % modes.length]);
        }

        deck.addKeyHandler(KEY_V, () => {
            return cycleViewMode();
        });

        setTimeout(()=>{
            applyMode(deck.mode());
            deck.fire('viewmode', {current: deck.mode(), previous: null});
        },1)
    };
};
