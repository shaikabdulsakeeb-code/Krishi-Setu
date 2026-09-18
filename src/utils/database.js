export function snapshotToList(snapshot) {
  const value = snapshot.val();
  return Object.entries(value || {}).map(([id, item]) => ({ id, ...item }));
}
