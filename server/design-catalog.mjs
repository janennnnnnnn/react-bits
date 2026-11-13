export const designCatalog = [
  {
    id: 'pax-maxstore-ecosystem',
    kind: 'Template',
    name: 'PAX · MAXSTORE Ecosystem',
    description: '17 editable HTML presentation layouts for product, roadmap, and ecosystem storytelling. The template page offers an HTML and Skill download.',
    url: '/?template=pax-maxstore-ecosystem'
  },
  ...[
    ['Background Studio', 'background-studio', 'Tune animated backgrounds and export code for presentations, posters, and prototypes.'],
    ['Center Stage', 'center-stage', 'Create product mockups from screenshots and recordings.'],
    ['Sound Lab', 'sound-lab', 'Preview and export interface sounds.']
  ].map(([name, id, description]) => ({ id, kind: 'Creative Tool', name, description, url: '/tools/' + id })),
  ...[
    'Aurora', 'ColorBends', 'Dither', 'GradientASCII', 'Grainient', 'GridMotion', 'LaserFlow', 'Prism', 'SideRays'
  ].map(name => ({
    id: name,
    kind: 'React Bits',
    name,
    description: 'Animated background. Open the registry JSON for component source and dependencies.',
    url: '/r/' + name + '-JS-CSS.json'
  })),
  {
    id: 'react-bits-registry',
    kind: 'React Bits',
    name: 'Full React Bits registry',
    description: 'Find and install additional components via the existing shadcn MCP integration.',
    url: 'https://reactbits.dev/get-started/mcp',
    registry: 'https://reactbits.dev/r/{name}.json'
  }
];
