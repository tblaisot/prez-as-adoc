const {$h, $a, $section, sectionTitle, isDefined} = require("@tblaisot/asciidoctorjs-templates-js/helpers");

module.exports = function ({node}) {
    let content = '';
    if (isDefined(node.getId())) {
        if (node.document.hasAttribute('sectanchors')) {
            content += $a({class: "anchor", href: `#${node.getId()}`, 'aria-hidden': "true"})
        }
        if (node.document.hasAttribute('sectlinks')) {
            content += $a({class: "link", href: `#${node.getId()}`}, sectionTitle(node))
        } else {
            content += sectionTitle(node)
        }
    } else {
        content += sectionTitle(node)
    }
    return $section({
            class: ['doc-section', `level-${node.getLevel()}`, node.getRole()],
        },
        $h({
                level: node.getLevel() + 1,
                id: node.getId()
            },
            content
        ),
        node.getContent()
    )
}
