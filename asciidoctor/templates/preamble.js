const {HELPERS, TEMPLATES} = require("@tblaisot/asciidoctor-js-templates");
const {$section} = HELPERS;

module.exports = function ({node}) {
  return $section({
      id: 'preamble',
      'aria-label': 'Preamble'
    },
    node.getContent()
  );
}
