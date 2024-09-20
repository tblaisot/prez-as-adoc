const KEY_V = "v";
export function viewMode(config = {modes: ["full", "list"], prefix: "bespoke-"}) {
    return function (deck) {
        function applyMode(current, previous = undefined) {
            if (previous) {
                document.body.classList.remove(config.prefix + previous);
                deck.parent.classList.remove(config.prefix + previous);
            }
            document.body.classList.add(config.prefix + current);
            deck.parent.classList.add(config.prefix + current);
        }

        deck.mode = function (value = undefined) {
            const currentValue = (deck.hash().query || {}).mode || config.modes[0];
            if (value) {
                let mode = value;
                if (value === 'default') {
                    mode = config.modes[0];
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
            const current = config.modes.indexOf(deck.mode());
            deck.mode(config.modes[(current + 1) % config.modes.length]);
        }

        deck.addKeyHandler(KEY_V, () => {
            return cycleViewMode();
        });

        setTimeout(() => {
            applyMode(deck.mode());
            deck.fire('viewmode', {current: deck.mode(), previous: null});
        }, 1)
    };
};
