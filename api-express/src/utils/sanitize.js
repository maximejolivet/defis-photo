const COMBINING_DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g')

export function sanitizeFilePart(str) {
  return str
    .normalize('NFKD')
    .replace(COMBINING_DIACRITICS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}
