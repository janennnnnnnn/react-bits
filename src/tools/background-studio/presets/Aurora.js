import { LOOK } from '../../../demo/Backgrounds/presets/Aurora';

// Stop order follows gradient-01 through gradient-06 in the supplied PAX tokens/pax.css.
const azure = '#2A7DE1';
const aqua = '#72D6F1';
const black = '#000000';
const white = '#FFFFFF';
const green = '#21BA8C';

const gradients = [
  ['pax-01', 'PAX 01 · Azure to Aqua', [azure, aqua]],
  ['pax-02', 'PAX 02 · Black to Azure', [black, azure]],
  ['pax-03', 'PAX 03 · Azure to Black', [azure, black]],
  ['pax-04', 'PAX 04 · White to Aqua', [white, aqua]],
  ['pax-05', 'PAX 05 · Aqua, Azure, Black', [aqua, azure, black]],
  ['pax-06', 'PAX 06 · Green to Aqua', [green, aqua]]
];

export const DEFAULT_COLOR_STOPS = gradients[0][2];
export const PRESET_OPTIONS = gradients.map(([value, label]) => ({ value, label }));
export const PRESETS = Object.fromEntries(gradients.map(([value, , colorStops]) => [value, { ...LOOK, colorStops }]));
export const presetProps = value => PRESETS[value];
