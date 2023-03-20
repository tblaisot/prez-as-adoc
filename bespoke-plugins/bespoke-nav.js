
const KEY_PAGEUP = "PageUp",
    KEY_PAGEDOWN = "PageDown",
    KEY_END = "End",
    KEY_HOME = "Up",
    KEY_LEFT = "ArrowLeft",
    KEY_RIGHT = "ArrowRight",
    KEY_UP = "ArrowUp",
    KEY_DOWN = "ArrowDown";
const KD = 'keydown';


export default function () {
    return function (deck) {
        const handlers = {}

        function modified(e, k) {
            return e.ctrlKey || (e.shiftKey && (k === KEY_HOME || k === KEY_END)) || e.altKey || e.metaKey;
        }

        function addKeyHandler(keys, handler) {
            if (!Array.isArray(keys)) {
                keys = [keys];
            }
            keys.forEach(key => { handlers[key] = handler });
        }
        deck.addKeyHandler = addKeyHandler;

        function onKey(e) {
            // console.log("KEYBOARD", e.key)
            if (!modified(e, e.key)) {
                if (handlers.hasOwnProperty(e.key)) {
                    handlers[e.key]()
                }
            }
        }
        deck.on('destroy', function () { document.removeEventListener(KD, onKey); });
        document.addEventListener(KD, onKey);

        // deck.addKeyHandler(KEY_SP, () => { return (e.shiftKey ? deck.prev : deck.next()); });
        deck.addKeyHandler([KEY_RIGHT, KEY_PAGEDOWN], () => { return deck.next(); });
        deck.addKeyHandler([KEY_LEFT, KEY_PAGEUP], () => { return deck.prev(); });
        deck.addKeyHandler(KEY_HOME, () => { return deck.slide(0); });
        deck.addKeyHandler(KEY_END, () => { return deck.slide(deck.slides.length - 1); });
    };
};
