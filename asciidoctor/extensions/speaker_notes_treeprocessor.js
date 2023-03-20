export function register(registry) {
  registry.treeProcessor(function () {
    const self = this
    self.process(function (document) {
      function recurse(node) {
        const sections = node.getSections()
        if(sections.length === 0) return;
        sections.forEach((section) => {
          section.findBy()
          recurse(slide)
        })
      }

      recurse(document)
      document.findBy({context: 'open'}).forEach((node) => {
        if (node.hasRole('aside') || node.hasRole('speaker') || node.hasRole('notes')) {
          const note = self.createBlock(document, 'speaker_note', '', {...node.getAttributes()});
          const blocks = node.getParent().getBlocks()
          const node_idx = blocks.indexOf(node)
          node.getBlocks().forEach((block) => {
            note.getBlocks().push(block);
          })
          blocks[node_idx] = note;
        }
      })
      document.findBy({context: 'admonition'}).forEach((node) => {
        if (node.hasRole('aside') || node.hasRole('speaker') || node.hasRole('notes')) {
          const note = self.createBlock(document, 'speaker_note', '', {...node.getAttributes()});
          const blocks = node.getParent().getBlocks()
          const node_idx = blocks.indexOf(node)
          node.getBlocks().forEach((block) => {
            note.getBlocks().push(block);
          })
          blocks[node_idx] = note;
        }
      })
      return document;
    })
  })
}
