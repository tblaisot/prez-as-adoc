import {HTMLElement, parse as parseHTML, TextNode} from 'node-html-parser';
import {asciidoctor, BASE_OPTIONS, HELPERS, REGISTRY} from "@tblaisot/asciidoctorjs-templates-js";
import * as path from "path";
import * as url from 'url';
import * as slidesTreeprocessor from "../../asciidoctor/extensions/slides_treeprocessor.js";
import * as  speakerNotesTreeprocessor from "../../asciidoctor/extensions/speaker_notes_treeprocessor.js";

const {$, isEmptyString} = HELPERS;
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

slidesTreeprocessor.register(REGISTRY);
speakerNotesTreeprocessor.register(REGISTRY);

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

function appendMetaIf(node_head, name, content) {
    if (!isEmptyString(content)) {
        const meta = new HTMLElement('meta', {});
        meta.setAttribute(name, content);
        node_head.appendChild(meta);
    }
}

function setAttributeIf(node, name, content) {
    if (!isEmptyString(content)) {
        node.setAttribute(name, content);
    }
}

function transformIndexHtml(
    {
        asciidoctorTemplatesOverloads,
        baseDir = './src',
        toDir = './dist',
        slidesTemplates = []
    },
    html,
    {filename}
) {
    const file = filename.replace(/\.html$/, '.adoc');
    const document = parseHTML(html);


    const template_dirs = [...BASE_OPTIONS.template_dirs, path.resolve(__dirname, '../../asciidoctor/templates')]
    if (asciidoctorTemplatesOverloads && asciidoctorTemplatesOverloads.length > 0) {
        asciidoctorTemplatesOverloads.forEach(overload => {
            template_dirs.push(path.resolve(process.cwd(), overload));
        })

    }
    const base_dir = path.resolve(process.cwd(), baseDir);
    const to_dir = path.resolve(process.cwd(), toDir);

    const OPTIONS = {
        ...BASE_OPTIONS,
        attributes: {
            ...BASE_OPTIONS.attributes,
            'slide-template-dirs': slidesTemplates.map(p => path.resolve(process.cwd(), p))
        },
        template_dirs,
        base_dir,
        to_dir,
    }

    const adoc = asciidoctor.loadFile(file, OPTIONS);
    const content = adoc.convert();
    // console.log(adoc.getAttributes())

    const node_html = document.querySelector('html');
    const node_head = document.querySelector('head');
    const node_body = document.querySelector('body');
    node_html.setAttribute('lang', adoc.hasAttribute('nolang') ? '' : adoc.getAttribute('lang', 'en'))
    const title = new HTMLElement('title', {});
    title.appendChild(new TextNode(adoc.getDoctitle() || adoc.getAttribute('untitled-label')));
    node_head.appendChild(title);
    node_head.appendChild(parseHTML(getFavicon(adoc)));

    appendMetaIf(node_head, 'application-name', adoc.getAttribute('app-name'));
    appendMetaIf(node_head, 'author', adoc.getAttribute('authors'));
    appendMetaIf(node_head, 'copyright', adoc.getAttribute('copyright'));
    appendMetaIf(node_head, 'description', adoc.getAttribute('description'));
    appendMetaIf(node_head, 'keywords', adoc.getAttribute('keywords'));
    appendMetaIf(node_head, 'generator', `Asciidoctor ${adoc.getAttribute('asciidoctor-version')}`);

    setAttributeIf(node_body, 'id', adoc.getId());
    setAttributeIf(node_body, 'class', [
        adoc.getAttribute('doctype'),
        adoc.getAttribute('docrole') || adoc.getAttribute('role'),
    ].join(' '));

    document.querySelector('.slides').appendChild(parseHTML(content));

    return document.toString();
}

export const prezAsAdocPlugin = (options) => {
    return {
        name: 'prez-as-adoc',
        transformIndexHtml: transformIndexHtml.bind(null, options),
        enforce: 'pre'
    }
}
