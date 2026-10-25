/**
 * Turns a flat list of versions (each with `parentId`) into what the tree
 * view needs: depth-first rows with connector info, plus lookups.
 * Siblings are ordered oldest first, so new branches appear at the bottom.
 */
export function buildVersionTree(versions) {
  const byId = new Map(versions.map((version) => [version.id, version]));
  const children = new Map();
  for (const version of versions) {
    const siblings = children.get(version.parentId) ?? [];
    siblings.push(version);
    children.set(version.parentId, siblings);
  }
  for (const siblings of children.values()) {
    siblings.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  const rows = [];
  // `rails[d]` is true when the ancestor at depth d still has siblings
  // below it, i.e. a vertical connector line continues through this row.
  (function walk(parentId, depth, rails) {
    const siblings = children.get(parentId) ?? [];
    siblings.forEach((version, index) => {
      const isLast = index === siblings.length - 1;
      rows.push({ version, depth, isLast, rails });
      walk(version.id, depth + 1, [...rails, !isLast]);
    });
  })(null, 0, []);

  return { rows, byId, children };
}

/** Ancestors from the root down to (and including) `id`. */
export function getLineage(byId, id) {
  const lineage = [];
  for (let current = byId.get(id); current; current = byId.get(current.parentId)) {
    lineage.unshift(current);
  }
  return lineage;
}

/** Who to compare a version with by default: its parent, else any other version. */
export function defaultComparePartner(tree, version) {
  if (version.parentId) return version.parentId;
  return tree.rows.find((row) => !row.version.pending && row.version.id !== version.id)?.version.id;
}

/** The selectable version `offset` rows away from `id` in tree order. */
export function neighbourVersion(tree, id, offset) {
  const ids = tree.rows.filter((row) => !row.version.pending).map((row) => row.version.id);
  return ids[ids.indexOf(id) + offset];
}
