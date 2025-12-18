import * as bespoke from "bespoke";
import bullets from "bespoke-bullets";
import multimedia from "bespoke-multimedia";
import extern from "bespoke-extern";
import state from "bespoke-state";
// import classes from "bespoke-classes";

import {
    classes,
    debug,
    editor,
    hash,
    nav,
    progress,
    scale,
    speaker,
    viewMode,
} from "@tblaisot/prez-as-adoc/bespoke/plugins"

const config = {
    parent: '.slides',
    slides: 'section.slide',
    notes: 'aside.speaker-notes'
}
// const config = { parent: 'prez-deck', slides: 'prez-slide', notes: 'prez-speaker-notes' }

// Bespoke.js
bespoke.from(config, [
    classes(),
    nav(),
    scale(config),
    bullets('[data-step], .olist[data-step-items] li, .ulist[data-step-items] li'),
    hash(),
    // overview(),
    multimedia(),
    progress(),
    // extern(bespoke),
    speaker(config),
    debug(),
    state(),
    editor(),
    viewMode(),
    // backdrop()
]);
