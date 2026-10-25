export * from './formatters';
export * from './storage';

/**
 * Utility to normalize tech stack data into a clean array of strings
 */
export function normalizeTechStack(raw) {
  if (!raw) return [];
  let items = raw;
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items);
    } catch {
      items = items.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (!item) return '';
      if (typeof item === 'string') return item.trim();
      if (typeof item === 'object') {
        return item.name || item.title || item.label || item.tag || '';
      }
      return String(item).trim();
    })
    .filter(Boolean);
}
