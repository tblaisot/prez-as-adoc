const KEY_V = "v";
const MODES = ['full', 'list'];
export default function () {
    return function (deck) {
        function cycleViewMode(){
            for(let i =0; i<MODES.length; i++){
                if(deck.parent.classList.contains(MODES[i])){
                    deck.parent.classList.remove(MODES[i])
                    deck.parent.classList.add(MODES[(i+1)%MODES.length])
                    return;
                }
            }
        }

        deck.parent.classList.add(MODES[0]);
        deck.addKeyHandler(KEY_V, () => {
            return cycleViewMode();
        });

    };
};
