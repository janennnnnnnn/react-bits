import { Palette, Video, Volume2 } from 'lucide-react';

export const TOOLS = [
  {
    id: 'background-studio',
    label: 'Background Studio',
    tagline: 'Animated backgrounds',
    icon: Palette,
    path: '/tools/background-studio',
    description:
      'Browse nine animated backgrounds, start from a preset and tune it live. Export the code, a high resolution image or a looping MP4 or WebM video, or share it as a link.'
  },
  {
    id: 'center-stage',
    label: 'Center Stage',
    tagline: 'Product shots and recordings',
    icon: Video,
    path: '/tools/center-stage',
    description: 'Turn screenshots and recordings into polished product shots. Perfect for launch videos or demos.'
  },
  {
    id: 'sound-lab',
    label: 'Sound Bits',
    tagline: 'Interface and video sounds',
    icon: Volume2,
    path: '/tools/sound-lab',
    description:
      'A library of polished sounds, from soft taps, toggles and notifications to risers, impacts and whooshes for video. Tune pitch, tone, length and space, then install a sound into your project with one command or download it as WAV, MP3 or OGG.'
  }
];

export const CREATIVE_TOOLS = TOOLS;
