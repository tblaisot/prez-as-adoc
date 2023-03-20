#!/usr/bin/env node
import arg from 'arg';

import * as path from "path";
import {asciidoctor, BASE_OPTIONS, REGISTRY} from "@tblaisot/asciidoctor-js-templates";
import * as url from 'url';

import * as slidesTreeprocessor from "../asciidoctor/extensions/slides_treeprocessor.js";
import * as speakerNotesTreeprocessor from "../asciidoctor/extensions/speaker_notes_treeprocessor.js";

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

slidesTreeprocessor.register(REGISTRY);
speakerNotesTreeprocessor.register(REGISTRY);

const args = arg(
    {
        '--slides-templates': [String],
        '--asciidoctor-templates-overloads': [String],
        '--base_dir': String,
        '--to_dir': String,
    },
    {
        argv: process.argv.slice(2),
    }
);

const template_dirs = [...BASE_OPTIONS.template_dirs, path.resolve(__dirname, '../asciidoctor/templates')]
const overloads = args['--asciidoctor-templates-overloads']
if (overloads && overloads.length > 0) {
    overloads.forEach(overload => {
        template_dirs.push(path.resolve(process.cwd(), overload));
    })

}
const base_dir = path.resolve(process.cwd(), args['--base_dir'] || './src');
const to_dir = path.resolve(process.cwd(), args['--to_dir'] || './dist');
const slides_templates = args['--slides-templates'] || [];

const OPTIONS = {
    ...BASE_OPTIONS,
    attributes: {
        ...BASE_OPTIONS.attributes,
        'slide-template-dirs': slides_templates.map(p => path.resolve(process.cwd(), p))
    },
    template_dirs,
    base_dir,
    to_dir,
}

// console.log(JSON.stringify(OPTIONS))
asciidoctor.convertFile(args._[0], OPTIONS);
