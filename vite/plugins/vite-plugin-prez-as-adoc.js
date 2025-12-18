import {vitePluginHtmlXAdoc} from '@tblaisot/vite-plugin-html-x-adoc';
import {createPrezAsAdocAsciidocConverter} from './prez-as-adoc-asciidoc-converter.js';

/**
 * Vite plugin that wraps vitePluginHtmlXAdoc with createPrezAsAdocAsciidocConverter
 *
 * @param {Object} options - Plugin options
 * @param {string} [options.htmlAdocAttribute='data-adoc'] - HTML attribute name for AsciiDoc file path
 * @param {string} [options.insertSelector='[data-adoc-insert-here]'] - CSS selector for content insertion
 * @param {string[]} [options.asciidoctorTemplatesOverloads=[]] - Custom template directories
 * @param {string[]} [options.slidesTemplates=[]] - Slide template directories
 * @returns {Object} Vite plugin object
 */
export function vitePluginPrezAsAdoc(options = {}) {
    const {
        htmlAdocAttribute,
        insertSelector,
        asciidoctorTemplatesOverloads,
        slidesTemplates,
        ...restOptions
    } = options;

    // Options for createPrezAsAdocAsciidocConverter
    const converterOptions = {
        asciidoctorTemplatesOverloads,
        slidesTemplates
    };

    // Options for vitePluginHtmlXAdoc
    const pluginOptions = {
        htmlAdocAttribute,
        insertSelector,
        asciidocConverterFn: createPrezAsAdocAsciidocConverter(converterOptions),
        ...restOptions
    };

    return vitePluginHtmlXAdoc(pluginOptions);
}
