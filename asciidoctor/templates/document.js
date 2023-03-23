const {HELPERS, TEMPLATES} = require("@tblaisot/asciidoctorjs-templates-js");
const {$, $metaIf, toAttribute, toAttributes,isEmptyString} = HELPERS;

function getFavicon(node) {
  let favicon = ''
  if (node.document.hasAttribute('favicon')) {
    let icon_href = node.document.getAttribute('favicon');
    if (isEmptyString(icon_href)) {
      icon_href = 'favicon.ico';
    }
    const icon_ext = icon_href.split('.').pop();
    const icon_type = icon_ext === 'ico' ? 'image/x-icon' : `image/${icon_ext}`;
    favicon = $('link', {rel: "icon", type: icon_type, href: icon_href});
  }
  return favicon
}

// false needs to be verbatim everything else is a string.
// Calling side isn't responsible for quoting so we are doing it here
function toValidSlideNumber(val) {
  // corner case: empty is empty attribute which is true
  if (val === "") {
    return true;
  }
  // using toString here handles both the 'false' string and the false boolean
  return val.toString() === 'false' ? false : `'${val}'`
}

/**
 * Returns formatted style/link and script tags for header.
 */
module.exports = function ({node}) {
  const document_content = node.getContent();
  let docinfo_content_header = node.getDocinfo('header', '.html');
  let docinfo_content_head = node.getDocinfo('head', '.html');
  let docinfo_content_footer = node.getDocinfo('footer', '.html');


  if (node.getNoheader() || isEmptyString(docinfo_content_header)) {
    docinfo_content_header = '';
  }
  if (isEmptyString(docinfo_content_footer)) {
    docinfo_content_footer = '';
  }

  const scripts=node.getAttribute('scripts', '').split(',').map(script => `<script type="module" src="${script}"></script>`)
  const stylesheets=node.getAttribute('stylesheets', '').split(',').map(style => `<link rel="stylesheet" type="text/css" href="${style}">`)

  return `
<!DOCTYPE html>
<html ${toAttribute('lang', node.hasAttribute('nolang') ? '' : node.getAttribute('lang', 'en'))}>
<head>
    <meta charset="utf-8">
    ${$('title', {}, node.getDoctitle() || node.getAttribute('untitled-label'))}
    ${getFavicon(node)}
    ${$metaIf('application-name', node.getAttribute('app-name'))}
    ${$metaIf('author', node.getAttribute('authors'))}
    ${$metaIf('copyright', node.getAttribute('copyright'))}
    ${$metaIf('description', node.getAttribute('description'))}
    ${$metaIf('keywords', node.getAttribute('keywords'))}
    ${$('meta', {name: 'generator', content: `Asciidoctor ${node.getAttribute('asciidoctor-version')}`})}
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, minimal-ui">
    ${stylesheets}
    ${docinfo_content_head}
</head>
<body ${toAttributes({
    id: node.getId(),
    class: [
      node.getAttribute('doctype'),
      node.getAttribute('docrole') || node.getAttribute('role'),
    ]
  })}>
${docinfo_content_header}
<div class="slides">
        <!-- START CONTENT -->
        ${document_content}
        <!-- END CONTENT -->
</div>
${docinfo_content_footer}
${scripts}
</body>
</html>
`
}


