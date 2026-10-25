import { STORAGE_BASE_URL } from '../constants';

/**
 * Resolve full storage URL from relative storage path
 * @param {string} path 
 * @returns {string}
 */
export function getStorageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  const cleanBase = STORAGE_BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/storage\/?/, '').replace(/^\/+/, '');

  return `${cleanBase}/${cleanPath}`;
}
