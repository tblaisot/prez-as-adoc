const KEY_E = "e";
const EDITOR_CLASS = 'bespoke-editor';

export function editor() {
    return function (deck) {
        let preview;
        let previewContainer;

        function scrollIntoView() {
            const currentSlide = deck.slides[deck.slide()];
            currentSlide.scrollIntoView({block: 'center', inline: 'center'});
        }

        function updateScaleList() {
            const firstSlide = deck.slides[0];
            const innerWidth = deck.parent.offsetWidth;
            const innerHeight = deck.parent.offsetHeight;
            const { offsetWidth, offsetHeight } = firstSlide;

            const listScale = 1 / Math.max(offsetWidth / innerWidth, offsetHeight / innerHeight);

            deck.parent.style.setProperty('--deck-list-scale', listScale);
        }

        function updateScalePreview() {
            const innerWidth = preview.offsetWidth;
            const innerHeight = preview.offsetHeight;
            const {offsetWidth, offsetHeight} = previewContainer.children[0];

            const fullScale = 1 / Math.max(offsetWidth / innerWidth, offsetHeight / innerHeight);

            preview.style.setProperty('--deck-full-scale', fullScale);
        }

        const eventsHandlers = [];

        function bindSlideClick() {
            deck.slides.forEach((slide, index) => {
                eventsHandlers.push(slide.addEventListener('click', () => {
                    deck.slide(index)
                }));
            });
        }

        function unbindSlideClick() {
            deck.slides.forEach((slide, index) => {
                slide.removeEventListener('click', eventsHandlers[index]);
            });
        }

        function mountEditor() {
            deck.parent.classList.add('list')
            preview = document.createElement('div');
            preview.classList.add('preview');
            previewContainer = document.createElement('div');
            previewContainer.classList.add('slides', 'full');
            preview.appendChild(previewContainer);
            document.body.appendChild(preview);
            updatePreview();
            bindSlideClick();
        }

        function unmountEditor() {
            deck.parent.classList.remove('list')
            preview.removeChild(previewContainer);
            previewContainer = null;
            document.body.removeChild(preview);
            preview = null;
            unbindSlideClick();
        }

        function updatePreview() {
            if (previewContainer) {
                previewContainer.innerHTML = deck.slides[deck.slide()]?.outerHTML;
                updateScalePreview();
                updateScaleList();
                scrollIntoView();
            }
        }

        deck.addKeyHandler(KEY_E, () => {
            deck.toogleMode(EDITOR_CLASS);
        });
        deck.on('viewmode', function (e) {
            if (e.current === EDITOR_CLASS) {
                mountEditor();
            } else if (preview) {
                unmountEditor();
            }
        });
        deck.on('activate', function (e) {
            updatePreview()
        });

    };
};
