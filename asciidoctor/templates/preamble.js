const {$section} = require("@tblaisot/asciidoctorjs-templates-js/helpers");

module.exports = function ({node}) {
    return $section({
            id: 'preamble',
            'aria-label': 'Preamble'
        },
        node.getContent()
    );
}
