// Using ES6 import syntax
import hljs from 'highlight.js/lib/core';


function doHighlightAll(){
    document.querySelectorAll('pre.highlight code').forEach((el) => {
        const language = el.getAttribute('data-lang');
        // hljs.highlightElement(el);
        el.innerHTML = hljs.highlight(el.innerHTML, {language}).value
    });
}

export function highlight (config = {}) {
    let alreadyHighlighted = false;
    return function (deck) {
        deck.on('activate', function(event) {
            if(!alreadyHighlighted){
                alreadyHighlighted = true;
                doHighlightAll()
            }
        });
    };
};
