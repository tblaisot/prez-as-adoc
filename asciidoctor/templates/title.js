const {HELPERS, TEMPLATES} = require("@tblaisot/asciidoctor-js-templates");
const {$, $h, $a, isDefined, sectionTitle} = HELPERS;

module.exports = function ({node}) {
  let content = '';
  if (isDefined(node.getId())) {
    if (node.document.hasAttribute('sectanchors')) {
      content += $a({class: "anchor", href: `#${node.getId()}`, 'aria-hidden': "true"})
    }
    if (node.document.hasAttribute('sectlinks')) {
      content += $a({class: "link", href: `#${node.getId()}`}, node.getContent())
    } else {
      content += node.getContent()
    }
  } else {
    content += node.getContent()
  }
  return $h({
      level: node.getAttribute('level') + 1,
      id: node.getId()
    },
    content
  );
}
