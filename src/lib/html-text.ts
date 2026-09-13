const NAMED_ENTITIES: Record<string, string> = {
  nbsp: ' ',
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
  hellip: '…',
  ndash: '–',
  mdash: '—',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
  deg: '°',
  copy: '©',
  reg: '®',
  trade: '™',
  times: '×',
  divide: '÷',
  middot: '·',
  bull: '•',
  aacute: 'á',
  eacute: 'é',
  iacute: 'í',
  oacute: 'ó',
  uacute: 'ú',
  agrave: 'à',
  egrave: 'è',
  igrave: 'ì',
  ograve: 'ò',
  ugrave: 'ù',
  ntilde: 'ñ',
  uuml: 'ü',
  auml: 'ä',
  ouml: 'ö',
  euml: 'ë',
  iuml: 'ï',
  Aacute: 'Á',
  Eacute: 'É',
  Iacute: 'Í',
  Oacute: 'Ó',
  Uacute: 'Ú',
  Agrave: 'À',
  Egrave: 'È',
  Igrave: 'Ì',
  Ograve: 'Ò',
  Ugrave: 'Ù',
  Ntilde: 'Ñ',
  Uuml: 'Ü',
  Auml: 'Ä',
  Ouml: 'Ö',
  Euml: 'Ë',
  Iuml: 'Ï',
};

function codePoint(value: number): string {
  if (
    Number.isFinite(value) &&
    value > 0 &&
    value <= 0x10ffff &&
    !(value >= 0xd800 && value <= 0xdfff)
  ) {
    return String.fromCodePoint(value);
  }
  return '';
}

export function cleanText(value: string | null | undefined): string {
  if (typeof value !== 'string' || !value) return '';
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|li|h[1-6]|tr|ul|ol)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex) => codePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_match, dec) => codePoint(Number(dec)))
    .replace(/&(\w+);/g, (match, name) => NAMED_ENTITIES[name] ?? match)
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}