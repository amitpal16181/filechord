const path = require('path');

function resolveWithin(root, target) {
    const rootResolved = path.resolve(root);
    const targetResolved = path.resolve(target);
    if (targetResolved === rootResolved) return rootResolved;
    if (!targetResolved.startsWith(rootResolved + path.sep)) {
        throw new Error('Path outside sharing root');
    }
    return targetResolved;
}

module.exports = { resolveWithin };
