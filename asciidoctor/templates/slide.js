const {resolve} = require("path");
const {readFileSync, existsSync} = require("fs");
const {$, isEmptyString} = require("@tblaisot/asciidoctorjs-templates-js/helpers");

function resolveTemplate(paths, templateName) {
    // find in folders
    for (let path of paths) {
        const templatePath = resolve(path, `${templateName}-slide.html`)
        if (existsSync(templatePath)) {
            return readFileSync(templatePath, {encoding: 'utf-8'});
        }
    }
    throw new Error(`No Match found for template "${templateName}" in folders ${JSON.stringify(this._paths)}`)
}

module.exports = function ({node}) {
    const templateAttrName = node.getAttribute('slide-template-attr', 'template', 'slide-template-attr');
    const defaultTemplate = node.getAttribute('slide-default-template', '', 'slide-default-template');
    const template = node.getAttribute(templateAttrName, defaultTemplate);

    let slideContent = '';
    let notesContent = '';

    const contentNodes = node.getBlocks().filter(n=>n.getContext()!=='speaker_note');
    const speakerNotesNodes = node.getBlocks().filter(n=>n.getContext()==='speaker_note');

    if (isEmptyString(template)) {
        slideContent = node.getBlocks().map(n => n.convert()).join('\n')
    } else {
        slideContent = resolveTemplate(node.document.getAttribute('slide-template-dirs'), template);
        notesContent = speakerNotesNodes.map(n => n.convert()).join('\n');
        const blockBySlot = contentNodes.reduce(
            (acc, n) => {
                const slot = n.getAttribute('slot') || 'default'
                if (!acc[slot]) {
                    acc[slot] = [];
                }
                acc[slot].push(n);
                return acc;
            },
            {});
        // Special slot
        blockBySlot['all'] = contentNodes;
        Object.entries(blockBySlot).forEach(([slotname, blocks]) => {
            const content = $(blocks.map(n => n.convert()));
            slideContent = slideContent.replace(`<!-- slot=${slotname} -->`, content);
        });
    }
    return $('section', {
            class: [
                'slide',
                template,
                node.getRole()
            ]
        },
        slideContent + notesContent
    );
}
