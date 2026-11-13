import markup from './deck.html?raw';
import figmaSlides from './figma-slides.html?raw';
import figmaStyles from './figma-utilities.css?raw';
import styles from './deck.css?raw';
import script from './deck.js?raw';
import skill from './SKILL.md?raw';
import fontLicense from './assets/Poppins-OFL.txt?raw';

const assets = import.meta.glob('./assets/*.{svg,png,jpg,woff2}', {
  eager: true,
  query: '?url',
  import: 'default'
});

const tokens = {
  PAX: '116-26-imgOfficialVectorSymbolWhite.svg',
  MAXSTORE: '116-26-imgLogoLogoMaxstoreVWhite.png',
  COVER_ARROWS: '116-26-imgPaxBrandPatternOfficialArrows.svg',
  AGENDA_ARROWS: '192-135-imgPaxBrandPatternOfficialArrows.svg',
  CHAPTER_ARROWS: 'section-arrows-0.svg',
  CHAPTER_MOTIF: 'section-arrows-1.svg',
  ROADMAP_ARROWS: '141-36-imgPaxBrandPatternOfficialArrows.svg',
  CLOSING_MOTIF: '192-204-imgPaxBrandPatternOfficialArrows.svg',
  DISCOVER: '141-36-imgTransparentC4DStyleIllustration.png',
  BUILD: '141-36-imgTransparentC4DStyleIllustration1.png',
  VALIDATE: '141-36-imgTransparentC4DStyleIllustration2.png',
  SCALE: '141-36-imgTransparentC4DStyleIllustration3.png',
  COMPLETE: '141-36-imgTimelineMarkerConnector.svg',
  CURRENT: '141-36-imgTimelineMarkerConnector1.svg',
  PLANNED: '141-36-imgTimelineMarkerConnector2.svg',
  LAST: '141-36-imgTimelineMarkerConnector3.svg',
  FONT_400: 'poppins-400.woff2',
  FONT_500: 'poppins-500.woff2',
  FONT_600: 'poppins-600.woff2',
  FONT_700: 'poppins-700.woff2'
};

const sequence = [
  'cover',
  'agenda',
  'chapter',
  'b01b',
  'b03',
  'roadmap',
  'c02',
  'c03',
  'c04',
  'c05-outcomes',
  'c05-alternate',
  'c05-service',
  'c06',
  'd01',
  'd02',
  'e01',
  'closing'
];
const sections = /<section\b[^>]*data-slide="([^"]+)"[^>]*>[\s\S]*?<\/section>/g;
const byId = new Map(
  [...markup.matchAll(sections), ...figmaSlides.matchAll(sections)].map(([section, id]) => [id, section])
);
const files = new Map();
function asset(name) {
  const url = assets['./assets/' + name];
  if (!url) throw new Error('Missing deck asset: ' + name);
  if (!url.startsWith('data:') && !files.has(url)) files.set(url, name);
  return url;
}
const html = markup
  .replace(/<section\b[\s\S]*<\/section>/, () => sequence.map(id => byId.get(id)).join('\n'))
  .replace('__DECK_CSS__', () => figmaStyles + '\n' + styles)
  .replace('__DECK_SCRIPT__', () => script)
  .replace(/__([A-Z_0-9]+)__/g, (_, token) => asset(tokens[token]))
  .replace(/@@asset:([\w.-]+)@@/g, (_, name) => asset(name))
  .replace('</head>', () => '<!--\n' + fontLicense + '\n-->\n</head>');

const lightAssets = {
  pax: asset('pax-official-color.png'),
  store: asset('maxstore-color-horizontal.png'),
  stacked: asset('maxstore-color-stacked.png'),
  arrows: asset(tokens.AGENDA_ARROWS),
  outcomes: [1, 2, 3, 4].map(index => asset(`outcome-light-${index}.jpg`))
};

export const paxTemplate = {
  id: 'pax-maxstore-ecosystem',
  name: 'PAX · MAXSTORE Ecosystem',
  category: 'Presentation',
  description: '17 animated 16:9 slides based on the PAX slide templates.',
  created: Number.MAX_SAFE_INTEGER,
  sample: true,
  shareable: true,
  html,
  skill,
  skillId: 'pax-maxstore-html',
  lightAssets,
  files: [...files]
};
