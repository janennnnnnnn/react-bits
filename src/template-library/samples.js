const examples = [
  [
    'Annual Review',
    'Presentation',
    'An opening slide for a yearly business review.',
    '#d8e5ce',
    '#253b2b',
    '2026 / BUSINESS REVIEW',
    'A year in motion.'
  ],
  [
    'Product Launch',
    'Product',
    'A product introduction with room for a launch message.',
    '#d3e5fb',
    '#142f55',
    'PRODUCT BRIEF',
    'Make room for better.'
  ],
  [
    'Connected Operations',
    'Solution',
    'A solution overview for an operations presentation.',
    '#2b2450',
    '#f3e8ff',
    'SOLUTION OVERVIEW',
    'Everything in sync.'
  ],
  [
    'Design Exhibition',
    'Exhibition',
    'An exhibition cover with an editorial layout.',
    '#f4ddcc',
    '#512d28',
    'DESIGN EXHIBITION',
    'Objects in dialogue.'
  ],
  [
    'Strategy Brief',
    'Presentation',
    'A title slide for a quarterly strategy session.',
    '#e4dcfa',
    '#352658',
    'STRATEGY / Q4',
    'The next chapter.'
  ],
  [
    'Field Notes',
    'Product',
    'A cover for a product research presentation.',
    '#e9e5d8',
    '#383626',
    'PRODUCT RESEARCH',
    'Closer to the work.'
  ]
];

export const samples = examples.map(([name, category, description, background, color, label, headline], index) => ({
  id: 'example-' + index,
  name,
  category,
  description,
  created: -index,
  sample: true,
  html: `<!doctype html><html><meta charset="utf-8"><title>${name}</title>
  <style>
    *{box-sizing:border-box}
    body{margin:0;min-height:100vh;display:flex;align-items:center;background:${background};color:${color};font-family:system-ui,sans-serif;padding:9vw}
    main{width:100%;border-top:1px solid currentColor;padding-top:3vw}
    small{font-size:2vw;letter-spacing:.22em}
    h1{font-size:9vw;line-height:.94;letter-spacing:-.065em;max-width:10ch;margin:6vw 0 3vw}
    p{font-size:2.4vw;max-width:36ch}
  </style><main><small>${label}</small><h1>${headline}</h1><p>${description}</p></main></html>`
}));
