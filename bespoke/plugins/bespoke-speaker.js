// import speakerHtmlUrl from '../assets/bespoke-speaker.html?url'
const speakerHtmlUrl = './assets/bespoke-speaker.html'

const NAMESPACE = "bespoke-speaker"

const KEY_S = "s";

export function speaker(config = {notes: "prez-speaker-notes"}) {
    return function (deck) {
        const clients = [];
        let speakerWindow;

        function sendMessage(client, type, data) {
            client.postMessage(
                JSON.stringify({
                    namespace: NAMESPACE,
                    type,
                    ...data
                }),
                '*'
            );
        }

        function openSpeakerView() {
            // console.log("OPEN")
            speakerWindow = window.open(speakerHtmlUrl, 'Speaker View - Notes', 'width=1100,height=700');
            // speakerWindow.document.write(speakerViewHTML);

            if (!speakerWindow) {
                alert('Speaker view popup failed to open. Please make sure popups are allowed and reopen the speaker view.');
                return;
            }
            // updateSpeakerView();
            // updateSpeakerCss();
        }

        function updateSpeakerCss() {
            document.head.querySelectorAll('style').forEach(el => {
                speakerWindow.document.head.prepend(el.cloneNode(true))
            })
            document.head.querySelectorAll('link[rel="stylesheet"][type="text/css"]').forEach(el => {
                speakerWindow.document.head.prepend(el.cloneNode(true))
            })
        }

        function updateSpeakerView() {
            if (!speakerWindow) {
                return;
            }
            const currentSlideIndex = deck.slide();

            const currentVignette = speakerWindow.document.querySelector('#present');
            const nextVignette = speakerWindow.document.querySelector('#future');
            const notes = speakerWindow.document.querySelector('#notes #notes-content');

            // Update previews
            currentVignette.innerHTML = deck.slides[currentSlideIndex]?.outerHTML
            nextVignette.innerHTML = deck.slides[currentSlideIndex + 1]?.outerHTML
            notes.innerHTML = [...deck.slides[currentSlideIndex].querySelectorAll(config.notes)].map(n => n.outerHTML).join('')

            // Notify to update scale
            sendMessage(speakerWindow, 'UPDATE', {})
        }

        function onMessage(e) {
            if (typeof e.data !== "string") {
                return
            }
            let data = null
            try {
                data = JSON.parse(e.data);
            } catch (err) {
                // console.log("cant parse",typeof e.data, e.data)
                return;//unparsable msg
            }
            if (!data || data.namespace !== NAMESPACE) {
                return;
            }
            // console.log("onMessage", data)
            const client = e.source;
            switch (data.type) {
                case 'REGISTER':
                    // console.log("Register")
                    clients.push(client);
                    sendMessage(
                        client,
                        'REGISTERED',
                        {
                            config: config,
                            url: encodeURIComponent(document.title || 'Untitled')
                        }
                    );
                    updateSpeakerView();
                    updateSpeakerCss();
                    break;
                case 'KEYDOWN':
                    document.dispatchEvent(new KeyboardEvent('keydown', data));
                    break;
            }
        }

        deck.on('destroy', function () {
            removeEventListener('message', onMessage, false);
        });
        deck.on('activate', function () {
            updateSpeakerView();
        });
        window.addEventListener('message', onMessage, false);
        deck.addKeyHandler(KEY_S, () => {
            return openSpeakerView();
        });
    };
};
