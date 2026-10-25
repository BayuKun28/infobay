/**
 * Date & String Formatter Utilities
 */

/**
 * Format date string into human-readable Indonesian format
 * @param {string|Date} dateStr 
 * @param {boolean} withTime 
 * @returns {string}
 */
export function formatDate(dateStr, withTime = false) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);

    const options = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...(withTime && { hour: '2-digit', minute: '2-digit' }),
    };

    return new Intl.DateTimeFormat('id-ID', options).format(d);
  } catch {
    return String(dateStr);
  }
}

/**
 * Format category label nicely
 * @param {string} category 
 * @returns {string}
 */
export function formatCategory(category) {
  if (!category) return 'General';
  return category.trim().toUpperCase();
}

/**
 * Truncate long text with ellipsis
 * @param {string} text 
 * @param {number} maxLen 
 * @returns {string}
 */
export function truncateText(text, maxLen = 100) {
  if (!text || text.length <= maxLen) return text || '';
  return text.substring(0, maxLen).trim() + '...';
}
