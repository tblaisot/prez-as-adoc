// FIXME: extaire les classes css du parent de la config ?
const NAMESPACE = "bespoke-speaker"
const config = {
    parent: 'deck',
    slides: 'slide',
    slideWidth: 1024,
    slideHeight: 768
}

function init() {
    startClock();
    connect();
    window.addEventListener('message', onMessage);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', updateDisplay);
    // console.log(window.opener.document)
}

function connect() {
    sendMessage('REGISTER', {})
}

function sendMessage(type, data) {
    window.opener.postMessage(
        JSON.stringify({
            namespace: NAMESPACE,
            type,
            ...data
        }),
        '*'
    );
}

function onKeyDown(event) {
    const {ctrlKey, shiftKey, altKey, metaKey, key} = event;
    sendMessage('KEYDOWN', {ctrlKey, shiftKey, altKey, metaKey, key})
}

function onMessage(e) {
    let data = null
    try {
        data = JSON.parse(e.data);
    } catch (e) {
        // console.log("cant parse",typeof e.data, e.data)
        return;//unparsable msg
    }
    if (!data || data.namespace !== NAMESPACE) {
        return;
    }
    // console.log("onMessage", data)
    // const client = e.source;
    switch (data.type) {
        case 'UPDATE':
            updateDisplay();
            break;
        case 'REGISTERED':
            // config = data.config;
            updateDisplay();
            break;
    }
}

function startClock() {

}

function updateDisplay() {
    const currentVignetteParent = document.querySelector('#present');
    const currentVignetteContainer = document.querySelector('#present-container');
    const currentVignette = currentVignetteParent.children[0];

    const nextVignetteParent = document.querySelector('#future');
    const nextVignetteContainer = document.querySelector('#future-container');
    const nextVignette = nextVignetteParent.children[0];

    if (currentVignette) {
        const innerWidth = currentVignetteContainer.offsetWidth;
        const innerHeight = currentVignetteContainer.offsetHeight;
        const offsetWidth = currentVignette.offsetWidth;
        const offsetHeight = currentVignette.offsetHeight;

        const fullScale = 1 / Math.max(offsetWidth / innerWidth, offsetHeight / innerHeight);

        // currentVignetteParent.style.setProperty('--slide-scale', fullScale);
        currentVignetteParent.style.setProperty('--deck-full-scale', fullScale);
    }
    if (nextVignette) {
        const innerWidth = nextVignetteContainer.offsetWidth;
        const innerHeight = nextVignetteContainer.offsetHeight;
        const offsetWidth = nextVignette.offsetWidth;
        const offsetHeight = nextVignette.offsetHeight;

        const fullScale = 1 / Math.max(offsetWidth / innerWidth, offsetHeight / innerHeight);

        // nextVignetteParent.style.setProperty('--slide-scale', fullScale);
        nextVignetteParent.style.setProperty('--deck-full-scale', fullScale);
    }
}

init();
