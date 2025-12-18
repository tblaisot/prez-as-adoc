import {resolve} from 'node:path';
import * as url from 'url';
import {asciidoctor, BASE_OPTIONS, REGISTRY} from "@tblaisot/asciidoctorjs-templates-js";
import {slidesTreeprocessor, speakerNotesTreeprocessor} from "../../asciidoctor/extensions/index.js";

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const ASCIIDOCTOR_TEMPLATES_PATH = '../../asciidoctor/templates';

//order is important
speakerNotesTreeprocessor.register(REGISTRY);
slidesTreeprocessor.register(REGISTRY);

function buildAsciidoctorOptions(options = {}) {
    const {
        asciidoctorTemplatesOverloads = [],
        rootDir,
        baseDir,
        toDir,
        slidesTemplates = []
    } = options;
    const template_dirs = [...BASE_OPTIONS.template_dirs, resolve(__dirname, ASCIIDOCTOR_TEMPLATES_PATH)];
    if (asciidoctorTemplatesOverloads && asciidoctorTemplatesOverloads.length > 0) {
        asciidoctorTemplatesOverloads.forEach(overload => {
            template_dirs.push(resolve(rootDir, overload));
        });
    }

    const base_dir = resolve(rootDir, baseDir);
    const to_dir = resolve(rootDir, toDir);

    return {
        ...BASE_OPTIONS,
        attributes: {
            ...BASE_OPTIONS.attributes,
            'slide-template-dirs': slidesTemplates.map(p => resolve(rootDir, p))
        },
        template_dirs,
        base_dir,
        to_dir,
    };
}


export function createPrezAsAdocAsciidocConverter(options = {}) {
    return ({rootDir, baseDir, toDir}) => {
        const OPTIONS = buildAsciidoctorOptions({...options, rootDir, baseDir, toDir});
        return (filename, content) => {
            OPTIONS.source = filename;
            const adoc = asciidoctor.load(content, OPTIONS);
            return {
                html: adoc.convert(),
                document: adoc
            };
        };
    }
}
