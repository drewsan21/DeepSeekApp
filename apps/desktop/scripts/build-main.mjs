import { build } from 'esbuild';

const common = {
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    sourcemap: true,
    external: [
        'electron',
        'keytar'
    ]
};

await build({
    ...common,
    entryPoints: ['electron/main.ts'],
    outfile: 'dist/electron/main.js'
});

await build({
    ...common,
    entryPoints: ['electron/preload.ts'],
    outfile: 'dist/electron/preload.js'
});

console.log('Electron main and preload bundled successfully.');
