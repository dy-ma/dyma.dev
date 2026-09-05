import drop from '@/content/projects/drop.md?raw';
import fabric from '@/content/projects/fabric.md?raw';
import redthing from '@/content/projects/redthing.md?raw';

export const projects = {
  drop: {
    title: 'Drop',
    date: 'Notes forthcoming',
    summary:
      'Moving things without making the journey everyone else’s problem.',
    body: drop,
  },
  fabric: {
    title: 'Fabric',
    date: 'Notes forthcoming',
    summary: 'The connective tissue between systems and teams.',
    body: fabric,
  },
  redthing: {
    title: 'Redthing',
    date: 'Notes forthcoming',
    summary: 'The red thing, pending a more responsible explanation.',
    body: redthing,
  },
} as const;

export type ProjectSlug = keyof typeof projects;
