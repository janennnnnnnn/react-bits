export function boardPath(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || !['www.pinterest.com', 'pinterest.com'].includes(url.hostname) ||
      !/^\/[\w-]+\/[\w%-]+\/?$/.test(url.pathname) || url.username || url.password ||
      /^\/(pin|ideas|search)\//.test(url.pathname)) throw new Error('Enter a public Pinterest board URL.');
  return url.pathname.replace(/\/$/, '');
}

const decode = value => value.replace(/&(?:amp|lt|gt|quot|apos|#\d+);/g, entity => {
  const named = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };
  const code = Number(entity.slice(2, -1));
  return named[entity] ?? (code <= 0x10ffff ? String.fromCodePoint(code) : '');
});

export async function listBoard(value) {
  const path = boardPath(value);
  const response = await fetch('https://www.pinterest.com' + path + '.rss', {
    redirect: 'error', signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error('Pinterest feed is unavailable.');
  const xml = await response.text();
  if (!xml.includes('<rss')) throw new Error('Pinterest did not return a public feed.');
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].flatMap(([, item]) => {
    const image = item.match(/https:\/\/i\.pinimg\.com\/[\w/.-]+/)?.[0];
    const url = item.match(/<link>(https:\/\/www\.pinterest\.com\/pin\/[\w-]+\/?)<\/link>/)?.[1];
    if (!image || !url) return [];
    return [{ image, url, name: decode(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || 'Pinterest image') }];
  });
}

export async function likesResponse(url) {
  try {
    if (url.pathname === '/api/likes') return Response.json(await listBoard(url.searchParams.get('board')));
    const image = url.searchParams.get('image') || '';
    if (!/^https:\/\/i\.pinimg\.com\/\d+x\/(?:[a-f0-9]{2}\/){3}[a-f0-9]+\.(jpg|png|webp|gif)$/i.test(image)) {
      return new Response('Invalid image', { status: 400 });
    }
    const result = await fetch(image, { redirect: 'error', signal: AbortSignal.timeout(12000) });
    if (!result.ok) throw new Error('Image unavailable.');
    return new Response(result.body, { headers: {
      'Content-Type': result.headers.get('Content-Type') || 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="' + image.split('/').at(-1) + '"'
    } });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 502 });
  }
}
