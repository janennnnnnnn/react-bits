export const themes = {
  tech: { name: 'Technology', description: 'Original PAX blue glow, glass panels and rounded outlines.' },
  swiss: { name: 'Guizang · Swiss' }
};

// Brand Foundation · Light (tokens/pax.css).
const foundationLight = {
  '--paper': '#fafaf8',
  '--paper-2': '#ffffff',
  '--ink': '#0c101b',
  '--muted': '#66717c',
  '--text-primary': '#0c101b',
  '--text-body': '#0c101b',
  '--text-secondary': '#66717c',
  '--text-helper': '#66717c',
  '--accent': '#007ea1',
  '--accent-ink': '#007ea1',
  '--accent-soft': '#d7f3fb',
  '--line': '#d9dee4',
  '--line-subtle': '#d9dee4',
  '--line-strong': '#8b999c'
};

export function resolveTheme(settings) {
  if (settings.theme !== 'swiss') return themes.tech;
  const vars = foundationLight;
  return {
    ...themes.swiss,
    family: 'swiss',
    vars,
    backdrop: vars['--paper'],
    text: vars['--text-primary'],
    secondary: vars['--text-secondary'],
    accent: vars['--accent-ink'],
    panel: vars['--paper-2'],
    stroke: vars['--line'],
    radius: 2,
    width: 1,
    light: true
  };
}

export function themeRules(theme, deck, customBackground, customLogo) {
  if (!theme?.backdrop) return '';
  const { text, secondary, accent, panel, stroke, radius, width, backdrop, light } = theme;
  const canvas = deck ? '.slide' : 'body';
  const panels = deck
    ? '.slide :is(.glass,.chapter-team), .figma-design :is([class*="rounded-[var(--layout-radius-card"],[class*="rounded-[var(--layout-radius-pill"])'
    : 'body :is(article, .card, [data-card], blockquote)';
  const roles = theme.vars
    ? `html[data-brand-theme="${theme.family}"] {
      ${Object.entries(theme.vars)
        .map(([name, value]) => `${name}: ${value};`)
        .join('\n')}
    }`
    : '';
  const css = `
    ${roles}
    ${canvas} {
      color: ${theme.vars ? 'var(--text-body)' : text};
      color-scheme: ${light ? 'light' : 'dark'};
      --white: ${theme.vars ? 'var(--text-primary)' : text};
      --secondary: ${theme.vars ? 'var(--text-secondary)' : secondary};
      --aqua: ${theme.vars ? 'var(--accent-ink)' : accent};
      --template-text: ${theme.vars ? 'var(--text-body)' : text};
      ----pax-text: var(--template-text);
      ----pax-secondary: var(--secondary);
      ----pax-accent: var(--aqua);
    }
    ${customBackground ? '' : `${canvas} { background: ${theme.vars ? 'var(--paper)' : backdrop} !important; }`}
    ${panels} {
      background: ${theme.vars ? 'var(--paper-2)' : panel} !important;
      border: ${width}px solid ${theme.vars ? 'var(--line)' : stroke} !important;
      border-radius: ${radius}px !important;
      box-shadow: none !important;
    }
    ${
      deck
        ? `
      ${
        customBackground
          ? ''
          : `.figma-design > div { background: transparent !important; }
      .slide::before, .slide::after, .figma-design [data-name="Generated scene / Background only"] { display: none !important; }`
      }
      ${
        theme.vars
          ? `
        .slide .gradient-title { background: none; -webkit-text-fill-color: currentColor; color: var(--text-primary); }
        .figma-design p.bg-clip-text { background: none !important; color: var(--text-primary) !important; }
        .figma-design [data-name*="Main title"] p { color: var(--text-primary); }
        .slide :is(.cover-subtitle,.chapter-summary,.roadmap-subtitle) { color: var(--text-secondary); }
        .slide .cover-subtitle::before { border-color: var(--line-subtle); }
        .figma-design [data-name$="Floating country tag"] {
          background: var(--paper-2) !important;
          border-color: var(--line-strong);
          border-radius: ${radius}px;
        }
        .figma-design [data-name$="Floating country tag"] p { color: var(--text-body); }
        .figma-design [data-name$="Floating country tag"] p:first-child { color: var(--text-primary); }
        .figma-design p[class*="pax-official-aqua"] { color: var(--accent-ink) !important; }
      `
          : ''
      }
      .figma-design [data-name="PAX / PPT Nav / Arrow + Label"] p { color: ${text}; }
      ${
        light && !customLogo
          ? `.slide :is(.brand-pair img,.corner-logo),
        .figma-design :is([data-name="PAX / Logo combination / PAX + MAXSTORE"],[data-name="Logo / logo_MAXSTORE_v_white"]) img {
          filter: brightness(0) saturate(100%);
        }`
          : ''
      }
    `
        : `body :is(h1,h2,h3,h4,h5,h6,p,li,small,blockquote) { color: ${text} !important; }`
    }
  `;
  if (!deck || !light) return css;
  // Keep the original foreground and background together on photographic slides.
  const scoped = css
    .replaceAll('.slide', '.slide:not([data-dark-scene])')
    .replaceAll('.figma-design', '.slide:not([data-dark-scene]) .figma-design');
  const lightCss =
    scoped +
    `
    .slide:not([data-dark-scene]) { --foundation-ink: #0c101b; --foundation-paper: #fafaf8; --foundation-line: #d9dee4; }
    .slide[data-slide="d01"] [data-name^="Product /"] img {
      filter: brightness(0) saturate(100%) invert(17%) sepia(26%) saturate(1375%) hue-rotate(162deg);
    }
    .slide[data-slide="d01"] [data-name="Unified brand / PAX STORE"] p {
      color: var(--text-primary);
    }
    .slide[data-slide="e01"] [data-name^="Natural Earth /"] {
      opacity: 0.7;
    }
    .slide[data-slide="closing"] .footer { color: var(--text-secondary); }
    .slide .cover-date { color: #344054; }
    .slide[data-dark-scene] :is(.corner-logo, .brand-pair, [data-name="Logo / logo_MAXSTORE_v_white"]) {
      background: #fafaf8;
      border-radius: 8px;
      box-shadow: 0 0 0 7px #fafaf8;
    }
    .slide[data-slide="d02"] [data-node-id="245:467"] {
      background: #fafaf8;
      border: 2px solid #d9dee4;
      border-radius: 50%;
    }
    .slide[data-slide="d02"] [data-node-id="245:467"] img { display: none; }
    .slide[data-slide="d02"] [data-node-id="245:468"] {
      left: 895px;
      top: 401px;
      width: 106px;
      height: 74px;
    }
    .slide[data-slide="d02"] [data-node-id="245:468"] img { object-fit: contain; }
    .viewer:has([data-slide="roadmap"]:not([hidden])) .deck-nav {
      background: #fafaf8;
      color: #0c101b;
    }
    .viewer:has([data-slide="roadmap"]:not([hidden])) .deck-nav :is(button, select) {
      background: #f5f1ea;
      border-color: #897355;
    }
    .slide:is([data-slide="agenda"],[data-slide="b01b"],[data-slide="b03"]) :is(.glass,.figma-design .deck-agenda-card) {
      background: #f5f1ea !important;
      border-color: #c7b9a5 !important;
    }
    .slide :is([data-name^="Current / 0"],[data-name^="Default / 0"]) > [class*="pointer-events-none"] { display: none; }
    .slide[data-slide="roadmap"] .milestone .date { background: #f5f1ea; color: #302619; border-color: #897355; }
    .slide[data-slide="roadmap"] .milestone.current .date { background: #725333; color: #fff; }
    .slide:is([data-slide="c02"],[data-slide="c03"],[data-slide="c04"],[data-slide="c06"]) p { color: var(--foundation-ink); }
    .slide:is([data-slide="c02"],[data-slide="c03"],[data-slide="c04"],[data-slide="c06"]) p[class*="official-white"] { color: var(--foundation-ink) !important; }
    .slide[data-slide="c03"] [data-node-id="231:339"] { color: #302619; }
    .slide[data-slide="c03"] [data-node-id="253:556"] [class*="bg-gradient"] {
      background: #f5f1ea !important;
      border-color: #897355 !important;
    }
    .slide[data-slide="c03"] [data-name^="Layer /"] img { display: none; }
    .slide[data-slide="c03"] [data-name^="Layer /"] { background: #eae5dd; border: 2px solid #b7a58c; border-radius: 50%; }
    .slide[data-slide="c03"] [data-name^="Layer /"]::after { display: none; }
    .slide[data-slide="c04"] { background: var(--foundation-paper) !important; }
    .slide[data-slide="c04"] [data-name^="Stakeholder /"] { background: var(--foundation-paper) !important; border-color: var(--foundation-line) !important; }
    .slide[data-slide="c04"] :is([data-name^="Gradient / Theme-aware"],[data-name="Ecosystem orbit"] img,[data-node-id="184:260"] img) { display: none; }
    .slide[data-slide="c04"] :is([data-name="Ecosystem orbit"],[data-node-id="184:260"]) { background: #eef0f2; border: 2px solid var(--foundation-line); border-radius: 50%; }
    .slide[data-slide="c06"] [data-name$="Outcome + Scene"] { background: var(--foundation-paper) !important; border-color: var(--foundation-line) !important; }
    .slide[data-slide="c06"] [data-name="Scene / Replace image"] img {
      mask-image: linear-gradient(#000 48%, transparent 83%);
    }
    .slide[data-slide="c06"] [data-name="Scene / Replace image"] p {
      background: #fafaf8 !important;
      color: #0c101b !important;
      border-radius: 6px;
      padding-inline: 8px;
    }
  `;
  // Slide-specific light surfaces also use Foundation colors in Swiss.
  return lightCss
    .replaceAll('#344054', 'var(--text-secondary)')
    .replaceAll('#f5f1ea', 'var(--paper-2)')
    .replaceAll('#c7b9a5', 'var(--line)')
    .replaceAll('#897355', 'var(--line-strong)')
    .replaceAll('#302619', 'var(--text-primary)')
    .replaceAll('#725333', 'var(--accent-ink)')
    .replaceAll('#eae5dd', 'var(--accent-soft)')
    .replaceAll('#b7a58c', 'var(--line)')
    .replaceAll('#eef0f2', 'var(--paper-2)');
}
