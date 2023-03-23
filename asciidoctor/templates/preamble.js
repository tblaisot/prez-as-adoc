const {HELPERS, TEMPLATES} = require("@tblaisot/asciidoctorjs-templates-js");
const {$section} = HELPERS;

module.exports = function ({node}) {
  return $section({
      id: 'preamble',
      'aria-label': 'Preamble'
    },
    node.getContent()
  );
}
