export const BACKGROUNDS = [
  {
    id: 'aurora',
    label: 'Aurora',
    component: () => import('../../../content/Backgrounds/Aurora/Aurora.jsx'),
    installCommand: 'npx shadcn@latest add "https://reactbits.dev/default/backgrounds/aurora"',
    props: [
      {
        name: 'colorStops',
        type: 'colorArray',
        default: ['#5227FF', '#7cff67', '#5227FF'],
        label: 'Color Stops',
        minItems: 2,
        maxItems: 5
      },
      { name: 'direction', type: 'select', default: 'top', options: ['top', 'bottom'], label: 'Direction' },
      { name: 'height', type: 'number', default: 0.45, min: 0.1, max: 0.9, step: 0.01, label: 'Height' },
      { name: 'amplitude', type: 'number', default: 1, min: 0, max: 2.5, step: 0.05, label: 'Amplitude' },
      { name: 'blend', type: 'number', default: 0.5, min: 0, max: 1, step: 0.01, label: 'Blend' },
      { name: 'glow', type: 'number', default: 0.6, min: 0, max: 2, step: 0.05, label: 'Glow' },
      { name: 'scale', type: 'number', default: 1, min: 0.3, max: 3, step: 0.05, label: 'Scale' },
      { name: 'speed', type: 'number', default: 1, min: 0, max: 3, step: 0.05, label: 'Speed' },
      { name: 'brightness', type: 'number', default: 1, min: 0.2, max: 2, step: 0.05, label: 'Brightness' },
      { name: 'layers', type: 'number', default: 1, min: 1, max: 3, step: 1, label: 'Layers' },
      { name: 'opacity', type: 'number', default: 1, min: 0, max: 1, step: 0.05, label: 'Opacity' },
      { name: 'mouseInteraction', type: 'boolean', default: true, label: 'Mouse Interaction' },
      { name: 'intro', type: 'boolean', default: true, label: 'Intro' },
      { name: 'lightMode', type: 'boolean', default: false, label: 'Light Mode' }
    ]
  },
  {
    id: 'color-bends',
    label: 'Color Bends',
    component: () => import('../../../content/Backgrounds/ColorBends/ColorBends.jsx'),
    installCommand: 'npx shadcn@latest add "https://reactbits.dev/default/backgrounds/color-bends"',
    props: [
      { name: 'rotation', type: 'number', default: 90, min: 0, max: 360, step: 5, label: 'Rotation' },
      { name: 'speed', type: 'number', default: 0.2, min: 0, max: 1, step: 0.05, label: 'Speed' },
      {
        name: 'colors',
        type: 'colorArray',
        default: ['#5227FF', '#FF9FFC', '#7cff67'],
        label: 'Colors',
        minItems: 2,
        maxItems: 8
      },
      { name: 'transparent', type: 'boolean', default: true, label: 'Transparent' },
      { name: 'autoRotate', type: 'number', default: 0, min: 0, max: 1, step: 0.05, label: 'Auto Rotate' },
      { name: 'scale', type: 'number', default: 1, min: 0.1, max: 3, step: 0.1, label: 'Scale' },
      { name: 'frequency', type: 'number', default: 1, min: 0.1, max: 3, step: 0.1, label: 'Frequency' },
      { name: 'warpStrength', type: 'number', default: 1, min: 0, max: 3, step: 0.1, label: 'Warp Strength' },
      { name: 'mouseInfluence', type: 'number', default: 1, min: 0, max: 3, step: 0.1, label: 'Mouse Influence' },
      { name: 'parallax', type: 'number', default: 0.5, min: 0, max: 2, step: 0.1, label: 'Parallax' },
      { name: 'noise', type: 'number', default: 0.15, min: 0, max: 0.5, step: 0.05, label: 'Noise' },
      { name: 'iterations', type: 'number', default: 1, min: 1, max: 5, step: 1, label: 'Iterations' },
      { name: 'intensity', type: 'number', default: 1.5, min: 0.1, max: 2, step: 0.1, label: 'Intensity' },
      { name: 'bandWidth', type: 'number', default: 6, min: 1, max: 20, step: 0.5, label: 'Band Width' }
    ]
  },
  {
    id: 'dither',
    label: 'Dither',
    component: () => import('../../../content/Backgrounds/Dither/Dither.jsx'),
    installCommand: 'npx shadcn@latest add "https://reactbits.dev/default/backgrounds/dither"',
    props: [
      { name: 'waveColor', type: 'color', default: '#bcbcbc', label: 'Wave Color' },
      { name: 'backgroundColor', type: 'color', default: '#120f17', label: 'Background' },
      {
        name: 'ditherMode',
        type: 'select',
        default: 'bayer',
        options: ['bayer', 'bayer4', 'bayer2', 'halftone', 'lines', 'crosshatch', 'noise', 'none'],
        label: 'Dither Mode'
      },
      { name: 'pixelSize', type: 'number', default: 2, min: 1, max: 8, step: 1, label: 'Pixel Size' },
      { name: 'colorNum', type: 'number', default: 4, min: 2, max: 16, step: 1, label: 'Colors' },
      { name: 'scale', type: 'number', default: 1, min: 0.3, max: 3, step: 0.05, label: 'Scale' },
      { name: 'waveSpeed', type: 'number', default: 0.05, min: 0, max: 0.2, step: 0.005, label: 'Wave Speed' },
      { name: 'waveFrequency', type: 'number', default: 3, min: 1, max: 8, step: 0.1, label: 'Wave Frequency' },
      { name: 'waveAmplitude', type: 'number', default: 0.3, min: 0, max: 1, step: 0.01, label: 'Wave Amplitude' },
      { name: 'contrast', type: 'number', default: 1, min: 0.5, max: 2.5, step: 0.05, label: 'Contrast' },
      { name: 'brightness', type: 'number', default: 0, min: -0.5, max: 0.5, step: 0.01, label: 'Brightness' },
      { name: 'enableMouseInteraction', type: 'boolean', default: true, label: 'Mouse Interaction' },
      {
        name: 'mouseEffect',
        type: 'select',
        default: 'erase',
        options: ['erase', 'reveal', 'ripple'],
        label: 'Mouse Effect'
      },
      { name: 'mouseRadius', type: 'number', default: 0.3, min: 0.05, max: 1, step: 0.01, label: 'Mouse Radius' },
      { name: 'mouseStrength', type: 'number', default: 1, min: 0, max: 2, step: 0.05, label: 'Mouse Strength' },
      { name: 'trail', type: 'number', default: 0.5, min: 0, max: 1, step: 0.05, label: 'Trail' },
      { name: 'clickRipple', type: 'boolean', default: true, label: 'Click Ripple' },
      { name: 'intro', type: 'boolean', default: true, label: 'Intro' },
      { name: 'disableAnimation', type: 'boolean', default: false, label: 'Disable Animation' }
    ]
  },
  {
    id: 'gradient-ascii',
    label: 'Gradient ASCII',
    component: () => import('../../../content/Backgrounds/GradientASCII/GradientASCII.jsx'),
    installCommand: 'npx shadcn@latest add "https://reactbits.dev/default/backgrounds/gradient-ascii"',
    props: [
      {
        name: 'colors',
        type: 'colorArray',
        default: ['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8'],
        label: 'Colors',
        minItems: 2,
        maxItems: 8
      },
      {
        name: 'shape',
        type: 'select',
        default: 'horizon',
        options: ['horizon', 'pinch', 'rise', 'eclipse'],
        label: 'Shape'
      },
      {
        name: 'characters',
        type: 'select',
        default: ' =+xX0S8#@',
        options: [
          { value: ' =+xX0S8#@', label: 'Letters' },
          { value: ' .:-=+*#%@', label: 'Classic' },
          { value: ' 01', label: 'Binary' },
          { value: ' ░▒▓█', label: 'Blocks' },
          { value: ' .·•●', label: 'Dots' }
        ],
        label: 'Characters'
      },
      {
        name: 'clickEffect',
        type: 'select',
        default: 'wave',
        options: ['wave', 'burst', 'none'],
        label: 'Click Effect'
      },
      { name: 'cellSize', type: 'number', default: 18, min: 8, max: 40, step: 1, label: 'Cell Size' },
      { name: 'density', type: 'number', default: 0.8, min: 0, max: 1, step: 0.01, label: 'Density' },
      { name: 'glyphOpacity', type: 'number', default: 0.85, min: 0, max: 1, step: 0.01, label: 'Glyph Opacity' },
      {
        name: 'gradientOpacity',
        type: 'number',
        default: 0.9,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Gradient Opacity'
      },
      { name: 'glow', type: 'number', default: 0.2, min: 0, max: 1.5, step: 0.05, label: 'Glow' },
      { name: 'depthOfField', type: 'number', default: 0, min: 0, max: 1, step: 0.01, label: 'Depth of Field' },
      { name: 'flicker', type: 'number', default: 0.2, min: 0, max: 1, step: 0.01, label: 'Flicker' },
      { name: 'softness', type: 'number', default: 0.5, min: 0, max: 1, step: 0.01, label: 'Softness' },
      { name: 'scale', type: 'number', default: 1, min: 0.4, max: 2.5, step: 0.05, label: 'Scale' },
      { name: 'flow', type: 'number', default: 0.5, min: 0, max: 2, step: 0.05, label: 'Flow' },
      { name: 'speed', type: 'number', default: 1, min: 0, max: 3, step: 0.05, label: 'Speed' },
      { name: 'grain', type: 'number', default: 0.08, min: 0, max: 0.4, step: 0.01, label: 'Grain' },
      { name: 'variation', type: 'number', default: 0, min: 0, max: 20, step: 1, label: 'Variation' },
      {
        name: 'scrambleRadius',
        type: 'number',
        default: 0.1,
        min: 0.02,
        max: 0.4,
        step: 0.01,
        label: 'Scramble Radius'
      },
      { name: 'mouseInteraction', type: 'boolean', default: true, label: 'Mouse Interaction' },
      { name: 'intro', type: 'boolean', default: true, label: 'Intro' },
      { name: 'lightMode', type: 'boolean', default: false, label: 'Light Mode' }
    ]
  },
  {
    id: 'grainient',
    label: 'Grainient',
    component: () => import('../../../content/Backgrounds/Grainient/Grainient.jsx'),
    installCommand: 'npx shadcn@latest add "https://reactbits.dev/default/backgrounds/grainient"',
    props: [
      {
        name: 'colors',
        type: 'colorArray',
        default: ['#120f17', '#2a0f0a', '#9a3412', '#f97316', '#fed7aa'],
        label: 'Colors',
        minItems: 2,
        maxItems: 8
      },
      { name: 'type', type: 'select', default: 'linear', options: ['linear', 'radial'], label: 'Type' },
      { name: 'angle', type: 'number', default: 55, min: 0, max: 360, step: 1, label: 'Angle' },
      { name: 'bands', type: 'number', default: 1, min: 1, max: 6, step: 1, label: 'Bands' },
      { name: 'softness', type: 'number', default: 1, min: 0, max: 1, step: 0.01, label: 'Softness' },
      { name: 'flow', type: 'number', default: 0.8, min: 0, max: 2, step: 0.05, label: 'Flow' },
      { name: 'scale', type: 'number', default: 1, min: 0.25, max: 3, step: 0.05, label: 'Scale' },
      { name: 'speed', type: 'number', default: 1, min: 0, max: 3, step: 0.05, label: 'Speed' },
      { name: 'silk', type: 'number', default: 0.35, min: 0, max: 1, step: 0.01, label: 'Silk' },
      { name: 'grainAmount', type: 'number', default: 0.08, min: 0, max: 0.3, step: 0.01, label: 'Grain Amount' },
      { name: 'grainSize', type: 'number', default: 1.2, min: 0.5, max: 4, step: 0.1, label: 'Grain Size' },
      { name: 'contrast', type: 'number', default: 1, min: 0.5, max: 1.6, step: 0.01, label: 'Contrast' },
      { name: 'saturation', type: 'number', default: 1, min: 0, max: 2, step: 0.01, label: 'Saturation' },
      { name: 'variation', type: 'number', default: 0, min: 0, max: 20, step: 1, label: 'Variation' },
      { name: 'stir', type: 'number', default: 1, min: 0, max: 2, step: 0.05, label: 'Stir' },
      { name: 'grainAnimated', type: 'boolean', default: true, label: 'Animated Grain' },
      { name: 'interactive', type: 'boolean', default: true, label: 'Interactive' },
      { name: 'clickSwirl', type: 'boolean', default: true, label: 'Click Swirl' },
      { name: 'intro', type: 'boolean', default: true, label: 'Intro' },
      { name: 'lightMode', type: 'boolean', default: false, label: 'Light Mode' }
    ]
  },
  {
    id: 'grid-motion',
    label: 'Grid Motion',
    component: () => import('../../../content/Backgrounds/GridMotion/GridMotion.jsx'),
    installCommand: 'npx shadcn@latest add "https://reactbits.dev/default/backgrounds/grid-motion"',
    props: [
      { name: 'rows', type: 'number', default: 4, min: 1, max: 8, step: 1, label: 'Rows' },
      { name: 'aspectRatio', type: 'number', default: 1.33, min: 0.5, max: 2.5, step: 0.05, label: 'Tile Ratio' },
      { name: 'gap', type: 'number', default: 16, min: 0, max: 40, step: 1, label: 'Gap' },
      { name: 'radius', type: 'number', default: 14, min: 0, max: 40, step: 1, label: 'Radius' },
      { name: 'angle', type: 'number', default: -12, min: -45, max: 45, step: 1, label: 'Angle' },
      { name: 'tilt', type: 'number', default: 0, min: 0, max: 65, step: 1, label: 'Tilt' },
      { name: 'speed', type: 'number', default: 24, min: 0, max: 160, step: 2, label: 'Speed' },
      {
        name: 'direction',
        type: 'select',
        default: 'alternate',
        label: 'Direction',
        options: [
          { value: 'alternate', label: 'Alternate' },
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' }
        ]
      },
      { name: 'parallax', type: 'number', default: 0.5, min: 0, max: 1, step: 0.05, label: 'Parallax' },
      { name: 'spotlight', type: 'number', default: 0.6, min: 0, max: 1, step: 0.05, label: 'Spotlight' },
      { name: 'dim', type: 'number', default: 0.35, min: 0, max: 0.9, step: 0.05, label: 'Dim' },
      { name: 'fade', type: 'number', default: 0.5, min: 0, max: 1, step: 0.05, label: 'Fade' },
      { name: 'grayscale', type: 'boolean', default: false, label: 'Grayscale' }
    ],
    fixedProps: {
      items: [
        'https://images.unsplash.com/photo-1705032033999-efa3082e1a4e?w=400&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1721407964262-f9864b562453?w=400&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1781155451576-ae65c8816d31?w=400&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1762846818262-33c197852fa8?w=400&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1709699714159-29bc3ac99486?w=400&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1776394254711-4a0d7345269a?w=400&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1763440519433-5467759054fc?w=400&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1724152312974-d4d48b8b36fd?w=400&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1781242629922-6f39cc3671cd?w=400&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1774009485852-13a515d32e36?w=400&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1781499455083-6ccc3beb20cd?w=400&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1772440337285-8b5674e1ee8a?w=400&q=70&auto=format&fit=crop'
      ]
    }
  },
  {
    id: 'laser-flow',
    label: 'Laser Flow',
    component: () =>
      import('../../../content/Animations/LaserFlow/LaserFlow.jsx').then(m => ({ default: m.LaserFlow })),
    installCommand: 'npx shadcn@latest add "https://reactbits.dev/default/animations/laser-flow"',
    props: [
      { name: 'color', type: 'color', default: '#3847ff', label: 'Color' },
      { name: 'beamPosition', type: 'number', default: 0.6, min: 0.1, max: 0.9, step: 0.01, label: 'Beam Position' },
      { name: 'surfaceLevel', type: 'number', default: 1, min: 0.3, max: 1, step: 0.01, label: 'Surface Level' },
      { name: 'intensity', type: 'number', default: 1.8, min: 0.3, max: 2, step: 0.05, label: 'Intensity' },
      { name: 'beamWidth', type: 'number', default: 1.5, min: 0.4, max: 3, step: 0.05, label: 'Beam Width' },
      { name: 'flare', type: 'number', default: 1.5, min: 0.5, max: 2, step: 0.05, label: 'Flare' },
      { name: 'spread', type: 'number', default: 1.5, min: 0.4, max: 2, step: 0.05, label: 'Spread' },
      { name: 'fog', type: 'number', default: 0.2, min: 0, max: 2, step: 0.05, label: 'Fog' },
      { name: 'dust', type: 'number', default: 1.6, min: 0, max: 2, step: 0.05, label: 'Dust' },
      { name: 'streaks', type: 'number', default: 1.5, min: 0, max: 2, step: 0.05, label: 'Streaks' },
      { name: 'dots', type: 'number', default: 1, min: 0, max: 2, step: 0.05, label: 'Dots' },
      { name: 'pulse', type: 'number', default: 1.5, min: 0, max: 2, step: 0.05, label: 'Pulse' },
      { name: 'speed', type: 'number', default: 1.5, min: 0, max: 3, step: 0.05, label: 'Speed' },
      { name: 'seed', type: 'number', default: 3, min: 0, max: 20, step: 1, label: 'Seed' },
      { name: 'mouseInteraction', type: 'boolean', default: true, label: 'Mouse Interaction' }
    ]
  },
  {
    id: 'prism',
    label: 'Prism',
    component: () => import('../../../content/Backgrounds/Prism/Prism.jsx'),
    installCommand: 'npx shadcn@latest add "https://reactbits.dev/default/backgrounds/prism"',
    props: [
      { name: 'colors', type: 'colorArray', default: [], label: 'Colors', minItems: 0, maxItems: 8 },
      {
        name: 'animationType',
        type: 'select',
        default: 'rotate',
        options: ['rotate', '3drotate', 'hover', 'static'],
        label: 'Animation'
      },
      { name: 'timeScale', type: 'number', default: 0.5, min: 0, max: 2, step: 0.05, label: 'Time Scale' },
      { name: 'glow', type: 'number', default: 1, min: 0.2, max: 3, step: 0.05, label: 'Glow' },
      { name: 'scale', type: 'number', default: 3.6, min: 1.5, max: 6, step: 0.1, label: 'Scale' },
      { name: 'height', type: 'number', default: 3.5, min: 1, max: 8, step: 0.1, label: 'Height' },
      { name: 'baseWidth', type: 'number', default: 5.5, min: 1, max: 10, step: 0.1, label: 'Base Width' },
      { name: 'hueShift', type: 'number', default: 0, min: 0, max: 360, step: 1, label: 'Hue Shift' },
      { name: 'colorFrequency', type: 'number', default: 1, min: 0.25, max: 4, step: 0.05, label: 'Color Frequency' },
      { name: 'saturation', type: 'number', default: 1.5, min: 0, max: 2, step: 0.05, label: 'Saturation' },
      { name: 'noise', type: 'number', default: 0, min: 0, max: 1, step: 0.01, label: 'Noise' },
      { name: 'hoverStrength', type: 'number', default: 2, min: 0, max: 4, step: 0.1, label: 'Hover Strength' },
      { name: 'inertia', type: 'number', default: 0.05, min: 0.01, max: 0.3, step: 0.01, label: 'Inertia' },
      { name: 'resolution', type: 'number', default: 0.5, min: 0.25, max: 1, step: 0.05, label: 'Resolution' },
      { name: 'interactive', type: 'boolean', default: true, label: 'Interactive' },
      { name: 'intro', type: 'boolean', default: true, label: 'Intro' },
      { name: 'lightMode', type: 'boolean', default: false, label: 'Light Mode' }
    ]
  },
  {
    id: 'side-rays',
    label: 'Side Rays',
    component: () => import('../../../content/Backgrounds/SideRays/SideRays.jsx'),
    installCommand: 'npx shadcn@latest add "https://reactbits.dev/default/backgrounds/side-rays"',
    props: [
      { name: 'rayColor1', type: 'color', default: '#FFC46B', label: 'Ray Color 1' },
      { name: 'rayColor2', type: 'color', default: '#96c8ff', label: 'Ray Color 2' },
      { name: 'blend', type: 'number', default: 0.6, min: 0, max: 1, step: 0.01, label: 'Blend' },
      {
        name: 'origin',
        type: 'select',
        default: 'top-right',
        options: ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'right', 'left'],
        label: 'Origin'
      },
      { name: 'speed', type: 'number', default: 2.5, min: 0, max: 6, step: 0.1, label: 'Speed' },
      { name: 'intensity', type: 'number', default: 2, min: 0.2, max: 4, step: 0.05, label: 'Intensity' },
      { name: 'spread', type: 'number', default: 2, min: 0.3, max: 4, step: 0.05, label: 'Spread' },
      { name: 'density', type: 'number', default: 5, min: 1, max: 20, step: 0.5, label: 'Density' },
      { name: 'sharpness', type: 'number', default: 0.5, min: 0, max: 1, step: 0.01, label: 'Sharpness' },
      { name: 'tilt', type: 'number', default: 0, min: -60, max: 60, step: 1, label: 'Tilt' },
      { name: 'falloff', type: 'number', default: 1.6, min: 0.5, max: 4, step: 0.05, label: 'Falloff' },
      { name: 'glow', type: 'number', default: 1, min: 0, max: 3, step: 0.05, label: 'Glow' },
      { name: 'saturation', type: 'number', default: 1, min: 0, max: 2, step: 0.05, label: 'Saturation' },
      { name: 'dust', type: 'number', default: 0, min: 0, max: 1, step: 0.01, label: 'Dust' },
      { name: 'mouseInfluence', type: 'number', default: 0.5, min: 0, max: 1, step: 0.01, label: 'Mouse Influence' },
      { name: 'opacity', type: 'number', default: 1, min: 0, max: 1, step: 0.01, label: 'Opacity' },
      { name: 'followMouse', type: 'boolean', default: true, label: 'Follow Mouse' },
      { name: 'intro', type: 'boolean', default: true, label: 'Intro' },
      { name: 'lightMode', type: 'boolean', default: false, label: 'Light Mode' }
    ]
  }
];

export const getBackgroundById = id => BACKGROUNDS.find(bg => bg.id === id);
export const getDefaultProps = background => {
  if (!background?.props) return {};
  return background.props.reduce((acc, prop) => {
    acc[prop.name] = prop.default;
    return acc;
  }, {});
};

export const getDocsPath = background => {
  if (!background?.id) return '/';
  const category = background.id === 'laser-flow' ? 'animations' : 'backgrounds';
  return `/${category}/${background.id}`;
};
