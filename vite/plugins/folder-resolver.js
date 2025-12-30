import {createRequire} from 'node:module';
import {dirname, isAbsolute, join, resolve} from 'node:path';

/**
 * Resolves a string to an absolute folder path relative to a rootDir.
 * @param {string} input - The path or package name (e.g., "./test", "lodash")
 * @param {string} rootDir - The absolute path to use as the base for resolution
 */
export function resolveFolder(rootDir, input) {
    // 1. Handle Absolute Paths
    if (isAbsolute(input)) {
        return input;
    }

    // 2. Handle Relative Paths (./ or ../)
    // We use standard path logic here because ESM/require resolution
    // expects files, but you want a directory.
    if (input.startsWith('./') || input.startsWith('../')) {
        return resolve(rootDir, input);
    }

    // 3. Handle Bare Specifiers (Node Modules)
    // We create a require function that "thinks" it is located inside rootDir
    const fakeModulePath = join(rootDir, 'index.js');
    const customRequire = createRequire(fakeModulePath);

    let packageName = '';
    let insidePackagePath = '';
    const splitted = input.split('/');
    if (input.startsWith('@')) {
        packageName = splitted.slice(0, 2).join('/');
        insidePackagePath = splitted.slice(2).join('/');
    } else {
        packageName = splitted[0];
        insidePackagePath = splitted.slice(1).join('/');
    }
    // We attempt to resolve the package's package.json to get the root folder
    const entryPath = customRequire.resolve(`${packageName}`);
    return resolve(dirname(entryPath),insidePackagePath);
}
