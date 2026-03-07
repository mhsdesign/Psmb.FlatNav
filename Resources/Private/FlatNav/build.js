const esbuild = require('esbuild');
const extensibilityMap = require('@neos-project/neos-ui-extensibility/extensibilityMap.json');
const isWatch = process.argv.includes('--watch');

/** @type {import("esbuild").BuildOptions} */
const options = {
    logLevel: 'info',
    bundle: true,
    // we don't minify identifiers as with css modules another plugin is likely to override them https://github.com/evanw/esbuild/issues/3484
    minifyIdentifiers: false,
    minifySyntax: !isWatch,
    minifyWhitespace: !isWatch,
    target: 'es2020',
    entryPoints: {Plugin: 'src/index.js'},
    loader: {
        '.js': 'tsx'
    },
    outdir: '../../Public/JavaScript/FlatNav',
    alias: extensibilityMap
};

if (isWatch) {
    esbuild.context(options).then((ctx) => ctx.watch());
} else {
    esbuild.build(options);
}
