import {HELPERS} from "@tblaisot/asciidoctorjs-templates-js";

const {sectionTitle, slice_text, isEmptyString} = HELPERS;

const NO_TITLE = '!';

export function debugAST(node) {
    return {
        context: node.getContext(),
        role: node.getRole(),
        attributes: node.getAttributes(),
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
                const sections = node.getSections();
                if (sections.length === 0) return;
                sections.forEach((section) => {
                    const slide = self.createBlock(
                        document,
                        'slide',
                        '',
                        {
                            ...section.getAttributes(),
                            level: section.getLevel()
                        }
                    );

                    const section_title = sectionTitle(section);
                    const title = self.createBlock(
                        slide,
                        'title',
                        section_title,
                        {
                            level: section.getLevel(),
                            slot: 'title'
                        }
                    );
                    if (section_title === NO_TITLE
                        || section.isOption('notitle')
                        || section.isOption('conceal')) {
                        slide.addRole('hidden-title');
                    }

                    slide.getBlocks().push(title);

                    section.getBlocks().forEach((block) => {
                        slide.getBlocks().push(block);
                    })
                    node.getBlocks().splice(node.getBlocks().indexOf(section), 1); // remove node from parent
                    document.getBlocks().push(slide); // push slide to first level of the document
                    recurse(slide)
                });
            }

            recurse(document)
            // console.log(JSON.stringify(debugAST(document), null, 2))

            // create title slide
            const attrName = document.getAttribute('slide-template-attr', 'slide-template', 'slide-template-attr');

            const deck_title_slide = self.createBlock(
                document,
                'slide',
                '',
                {
                    [attrName]: 'deck-title',
                    ...document.getAttributes(),
                    level: 0
                }
            );

            const _title_obj = document.getDoctitle({partition: true, use_fallback: true});
            if (_title_obj.subtitle) {
                const _slice = document.getHeader().isOption('slice'); // FIXME
                const title1 = self.createBlock(deck_title_slide, 'title', slice_text(_title_obj.main, _slice), {
                    level: 1,
                    slot: 'title'
                });
                deck_title_slide.getBlocks().push(title1)
                const subtitle = slice_text(_title_obj.subtitle, _slice);
                if (!isEmptyString(subtitle)) {
                    const title2 = self.createBlock(deck_title_slide, 'title', subtitle, {
                        level: 2,
                        slot: 'subtitle'
                    });
                    deck_title_slide.getBlocks().push(title2)
                }
            } else {
                const title = self.createBlock(deck_title_slide, 'title', document.getHeader().getTitle(), {
                    level: 1,
                    slot: 'title'
                });
                deck_title_slide.getBlocks().push(title)
            }

            const preambles = document.findBy({context: 'preamble'});
            if(preambles.length === 1) {
                preambles[0].getBlocks().forEach((block) => {
                    deck_title_slide.getBlocks().push(block);
                });
                const parentBlocks = preambles[0].getParent().getBlocks();
                parentBlocks[parentBlocks.indexOf(preambles[0])] = deck_title_slide;//self.createBlock(preambles[0].getParent(), 'empty','', {}); // replace node from parent
            } else {
                document.getBlocks().splice(0, 0, deck_title_slide);
            }
            // remove preamble block from document
            // document.getBlocks()[document.getBlocks().findIndex(b => b === preambles[0])] = self.createBlock(document, 'empty', '', {});

            return document;
        })
    })
}
