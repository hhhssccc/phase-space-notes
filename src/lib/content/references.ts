interface Entry { id: string; data: { draft: boolean; related: string[]; backlinks: string[] } }
interface Path { id: string; steps: { id: string }[] }
/** Fail at build time rather than silently discarding broken editorial references. */
export function createContentIndex<T extends Entry>(entries: T[], paths: Path[], symbolIds: string[] = [], labIds: string[] = []) {
  const index = new Map<string, T>();
  for (const entry of entries) {
    if (entry.data.draft) continue;
    if (index.has(entry.id)) throw new Error(`Duplicate content ID: ${entry.id}`);
    index.set(entry.id, entry);
  }
  const requireEntry = (id: string, owner = 'content') => {
    const entry = index.get(id);
    if (!entry) throw new Error(`${owner}: missing public article ${id}`);
    return entry;
  };
  for (const entry of index.values()) for (const kind of ['related', 'backlinks'] as const) {
    for (const id of entry.data[kind]) {
      if (id === entry.id) throw new Error(`${entry.id}: ${kind} cannot reference itself`);
      requireEntry(id, `${entry.id}.${kind}`);
    }
  }
  const routeIds = new Set<string>();
  for (const route of paths) {
    if (routeIds.has(route.id)) throw new Error(`Duplicate reading path: ${route.id}`);
    routeIds.add(route.id);
    const steps = new Set<string>();
    for (const step of route.steps) {
      if (steps.has(step.id)) throw new Error(`Reading path ${route.id}: duplicate step ${step.id}`);
      steps.add(step.id); requireEntry(step.id, `Reading path ${route.id}`);
    }
  }
  for (const id of symbolIds) requireEntry(id, 'Symbol guide');
  for (const id of labIds) requireEntry(id, 'Physics lab');
  return { entries: [...index.values()], index, requireEntry };
}
