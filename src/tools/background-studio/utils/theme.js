import { DEFAULT_COLOR_STOPS } from '../presets/Aurora';
import { getDefaultProps } from '../backgrounds';
import { BACKGROUND_LIGHT_PROPS, STUDIO_DARK_PROPS, STUDIO_LIGHT_PROPS } from '../../../constants/backgroundThemeProps';

export function themeDefaults(entry, light) {
  return {
    ...getDefaultProps(entry),
    ...(entry.id === 'aurora' && { colorStops: DEFAULT_COLOR_STOPS }),
    ...(light ? { ...BACKGROUND_LIGHT_PROPS[entry.id], ...STUDIO_LIGHT_PROPS[entry.id] } : STUDIO_DARK_PROPS[entry.id])
  };
}
