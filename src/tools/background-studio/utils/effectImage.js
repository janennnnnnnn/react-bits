import { CATALOG, findEntry, themeDefaults } from './catalog';
import { readDocument } from './params';
import { loadPresets } from './presets';
import { renderImage } from './render';

export async function resolveEffect(configuration, theme) {
  const params = new URLSearchParams(configuration);
  const entry = findEntry(params.get('bg'));
  if (!entry) throw new Error('This background is unavailable.');
  const { preset, changes } = readDocument(params, CATALOG[0].id, findEntry);
  const light = theme === 'light';
  const defaults = themeDefaults(entry, light);
  const presets = preset ? await loadPresets(entry) : null;
  const props = {
    ...defaults,
    ...presets?.resolve(preset, { light, defaults, props: defaults }),
    ...changes,
    ...entry.fixedProps,
    intro: false
  };
  return { entry, props };
}

export async function renderEffectImage(configuration, theme, signal) {
  const { entry, props } = await resolveEffect(configuration, theme);
  const size = { width: 1600, height: 900 };
  const canvas = await renderImage({
    entry,
    props,
    theme,
    layout: size,
    output: size,
    ratio: 1,
    moment: 2,
    fill: theme === 'light' ? '#ffffff' : '#120f17',
    signal
  });
  return canvas.toDataURL('image/webp', 0.9);
}
