// vite.config.js
import {defineConfig} from 'vite';
import {prezAsAdoc} from '@tblaisot/prez-as-adoc/vite/plugins';

export default defineConfig({
    global: '({})',
    base: './',
    root: './src',
    build: {
        outDir: '../dist-vite/',
        // emptyOutDir: true, // because outDir is not in root
        minify: false,
        cssMinify: false,
        // rollupOptions: {
        //     input: {
        //         'main': 'index.html',
        //     },
        // },
    },
    plugins: [
        prezAsAdoc({
            slidesTemplates: ['./slide-templates']
        }),
    ]
})
