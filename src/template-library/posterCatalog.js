const root = '/poster/empower-devices';

export const empowerPoster = {
  id: 'empower-devices',
  kind: 'Poster',
  name: 'Empower Devices',
  category: 'Social media',
  description: 'Animated AirLauncher campaign poster · 1080 × 1440',
  created: Number.MAX_SAFE_INTEGER,
  shareable: true,
  url: root + '/index.html?preview',
  editor: root + '/index.html',
  download: root + '/empower-devices.zip',
  workflow: root + '/SKILL.md'
};

export const posterWorkflow = {
  id: 'pax-poster-workflow',
  kind: 'Asset',
  name: 'PAX Poster Workflow',
  category: 'Workflow',
  media: 'text',
  filename: 'SKILL.md',
  description: 'Plan, verify, design and export a branded product poster.',
  created: Number.MAX_SAFE_INTEGER,
  url: empowerPoster.workflow
};
