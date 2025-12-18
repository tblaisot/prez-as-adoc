
export function register(registry) {
    registry.treeProcessor(function () {
        const self = this

        function replaceNodeWithSpeakerNoteNode(node){
            const note = self.createBlock(node.getParent(), 'speaker_note', '', {...node.getAttributes()});
            const parentBlocks = node.getParent().getBlocks();
            node.getBlocks().forEach((block) => {
                note.getBlocks().push(block);
            });
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
