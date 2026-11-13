import { empowerPoster, posterWorkflow } from '../src/template-library/posterCatalog.js';
import { designCatalog } from './design-catalog.mjs';
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { listBoard } from './likes.mjs';
import { resourceItems } from '../src/template-library/resourceItems.js';

const handler = createMcpHandler(({ requestInfo }) => {
  const server = new McpServer({ name: 'design-assets', version: '1.0.0' });
  server.registerTool('list_design_assets', {
    description: 'List shared design library assets or images from a public Pinterest board.',
    inputSchema: z.object({
      category: z.enum(['Picture', 'Knowledge', 'Banner', 'Poster', 'Workflow']).optional(),
      board: z.string().optional()
    }),
    annotations: { readOnlyHint: true }
  }, async ({ category, board }) => {
    const items = board ? await listBoard(board) : [...resourceItems, posterWorkflow].filter(item => !category || item.category === category);
    const origin = new URL(requestInfo.url).origin;
    const assets = items.map(item => board
      ? { ...item, download: origin + '/api/likes/image?image=' + encodeURIComponent(item.image) }
      : { ...item, url: new URL(item.url, origin).href });
    return { content: [{ type: 'text', text: JSON.stringify({ items: assets }) }] };
  });
  server.registerTool('search_design_library', {
    description: 'Find presentation templates, poster assets, product copy, creative tools, and React Bits source for design work.',
    inputSchema: z.object({
      query: z.string().optional(),
      kind: z.enum(['Template', 'Asset', 'Creative Tool', 'React Bits']).optional()
    }),
    annotations: { readOnlyHint: true }
  }, async ({ query, kind }) => {
    const origin = new URL(requestInfo.url).origin;
    const words = (query ?? '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    const items = [...designCatalog, { ...empowerPoster, kind: 'Template' }, ...resourceItems, posterWorkflow].filter(item => {
      const searchable = [item.name, item.kind, item.category, item.description].join(' ').toLowerCase();
      return (!kind || item.kind === kind) && words.every(word => searchable.includes(word));
    }).map(item => ({
      ...item,
      url: new URL(item.url, origin).href,
      ...(item.editor && { editor: new URL(item.editor, origin).href }),
      ...(item.download && { download: new URL(item.download, origin).href }),
      ...(item.workflow && { workflow: new URL(item.workflow, origin).href })
    }));
    return {
      content: [{ type: 'text', text: JSON.stringify({ items }) }],
      structuredContent: { items }
    };
  });
  return server;
});

export function mcpResponse(request) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return new Response('Origin not allowed', { status: 403 });
  return handler.fetch(request);
}
