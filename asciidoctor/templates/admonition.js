const {admonition: admonition_template} = require("@tblaisot/asciidoctorjs-templates-js/templates");
const {$aside} = require("@tblaisot/asciidoctorjs-templates-js/helpers");

module.exports = function ({node}) {
    if (node.hasRole('speaker')) {
        return $aside({role: 'notes', class: 'speaker-notes'}, node.getContent())
    }
    return admonition_template({node})
}
