import { unzipSync, strFromU8 } from 'fflate';

const limit = 25 * 1024 * 1024;
const mime = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
  ico: 'image/x-icon',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mp3: 'audio/mpeg',
  json: 'application/json',
  js: 'text/javascript',
  mjs: 'text/javascript'
};

function readData(bytes, type) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(new Blob([bytes], { type }));
  });
}

export async function unpackTemplate(file) {
  if (!file || file.size > limit) throw new Error('Choose a ZIP file of 25 MB or less.');
  let expanded = 0;
  const files = unzipSync(new Uint8Array(await file.arrayBuffer()), {
    filter({ name, originalSize }) {
      if (name.endsWith('/') || name.startsWith('__MACOSX/')) return false;
      expanded += originalSize;
      if (expanded > limit * 2) throw new Error('The extracted files must fit within 50 MB.');
      return true;
    }
  });
  const names = Object.keys(files);
  const indexes = names.filter(name => /(^|\/)index\.html?$/i.test(name));
  const html = names.filter(name => /\.html?$/i.test(name));
  const entry =
    indexes.sort((a, b) => a.split('/').length - b.split('/').length)[0] ?? (html.length === 1 ? html[0] : null);
  if (!entry) throw new Error('Include an index.html file or a single HTML file in the ZIP.');

  const doc = new DOMParser().parseFromString(strFromU8(files[entry]), 'text/html');
  const origin = 'https://template.invalid';
  const folder = entry.includes('/') ? entry.slice(0, entry.indexOf('/') + 1) : '';
  function localPath(value, source) {
    if (!value || /^(#|[a-z][\w+.-]*:|\/\/)/i.test(value)) return null;
    try {
      const path = decodeURIComponent(new URL(value, origin + '/' + source).pathname.slice(1));
      return Object.hasOwn(files, path) ? path : Object.hasOwn(files, folder + path) ? folder + path : null;
    } catch {
      return null;
    }
  }

  const assets = new Map();
  async function asset(value, source) {
    const path = localPath(value, source);
    if (!path) return value;
    if (!assets.has(path)) assets.set(path, readData(files[path], mime[path.split('.').at(-1).toLowerCase()]));
    return (await assets.get(path)) + (value.includes('#') ? '#' + value.split('#').at(-1) : '');
  }

  async function css(text, source, seen = new Set()) {
    const urls = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"]*))\s*\)/gi;
    const imports = /@import\s+(?:url\(\s*)?(?:"([^"]+)"|'([^']+)'|([^\s);]+))\s*\)?\s*;/gi;
    const expanded = await replaceAsync(text, imports, async (match, a, b, c) => {
      const path = localPath(a ?? b ?? c, source);
      if (!path) return match;
      if (seen.has(path)) return '';
      return css(strFromU8(files[path]), path, new Set([...seen, path]));
    });
    return replaceAsync(
      expanded,
      urls,
      async (_, a, b, c) => 'url("' + (await asset((a ?? b ?? c).trim(), source)) + '")'
    );
  }

  doc.querySelectorAll('base, meta[http-equiv="refresh" i]').forEach(node => node.remove());
  await Promise.all(
    Array.from(doc.querySelectorAll('style, [style], [src], [poster], [srcset]'), async node => {
      if (node.tagName === 'STYLE')
        node.textContent = (await css(node.textContent, entry)).replace(/<\/style/gi, '<\\/style');
      if (node.hasAttribute('style')) node.setAttribute('style', await css(node.getAttribute('style'), entry));
      for (const attr of ['src', 'poster']) {
        if (!node.hasAttribute(attr)) continue;
        const value = node.getAttribute(attr);
        const resolved = await asset(value, entry);
        if (node.tagName === 'SCRIPT' && resolved !== value) node.removeAttribute('integrity');
        node.setAttribute(attr, resolved);
      }
      const srcset = node.getAttribute('srcset');
      if (srcset && !srcset.includes('data:')) {
        const candidates = await Promise.all(
          srcset.split(',').map(async item => {
            const [url, ...descriptor] = item.trim().split(/\s+/);
            return [await asset(url, entry), ...descriptor].join(' ');
          })
        );
        node.setAttribute('srcset', candidates.join(', '));
      }
    })
  );
  await Promise.all(
    Array.from(doc.querySelectorAll('link[rel~="stylesheet"][href]'), async node => {
      const path = localPath(node.getAttribute('href'), entry);
      if (!path) return;
      const style = doc.createElement('style');
      style.media = node.media;
      style.textContent = (await css(strFromU8(files[path]), path)).replace(/<\/style/gi, '<\\/style');
      node.replaceWith(style);
    })
  );
  return '<!doctype html>' + doc.documentElement.outerHTML;
}

async function replaceAsync(text, pattern, replace) {
  const replacements = await Promise.all(Array.from(text.matchAll(pattern), match => replace(...match)));
  let index = 0;
  return text.replace(pattern, () => replacements[index++]);
}

async function transact(mode, operation) {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('visual-jade-library', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('templates', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction('templates', mode);
      const request = operation(transaction.objectStore('templates'));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

export const getTemplates = () => transact('readonly', store => store.getAll());
export const saveTemplate = template => transact('readwrite', store => store.put(template));
export const deleteTemplate = id => transact('readwrite', store => store.delete(id));
