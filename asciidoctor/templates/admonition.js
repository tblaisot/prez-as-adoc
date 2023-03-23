const {HELPERS, TEMPLATES} = require("@tblaisot/asciidoctorjs-templates-js");
const {admonition: admonition_template} = TEMPLATES;
const {$aside} = HELPERS;

module.exports = function ({node}) {
    if (node.hasRole('speaker')) {
        return $aside({role: 'notes', class: 'speaker-notes'}, node.getContent())
    }
    return admonition_template({node})
}
