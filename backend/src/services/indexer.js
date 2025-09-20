// Simple recursive indexer that builds an in-memory map: fileId -> {relPath, size, mtime}
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

function indexFilesForRoot(root) {
    const map = {};
    function walk(dir, relBase = '') {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        entries.forEach(e => {
            const full = path.join(dir, e.name);
            const rel = path.join(relBase, e.name);
            if (e.isDirectory()) {
                walk(full, rel);
            } else if (e.isFile()) {
                const stat = fs.statSync(full);
                const id = nanoid(10);
                map[id] = {
                    id,
                    name: e.name,
                    relPath: rel,
                    size: stat.size,
                    mtime: stat.mtimeMs
                };
            }
        });
    }
    walk(root);
    return map;
}

module.exports = { indexFilesForRoot };
