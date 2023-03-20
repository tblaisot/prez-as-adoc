const {HELPERS, TEMPLATES} = require("@tblaisot/asciidoctor-js-templates");
const {$} = HELPERS;

module.exports = function ({node}) {
  return $('aside',
    {
      id: node.getId(),
      class: ['speaker-notes'],
    },
    node.getBlocks().map(block => block.convert()).join('\n')
  )
}
