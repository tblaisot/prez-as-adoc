
export function register(registry) {
    registry.treeProcessor(function () {
        const self = this

        function replaceNodeWithSpeakerNoteNode(node){
            const note = self.createBlock(node.getParent(), 'speaker_note', '', {...node.getAttributes()});
            const parentBlocks = node.getParent().getBlocks();
            const childBlocks = node.getBlocks();
            if (childBlocks.length > 0) {
                childBlocks.forEach((block) => {
                    note.append(block);
                });
            } else {
                // simple content model (e.g. [NOTE.speaker]\nText without delimiters)
                // content stored as source lines, not child blocks
                const content = node.getContent();
                if (content && content.trim()) {
                    note.append(self.createBlock(note, 'pass', content));
                }
            }
            parentBlocks[parentBlocks.indexOf(node)]=note; // replace node from parent
        }

        self.process(function (document) {
            document.findBy({context: 'open'}).forEach((node) => {
                if (node.hasRole('speaker') || node.hasRole('notes')) {
                    replaceNodeWithSpeakerNoteNode(node);
                }
            });
            document.findBy({context: 'admonition'}).forEach((node) => {
                if (node.hasRole('speaker') || node.hasRole('notes')) {
                    replaceNodeWithSpeakerNoteNode(node);
                }
            });
            document.findBy({context: 'sidebar'}).forEach((node) => {
                if (node.hasRole('speaker') || node.hasRole('notes')) {
                    replaceNodeWithSpeakerNoteNode(node);
                }
            });
            return document;
        });

    })
}
