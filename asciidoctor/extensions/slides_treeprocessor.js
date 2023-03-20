import {HELPERS} from "@tblaisot/asciidoctor-js-templates";
const {sectionTitle, slice_text, $h, $div} = HELPERS;

function debugAST(node) {
    return {
        context: node.getContext(),
        blocks: node.getBlocks().map(n => debugAST(n)),
    }
}

export function register(registry) {
    registry.treeProcessor(function () {
        const self = this
        self.process(function (document) {

            // document.findBy({context: 'page_break'}).forEach((node) => {
            //   const parentSection = node.getParent();
            //   const breakIndex = parentSection.getBlocks().indexOf(node)
            //   const blockAfterBreak = parentSection.getBlocks().slice(breakIndex)
            //   const grandParentSection = parentSection.getParent();
            //   const slide = self.createBlock(document, 'slide', '', {...parentSection.getAttributes(), level: parentSection.getLevel()});
            //   blockAfterBreak.forEach((block) => {
            //     slide.getBlocks().push(block);
            //   })
            //   grandParentSection.getBlocks().splice(grandParentSection.getBlocks().indexOf(parentSection), 0, slide);
            //
            //   // remove block after
            //   parentSection.getBlocks().splice(breakIndex, parentSection.getBlocks().length - parentSection.getBlocks() - 1)
            // })

            function recurse(node) {
                const sections = node.getSections()
                if (sections.length === 0) return;
                sections.forEach((section) => {
                    const slide = self.createBlock(document, 'slide', '', {
                        ...section.getAttributes(),
                        level: section.getLevel()
                    });
                    const title = self.createBlock(slide, 'title', sectionTitle(section), {
                        level: section.getLevel(),
                        slot: 'title'
                    });
                    slide.getBlocks().push(title)
                    section.getBlocks().forEach((block) => {
                        slide.getBlocks().push(block);
                    })
                    node.getBlocks().splice(node.getBlocks().indexOf(section), 1); // remove node from parent
                    document.getBlocks().push(slide); // push slide to first level of the document
                    recurse(slide)
                })
            }

            recurse(document)
            // console.log(JSON.stringify(debugAST(document), null, 2))

            // create title slide
            const attrName = document.getAttribute('slide-template-attr', 'slide-template', 'slide-template-attr');

            const title_slide = self.createBlock(document, 'slide', '', {
                [attrName]: 'title-slide', ...document.getAttributes(),
                level: 0
            });

            const _title_obj = document.getDoctitle({partition: true, use_fallback: true});
            if (_title_obj.subtitle) {
                const _slice = document.getHeader().isOption('slice');
                const title1 = self.createBlock(title_slide, 'title', slice_text(_title_obj.main, _slice), {
                    level: 1,
                    slot: 'title'
                });
                const title2 = self.createBlock(title_slide, 'title', slice_text(_title_obj.subtitle, _slice), {
                    level: 2,
                    slot: 'subtitle'
                });
                title_slide.getBlocks().push(title1)
                title_slide.getBlocks().push(title2)
            } else {
                const title = self.createBlock(title_slide, 'title', document.getHeader().getTitle(), {
                    level: 1,
                    slot: 'title'
                });
                title_slide.getBlocks().push(title)
            }

            const preambles = document.findBy({context: 'preamble'});
            title_slide.getBlocks().push(...preambles);

            document.getBlocks().splice(0, 0, title_slide);

            // remove preamble block from document
            document.getBlocks().splice(document.getBlocks().findIndex(b => b === preambles[0]), 1);

            return document;
        })
    })
}
