export function progress(options = {}) {
    return function (deck) {
        const parent = deck.parent;

        const updateProgress = (index) => {
            const {length} = deck.slides;
            const progress = (index / (length - 1)) * 100;
            parent.style.setProperty('--deck-progress-percentage', `${progress}%`);
            parent.style.setProperty('--deck-slide-index', `${index + 1}`);
            parent.style.setProperty('--deck-slides-count', `${length}`);
        };

        deck.on('activate', function (e) {
            updateProgress(e.index);
        });
        updateProgress(deck.slide());
    };
};
