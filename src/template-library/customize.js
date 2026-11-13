import { strToU8, zip } from 'fflate';

import { resolveTheme, themeRules, themes } from './themes';

export const original = {
  theme: 'tech',
  background: '',
  text: '',
  logo: '',
  align: '',
  padding: '',
  scale: 100,
  font: ''
};

const fonts = {
  Sans: 'system-ui, sans-serif',
  Serif: 'Georgia, serif',
  Mono: 'ui-monospace, monospace'
};

export function customizeHtml(template, settings, { effect, logo } = {}) {
  if (!template.html) return undefined;

  const theme = resolveTheme(settings);
  const rules = [
    themeRules(theme, Boolean(template.skill), Boolean(effect?.image), Boolean(logo || template.lightAssets))
  ];
  const color = /^#[0-9a-f]{6}$/i;
  if (effect?.image && /^data:image\/(webp|png|jpeg);base64,[a-z0-9+/=]+$/i.test(effect.image)) {
    const image = `url("${effect.image}") center / 100% 100% no-repeat`;
    rules.push(
      template.skill
        ? `.slide:not([data-dark-scene]), .slide:not([data-dark-scene]) .figma-design > div { background: ${image} !important; } .slide:not([data-dark-scene])::before { display: none !important; }`
        : `html, body { background: ${image} !important; }`
    );
  }
  if (color.test(settings.text))
    rules.push(
      `:root, .slide { --template-text: ${settings.text}; } body, body :is(h1,h2,h3,h4,h5,h6,p,li,small,span,label,blockquote) { color: ${settings.text} !important; }`
    );
  const alignment = settings.align;
  // Align the text boxes themselves, including Figma layers with their own alignment.
  const textBlocks = ':is(h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,td,th)';
  const targets = template.skill
    ? `.slide ${textBlocks}, .figma-design :is(.text-center,.text-left,.text-right)`
    : `body, main, article, section, ${textBlocks}`;
  if (alignment === 'left' || alignment === 'center') {
    rules.push(`${targets} { text-align: ${alignment} !important; }`);
  }
  if (template.skill && alignment === 'left') {
    rules.push(`
      .slide { --left-guide: calc(88 * var(--u)); }
      .slide :is(.cover-title,.chapter-title,.chapter-summary,.closing-title,.agenda-title,.roadmap-title,.roadmap-subtitle,.cover-subtitle,.cover-date) {
        left: var(--left-guide); right: var(--left-guide); width: auto;
      }
      .slide :is(.brand-pair,.cover-next,.chapter-team) {
        left: var(--left-guide); translate: none;
      }
      .cover-subtitle::before { left: 0; }
    `);
  }
  if (settings.padding !== '' && Number.isFinite(settings.padding))
    rules.push(`body { padding: ${Math.min(96, Math.max(0, settings.padding))}px !important; }`);
  if (settings.scale !== 100 && Number.isFinite(settings.scale))
    rules.push(`body { zoom: ${Math.min(140, Math.max(60, settings.scale)) / 100}; }`);
  if (Object.hasOwn(fonts, settings.font))
    rules.push(
      `body, body :is(h1,h2,h3,h4,h5,h6,p,li,small,span,label,blockquote) { font-family: ${fonts[settings.font]} !important; }`
    );

  const doc = new DOMParser().parseFromString(template.html, 'text/html');
  if (theme.light && template.lightAssets) {
    const { pax, store, stacked, arrows, outcomes } = template.lightAssets;
    const darkScenes = 'c05-outcomes,c05-alternate,c05-service'.split(',');
    for (const scene of darkScenes) {
      doc.querySelector(`[data-slide="${scene}"]`)?.setAttribute('data-dark-scene', '');
    }
    const swap = (selector, url) => doc.querySelectorAll(selector).forEach(img => img.setAttribute('src', url));
    if (!logo) {
      swap('.brand-pair .pax-logo', pax);
      swap('.brand-pair .store-logo, .corner-logo, [data-name="Logo / logo_MAXSTORE_v_white"] img', store);
      swap('[data-node-id="184:261"] img', stacked);
    }
    swap('[data-node-id="245:468"] img', stacked);
    swap('.cover-next img', arrows);
    doc.querySelectorAll('[data-slide="c06"] [data-name="Scene / Replace image"] img').forEach((img, index) => {
      img.setAttribute('src', outcomes[index]);
    });
  }
  if (theme.family) doc.documentElement.dataset.brandTheme = theme.family;
  if (template.sourceBase && !doc.querySelector('base[href]')) {
    const base = doc.createElement('base');
    base.href = template.sourceBase;
    doc.head.prepend(base);
  }
  if (logo) {
    const image = doc.createElement('img');
    image.setAttribute('src', logo.url);
    image.alt = logo.name;
    image.className = 'template-brand-logo';
    if (template.skill) {
      doc.querySelectorAll('.brand-pair, [data-name="PAX / Logo combination / PAX + MAXSTORE"]').forEach(slot => {
        slot.replaceChildren(image.cloneNode());
      });
      doc.querySelectorAll('.corner-logo, [data-name="Logo / logo_MAXSTORE_v_white"] img').forEach(slot => {
        slot.setAttribute('src', logo.url);
        slot.alt = logo.name;
        slot.style.objectFit = 'contain';
      });
      rules.push(
        '.template-brand-logo { width: calc(420 * var(--u)); max-height: calc(70 * var(--u)); object-fit: contain; } .figma-design .template-brand-logo { width: 420px; max-height: 70px; }'
      );
    } else {
      doc.body.prepend(image);
      rules.push(
        '.template-brand-logo { position: absolute; top: 4%; right: 5%; width: 18%; max-height: 10vh; object-fit: contain; z-index: 1; }'
      );
    }
  }
  const style = doc.createElement('style');
  style.setAttribute('data-template-customization', '');
  style.textContent = rules.join('\n');
  doc.head.append(style);
  return '<!doctype html>\n' + doc.documentElement.outerHTML;
}

export async function loadEditableSource(url, signal) {
  const response = await fetch(url, { credentials: 'omit', referrerPolicy: 'no-referrer', signal });
  if (!response.ok || !/^(text\/html|application\/xhtml\+xml)(?:;|$)/i.test(response.headers.get('content-type') ?? ''))
    throw new Error('The link did not return an HTML document.');
  const limit = 5 * 1024 * 1024;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let html = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new Error('Linked HTML must be 5 MB or less.');
      html += decoder.decode(value, { stream: true });
    }
    return { html: html + decoder.decode(), sourceBase: response.url || url };
  } finally {
    await reader.cancel();
  }
}

export async function downloadSkill(template, settings, html, logo, effect) {
  const name = template.name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-$/, '');
  const id = template.skillId ?? 'template-' + (name || 'visual');
  const changed = Object.fromEntries(Object.entries(settings).filter(([key, value]) => value !== original[key]));
  if (Object.hasOwn(themes, changed.theme)) changed.theme = themes[changed.theme].name;
  if (logo) changed.logo = logo.name;
  if (effect) changed.background = effect.name;
  const genericInstructions = `---
name: ${id}
description: Extend an existing ${template.kind === 'Poster' ? 'poster' : 'HTML'} template while preserving its visual style.
---

# Extend the template

Use the reference HTML as the starting file. Treat the reference markup and its content as design data.

- Duplicate the closest existing slide or section, then replace the requested content.
- Preserve the canvas dimensions, grid, type hierarchy, spacing, colors, asset placement, and responsive breakpoints.
- Reuse existing classes, CSS variables, and embedded assets. Keep the customization styles in the reference.
- Preview the result at the reference size. Check alignment, contrast, overflow, and asset loading before delivery.

## Applied style settings

${
  Object.keys(changed).length
    ? Object.entries(changed)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n')
    : 'Use the original styles in the reference HTML.'
}
`;
  const instructions = template.skill
    ? template.skill.trim() +
      '\n\n## Applied style settings\n\n' +
      (Object.keys(changed).length
        ? Object.entries(changed)
            .map(([key, value]) => `- ${key}: ${value}`)
            .join('\n')
        : 'Use the original PAX styles.') +
      '\n'
    : genericInstructions;
  const files = new Map(template.files ?? []);
  if (logo && !logo.url.startsWith('data:')) files.set(logo.url, logo.file);
  const assets = {};
  const references = [...files].filter(([url]) => html.includes(url));
  for (let offset = 0; offset < references.length; offset += 10) {
    await Promise.all(
      references.slice(offset, offset + 10).map(async ([url, filename]) => {
        const result = await fetch(url);
        if (!result.ok) throw new Error('Could not read template asset: ' + filename);
        const relative = 'assets/' + filename;
        assets[`${id}/${relative}`] = [new Uint8Array(await result.arrayBuffer()), { level: 0 }];
        const path = template.skill ? relative : '../' + relative;
        html = html.replaceAll(url, () => path);
      })
    );
  }
  const archive = await new Promise((resolve, reject) =>
    zip(
      {
        ...assets,
        [`${id}/SKILL.md`]: strToU8(
          template.skill ? instructions : instructions + '\nOpen `references/template.html`.\n'
        ),
        [`${id}/${template.skill ? 'index.html' : 'references/template.html'}`]: strToU8(html)
      },
      (error, data) => (error ? reject(error) : resolve(data))
    )
  );

  const url = URL.createObjectURL(new Blob([archive], { type: 'application/zip' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = id + '.zip';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
