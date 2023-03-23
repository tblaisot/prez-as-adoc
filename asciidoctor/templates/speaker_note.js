const {$} = require("@tblaisot/asciidoctorjs-templates-js/helpers");

module.exports = function ({node}) {
    return $('aside',
        {
            id: node.getId(),
            class: ['speaker-notes'],
        },
        node.getBlocks().map(block => block.convert()).join('\n')
    )
}
