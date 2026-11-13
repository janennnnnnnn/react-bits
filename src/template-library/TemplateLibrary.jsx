import PosterWorkflowCard, { PosterWorkflowThumbnail } from "./PosterWorkflowCard";
import { empowerPoster, posterWorkflow } from './posterCatalog';
import LikesFolders from './LikesFolders';
import * as Dialog from '@radix-ui/react-dialog';
import { resourceItems } from './resourceItems';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpFromLine, Bookmark, ExternalLink, FileArchive, Link2, Search, X } from 'lucide-react';
import { samples } from './samples';
import TemplateDetail from './TemplateDetail';
import LibraryHeader, { starterItems } from './LibraryHeader';
import { original } from './customize';
import { deleteTemplate, getTemplates, saveTemplate, unpackTemplate } from './storage';
import usePageSEO from '../hooks/usePageSEO';
import './library.css';

const assetCategories = ['Picture', 'Knowledge', 'Banner', 'Poster', 'Font', 'Likes'];
const posterCategories = ['Social media', 'Exhibition'];
const categories = ['Presentation', 'Product', 'Solution', 'Exhibition'];
function Modal({ title, close, children }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="tl-dialog"
      aria-label={title}
      onCancel={event => {
        event.preventDefault();
        close();
      }}
      onClick={event => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="tl-dialog-content">
        <header>
          <h2>{title}</h2>
          <button className="tl-icon" aria-label="Close" onClick={close}>
            <X size={19} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}

function Frame({ template, thumbnail = false }) {
  return (
    <iframe
      title={template.name}
      src={template.url}
      srcDoc={template.html}
      sandbox={thumbnail && !template.editor ? '' : 'allow-scripts'}
      referrerPolicy="no-referrer"
      loading={thumbnail ? 'lazy' : undefined}
      tabIndex={thumbnail ? -1 : undefined}
    />
  );
}

function AssetImage({ file, name }) {
  const [url, setUrl] = useState();
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return <img className="tl-asset-image" src={url} alt={name} />;
}

function FontSample({ item }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    const face = new FontFace(item.id, `url("${item.url}")`);
    face.load().then(() => {
      if (!active) return;
      document.fonts.add(face);
      setLoaded(true);
    }).catch(() => {});
    return () => {
      active = false;
      document.fonts.delete(face);
    };
  }, [item.id, item.url]);

  return <span className="tl-resource-label" style={{ fontFamily: loaded ? item.id : undefined, fontSize: 32 }}>Aa 123</span>;
}

function ResourcePreview({ item, close, remove }) {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (item.media !== 'text') return;
    const controller = new AbortController();
    fetch(item.url, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error();
        return response.text();
      })
      .then(setContent)
      .catch(() => {
        if (!controller.signal.aborted) setStatus('Could not load this document.');
      });
    return () => controller.abort();
  }, [item]);

  async function copy() {
    try {
      if (item.media === 'text') await navigator.clipboard.writeText(content);
      else if (item.media === 'image' && item.filename.toLowerCase().endsWith('.png')) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': fetch(item.url).then(response => {
            if (!response.ok) throw new Error();
            return response.blob();
          }) })
        ]);
      } else await navigator.clipboard.writeText(new URL(item.url, location.origin).href);
      setStatus('Copied.');
    } catch {
      setStatus('Could not copy this asset.');
    }
  }

  return (
    <Dialog.Root open onOpenChange={open => { if (!open) close(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="tl-resource-overlay" />
        <Dialog.Content className="tl-dialog tl-dialog-wide tl-resource-dialog" aria-describedby={undefined}>
          <div className="tl-dialog-content">
            <header>
              <Dialog.Title>{item.name}</Dialog.Title>
              <Dialog.Close className="tl-icon" aria-label="Close"><X size={19} /></Dialog.Close>
            </header>
            {item.media === 'font' ? <FontSample item={item} /> : item.media === 'text' ? <pre className="tl-resource-text">{content || 'Loading…'}</pre> :
              item.media === 'video' ? <video className="tl-asset-image" src={item.url} controls playsInline /> :
                <img className="tl-asset-image" src={item.url} alt={item.name} />}
            <div className="tl-resource-actions">
              <button className="tl-action" onClick={copy} disabled={item.media === 'text' && !content}>
                {item.media === 'text' || item.filename.endsWith('.png') ? 'Copy' : 'Copy link'}
              </button>
              <a className="tl-action" href={item.url} download={item.filename}>Download</a>
              <button className="tl-action" onClick={() => remove(item)}>Delete</button>
            </div>
            {status && <p role="status">{status}</p>}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const pinterestBoards = [
  ['opendayposter', 'opendayposter'],
  ['social media', 'social-media'],
  ['ppt', 'ppt']
];

function pinterestBoardUrl(value) {
  const url = new URL(value);
  if (url.hostname !== 'pinterest.com' && !url.hostname.endsWith('.pinterest.com')) return null;
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length !== 2 || ['pin', 'ideas', 'search', 'business'].includes(parts[0])) return null;
  return 'https://www.pinterest.com/' + parts.join('/') + '/';
}

function FavoriteThumbnail({ item }) {
  if (item.image) return <AssetImage file={item.image} name={item.name} />;

  if (item.provider === 'Pinterest' && pinterestBoardUrl(item.url)) {
    return <span className="tl-resource-label">Pinterest board</span>;
  }

  const pinId = item.provider === 'Pinterest' && new URL(item.url).pathname.match(/^\/pin\/(\d+)\/?$/)?.[1];
  if (!pinId) return <span className="tl-resource-label">{item.provider} · Open original</span>;

  return (
    <iframe
      title={item.name}
      src={`https://assets.pinterest.com/ext/embed.html?id=${pinId}`}
      loading="lazy"
      referrerPolicy="no-referrer"
      sandbox="allow-scripts allow-same-origin allow-popups"
    />
  );
}

function Upload({ kind, favorite, close, onSave }) {
  const isAsset = kind === 'Asset';
  const [source, setSource] = useState(isAsset && !favorite ? 'image' : 'link');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError('');
    setBusy(true);
    try {
      const template = {
        id: crypto.randomUUID(),
        kind,
        name: data.get('name').trim(),
        category: data.get('category'),
        description: data.get('description').trim(),
        created: Date.now()
      };
      if (!template.name) throw new Error(isAsset ? 'Enter an asset name.' : 'Enter a template name.');
      if (source === 'link') {
        const url = new URL(data.get('url'));
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password)
          throw new Error('Enter an HTTP or HTTPS link.');
        if (favorite) {
          const host = url.hostname;
          const pinterest = host === 'pin.it' || host === 'pinterest.com' || host.endsWith('.pinterest.com');
          const rednote = host === 'xhslink.com' || host.endsWith('.xhslink.com') ||
            host === 'xiaohongshu.com' || host.endsWith('.xiaohongshu.com');
          if (!pinterest && !rednote) throw new Error('Enter a Pinterest or 小红书 share link.');
          template.provider = pinterest ? 'Pinterest' : '小红书';
          const cover = data.get('cover');
          if (cover?.size) {
            if (!['image/png', 'image/jpeg', 'image/webp'].includes(cover.type) || cover.size > 25 * 1024 * 1024) {
              throw new Error('Choose a PNG, JPEG, or WebP cover up to 25 MB.');
            }
            template.image = cover;
          }
        }
        template.url = url.href;
      } else if (source === 'image') {
        const file = data.get('image');
        if (!file?.size || !['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'].includes(file.type)) {
          throw new Error('Choose a PNG, JPEG, WebP, GIF, or SVG image.');
        }
        if (file.size > 25 * 1024 * 1024) throw new Error('Maximum image size is 25 MB.');
        const url = URL.createObjectURL(file);
        try {
          const image = new Image();
          image.src = url;
          await image.decode();
        } catch {
          throw new Error('Could not read this image.');
        } finally {
          URL.revokeObjectURL(url);
        }
        template.image = file;
      } else {
        template.html = await unpackTemplate(data.get('zip'));
      }
      await onSave(template);
    } catch (problem) {
      setError(problem.message || 'Could not import this template.');
      setBusy(false);
    }
  }

  return (
    <Modal title={favorite ? 'Add favorite link' : isAsset ? 'Upload Asset' : `Upload ${kind} template`} close={busy ? () => {} : close}>
      <form className="tl-form" onSubmit={submit}>
        <fieldset disabled={busy}>
          {!favorite && <div className="tl-segments" aria-label="Import method">
            <button
              type="button"
              aria-pressed={source === 'link'}
              onClick={() => {
                setSource('link');
                setError('');
              }}
            >
              <Link2 size={16} /> {isAsset ? 'Asset link' : 'HTML link'}
            </button>
            <button
              type="button"
              aria-pressed={source === (isAsset ? 'image' : 'zip')}
              onClick={() => {
                setSource(isAsset ? 'image' : 'zip');
                setError('');
              }}
            >
              <FileArchive size={16} /> {isAsset ? 'Image file' : 'ZIP file'}
            </button>
          </div>}
          <label>
            Name
            <input name="name" required maxLength={100} placeholder={isAsset ? "Asset name" : "Template name"} />
          </label>
          <label>
            Category
            <select name="category" defaultValue={favorite ? "Likes" : undefined}>
              {(favorite ? ["Likes"] : isAsset ? assetCategories.filter(item => item !== "Likes" && item !== "Font") : kind === "Poster" ? posterCategories : categories).map(item => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          {source === 'link' ? (
            <label>
              {isAsset ? 'Asset URL' : 'HTML URL'}
              <input name="url" type="url" placeholder="https://example.com/index.html" required />
              <small>{favorite ? 'Paste a Pinterest board, Pin, or 小红书 share link.' : 'The site must allow embedding for an inline preview.'}</small>
            </label>
          ) : source === 'image' ? (
            <label>
              Image file
              <input name="image" type="file" accept=".png,.jpg,.jpeg,.webp,.gif,.svg" required />
              <small>PNG, JPEG, WebP, GIF or SVG. Maximum size is 25 MB.</small>
            </label>
          ) : (
            <label>
              ZIP file
              <input name="zip" type="file" accept=".zip,application/zip" required />
              <small>Include index.html and its assets. Maximum ZIP size is 25 MB.</small>
            </label>
          )}
          {favorite && (
            <label>
              Cover image <span>(optional)</span>
              <input name="cover" type="file" accept=".png,.jpg,.jpeg,.webp" />
              <small>Use a cover for links without an inline preview. For Pinterest, use the full Pin URL to preview it automatically.</small>
            </label>
          )}
          <label>
            Description <span>(optional)</span>
            <input name="description" maxLength={200} />
          </label>
        </fieldset>
        {error && (
          <p role="alert" className="tl-error">
            {error}
          </p>
        )}
        <footer>
          <button type="button" onClick={close} disabled={busy}>
            Cancel
          </button>
          <button className="tl-primary" disabled={busy}>
            {busy ? 'Importing…' : 'Upload'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}

function PosterToolbar({ poster, onBack }) {
  const [status, setStatus] = useState('');

  async function copyCode() {
    setStatus('Copying…');
    try {
      const response = await fetch(poster.editor);
      if (!response.ok) throw new Error('Could not load HTML');
      const html = await response.text();
      const assetBase = new URL('./assets/', response.url).href;
      await navigator.clipboard.writeText(html.replace(/(?<=[("'=])assets\//g, assetBase));
      setStatus('Copied');
    } catch {
      setStatus('Copy failed. Try again.');
    }
  }

  return (
    <div className="tl-title tl-poster-toolbar">
      <nav className="tl-crumb" aria-label="Breadcrumb">
        <button type="button" onClick={onBack}>Poster</button>
        <span aria-hidden="true">›</span>
        <span aria-current="page">{poster.name}</span>
      </nav>
      <div className="tl-poster-actions">
        <span role="status">{status}</span>
        <button type="button" className="tl-action" onClick={copyCode} disabled={status === 'Copying…'}>Copy Code</button>
        <a className="tl-action" href={poster.download} download>Download HTML + Workflow</a>
      </div>
    </div>
  );
}

export default function TemplateLibrary() {
  usePageSEO({ title: 'HTML Template Library', description: 'Browse and preview HTML templates.', path: '/' });
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view');
  const library = ['Poster', 'Asset', 'Skills', 'Workflow', ...starterItems].includes(view) ? view : 'HTML';
  const isResources = ['Asset', 'Skills', 'Workflow'].includes(library);
  const [category, setCategory] = useState(library === 'Workflow' ? 'Poster' : 'All');
  const [sort, setSort] = useState('Newest');
  const [query, setQuery] = useState('');
  const [hiddenResources, setHiddenResources] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('asset-library-hidden') || '[]');
    } catch {
      return [];
    }
  });
  const [localFonts, setLocalFonts] = useState([]);
  useEffect(() => {
    if (library !== 'Asset') return;
    const controller = new AbortController();
    fetch('/local-fonts/index.json', { signal: controller.signal })
      .then(response => response.ok ? response.json() : [])
      .then(items => { if (Array.isArray(items)) setLocalFonts(items); })
      .catch(() => {});
    return () => controller.abort();
  }, [library]);

  const [uploads, setUploads] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [localPreview, setPreview] = useState(null);
  const sharedPreview = [...samples, empowerPoster].find(item => item.shareable && item.id === searchParams.get('template'));
  const preview = localPreview ?? sharedPreview;
  const [customizations, setCustomizations] = useState({});
  const [notice, setNotice] = useState('');
  const search = useRef(null);

  useEffect(() => {
    getTemplates()
      .then(setUploads)
      .catch(() => setNotice('Could not load templates stored in this browser.'));
    function shortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && search.current) {
        event.preventDefault();
        search.current.focus();
      }
    }
    document.addEventListener('keydown', shortcut);
    return () => document.removeEventListener('keydown', shortcut);
  }, []);

  useEffect(() => {
    if (searchParams.get('focus') === 'search') search.current?.focus();
  }, [searchParams]);

  const isLibrary = library === 'HTML' || library === 'Poster';
  const all = library === 'Workflow' ? [{ ...posterWorkflow, category: 'Poster' }] : [...uploads, ...(isResources ? [...resourceItems, ...localFonts] : [...samples, empowerPoster])]
    .filter(template => !hiddenResources.includes(template.id))
    .filter(template => (template.kind ?? 'HTML') === library)
    .sort((a, b) => b.created - a.created);
  const browseCategories = library === 'Asset'
    ? assetCategories
    : library === 'Workflow' ? ['Poster', 'Video']
    : isResources
      ? [...new Set(all.map(item => item.category))]
      : library === 'Poster' ? posterCategories : categories;
  const needle = query.trim().toLowerCase();
  const items = all.filter(
    item =>
      (category === 'All' || category === item.category) &&
      [item.name, item.category, item.description].some(value => value.toLowerCase().includes(needle))
  );
  items.sort((a, b) =>
    sort === 'Newest' ? b.created - a.created : (sort === 'A–Z' ? 1 : -1) * a.name.localeCompare(b.name)
  );

  function closePreview() {
    setPreview(null);
    if (searchParams.has('template')) {
      const params = new URLSearchParams(searchParams);
      params.delete('template');
      setSearchParams(params, { replace: true });
    }
  }

  function selectLibrary(value) {
    const params = new URLSearchParams();
    if (value !== 'HTML') params.set('view', value);
    setSearchParams(params);
    setPreview(null);
    setCategory(value === 'Workflow' ? 'Poster' : 'All');
    setQuery('');
  }

  function browse(value, kind = isLibrary ? library : 'HTML') {
    selectLibrary(kind);
    setCategory(value);
    setQuery('');
  }

  async function importTemplate(template) {
    await saveTemplate(template);
    setUploads(current => [...current, template]);
    browse(template.provider ? 'Likes' : 'All', template.kind);
    setSort('Newest');
    setUploadOpen(false);
    if (!template.provider) openTemplate(template);
  }

  function openTemplate(template) {
    if (template.id === posterWorkflow.id) {
      setPreview(template);
      return;
    }
    const params = new URLSearchParams(searchParams);
    if (template.kind && template.kind !== 'HTML') params.set('view', template.kind);
    else params.delete('view');
    if (template.shareable) params.set('template', template.id);
    else params.delete('template');
    setSearchParams(params, { replace: true });
    setPreview(template.shareable ? null : template);
    window.scrollTo(0, 0);
  }

  async function updateSource(template) {
    await saveTemplate(template);
    setUploads(current => current.map(item => (item.id === template.id ? template : item)));
    setPreview(current => (current?.id === template.id ? template : current));
  }

  async function removeTemplate(template) {
    try {
      await deleteTemplate(template.id);
      setUploads(current => current.filter(item => item.id !== template.id));
      setPreview(null);
    } catch {
      setNotice('Could not remove the template.');
      setPreview(null);
    }
  }

  return (
    <div className="template-library">
      <LibraryHeader
        active={library}
        onSelect={selectLibrary}
        onHome={() => browse('All', 'HTML')}
        onSearch={() => {
          selectLibrary('HTML');
          requestAnimationFrame(() => search.current?.focus());
        }}
      />
      <div className="tl-layout">
        <aside className="tl-sidebar" aria-label="Library navigation">
          <p>Get Started</p>
          {starterItems.map(item => (
            <button key={item} aria-current={library === item ? 'page' : undefined} onClick={() => selectLibrary(item)}>
              {item === 'Saved' && <Bookmark size={16} />}
              {item}
              {item !== 'MCP Server' && <span className="tl-pending">待开发</span>}
            </button>
          ))}{' '}
          <hr />
          <p>Browse</p>
          <button
            className="tl-all-templates"
            aria-current={(isLibrary || isResources) && !preview ? 'page' : undefined}
            onClick={() => browse('All', isResources ? library : undefined)}
          >
            {isResources ? 'All Resources' : 'All Templates'}
          </button>
          {all.map(template => (
            <button
              className="tl-sidebar-template"
              key={template.id}
              title={template.name}
              aria-current={preview?.id === template.id ? 'page' : undefined}
              onClick={() => template.provider ? setCategory("Likes") : openTemplate(template)}
            >
              <span>{template.name}</span>
            </button>
          ))}
          {isLibrary && (
            <label className="tl-mobile-browse">
              <span>Browse</span>
              <select
                value={preview?.id ?? ''}
                onChange={event => {
                  const template = all.find(item => item.id === event.target.value);
                  if (template) openTemplate(template);
                  else browse('All');
                }}
              >
                <option value="">All Templates</option>
                {all.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </aside>
        <main className="tl-main">
          {(isResources || (isLibrary && !preview)) && (
            <div className="tl-tabs" aria-label={isResources ? 'Resource type' : 'Library type'}>
              {(isResources ? ['Asset', 'Skills', 'Workflow'] : ['HTML', 'Poster']).map(item => (
                <button key={item} aria-pressed={library === item} onClick={() => selectLibrary(item)}>
                  {item}
                </button>
              ))}
            </div>
          )}
          {!isLibrary && !isResources ? (
            <>
              <h1>{library}</h1>
              <div className="tl-empty">
                {library === 'MCP Server' ? (
                  <>
                    <p>Add this URL to your MCP client to find presentation templates, poster assets, product copy, and Creative Tools.</p>
                    <code>{window.location.origin}/mcp</code>
                    <p>Try “Find a presentation template and product copy for a sales deck” or “Find a React Bits animated background for a poster”.</p>
                    <p>Use the <a href="https://reactbits.dev/get-started/mcp" target="_blank" rel="noreferrer">React Bits shadcn MCP setup</a> to install components from the full registry.</p>
                  </>
                ) : '待开发'}
              </div>
            </>
           ) : preview?.id === posterWorkflow.id ? (
            <>
              <button className="tl-action" onClick={closePreview}>返回工作流</button>
              <a className="tl-action" href={posterWorkflow.url} target="_blank" rel="noreferrer">查看 PAX 工作流说明</a>
              <PosterWorkflowCard assets={[...resourceItems, ...uploads].filter(item =>
                item.kind === 'Asset' && item.url && !item.provider && !hiddenResources.includes(item.id))} />
            </>
          ) : preview?.image ? (
            <>
              <div className="tl-title">
                <h1>{preview.name}</h1>
                <button className="tl-upload" onClick={closePreview}>All Resources</button>
                <button className="tl-upload" onClick={() => removeTemplate(preview)}>Delete asset</button>
              </div>
              {preview.description && <p>{preview.description}</p>}
              <AssetImage file={preview.image} name={preview.name} />
            </>
          ) : preview?.editor ? (
            <>
              <PosterToolbar key={preview.id} poster={preview} onBack={closePreview} />
              <iframe title={preview.name} src={preview.editor} allow="autoplay" className="tl-poster-editor" />
            </>
          ) : preview && !preview.media ? (
            <TemplateDetail
              key={preview.id}
              template={preview}
              settings={customizations[preview.id] ?? original}
              onSettings={settings => setCustomizations(current => ({ ...current, [preview.id]: settings }))}
              onBack={closePreview}
              onSource={updateSource}
              onRemove={removeTemplate}
            />
          ) : (
            <>
              <div className="tl-title">
                <h1>{isResources ? library : `${library} Template`}</h1>
                {(isLibrary || library === 'Asset') && <button className="tl-upload" onClick={() => setUploadOpen(true)}>
                  <ArrowUpFromLine size={19} /> {library === "Asset" && category === "Likes" ? "Add link" : "Upload"}
                </button>}
              </div>
              <div className="tl-toolbar">
                <label className="tl-search">
                  <Search size={19} />
                  <input
                    ref={search}
                    type="search"
                    aria-label={isResources ? 'Search resources' : 'Search templates'}
                    placeholder="Search"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                  />
                </label>
                <div className="tl-segments" aria-label={isResources ? 'Sort resources' : 'Sort templates'}>
                  {['Newest', 'A–Z', 'Z–A'].map(item => (
                    <button key={item} aria-pressed={sort === item} onClick={() => setSort(item)}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div className="tl-filters">
                <div className="tl-categories" aria-label={isResources ? 'Resource category' : 'Template category'}>
                  {(library === 'Workflow' ? browseCategories : ['All', ...browseCategories]).map(item => (
                    <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>
                      {item}
                      {item === 'All' && <span>{all.length}</span>}
                    </button>
                  ))}
                </div>
                <span role="status">
                  Showing <strong>{items.length}</strong> of {all.length}
                </span>
              </div>
              {notice && (
                <p role="alert" className="tl-error">
                  {notice}
                </p>
              )}
              {library === 'Asset' && category === 'Likes' && (
                <LikesFolders query={query} boards={[
                  ...pinterestBoards.map(([name, slug]) => ({
                    id: slug, name, url: `https://www.pinterest.com/jiameiguo22/${slug}/`
                  })),
                  ...all.filter(item => item.provider === 'Pinterest' && pinterestBoardUrl(item.url))
                    .map(item => ({ ...item, url: pinterestBoardUrl(item.url) }))
                ]} />
              )}
              {library === 'Asset' && category === 'Font' && (
                <p>Poster and PPT: use Poppins for headings and body text, and D-DIN for numbers and data labels.</p>
              )}
              {items.length ? (
                <div className="tl-grid">
                  {items.map(template => (
                    <article className="tl-card" key={template.id}>
                      <div className="tl-thumbnail">
                        {template.id === posterWorkflow.id ? <PosterWorkflowThumbnail /> : template.provider ? <FavoriteThumbnail item={template} /> : template.media === 'font' ? <FontSample item={template} /> : template.media === 'image' ? <img className="tl-asset-image" src={template.url} alt="" loading="lazy" /> :
                          template.media === 'video' ? <video className="tl-asset-image" src={template.url} preload="metadata" muted playsInline /> :
                            template.media === 'text' ? <span className="tl-resource-label">Markdown</span> :
                              template.image ? <AssetImage file={template.image} name={template.name} /> : <Frame template={template} thumbnail />}
                        {!template.provider && <button
                          className="tl-cover"
                          onClick={() => openTemplate(template)}
                          aria-label={`Preview ${template.name}`}
                        />}
                        {template.sample && <span className="tl-badge">Sample</span>}
                      </div>
                      <div className="tl-card-body">
                        <h2>{template.name}</h2>
                        <p>{template.description || template.category}</p>
                        {template.provider ? (
                          <div className="tl-resource-actions">
                            <a className="tl-action" href={template.url} target="_blank" rel="noopener noreferrer">Open {template.provider}</a>
                            <button className="tl-action" onClick={() => removeTemplate(template)}>Delete</button>
                          </div>
                        ) : <button className="tl-preview" onClick={() => openTemplate(template)}>
                          <ExternalLink size={16} /> {template.id === posterWorkflow.id ? "打开画布" : "Live Preview"}
                        </button>}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="tl-empty">
                  {library === 'Workflow' && category === 'Video' && !needle ? 'No video workflows yet.' : all.length
                    ? isResources ? 'No resources match your search.' : 'No templates match your search.'
                    : isResources ? (library === 'Asset' ? (category === 'Likes' ? 'Add a Pinterest or 小红书 share link.' : 'No assets yet. Upload an asset to get started.') : 'No skills yet.')
                    : 'No templates yet. Upload a template to get started.'}
                </div>
              )}
            </>
          )}
        </main>
      </div>
      {isResources && preview?.media && preview.id !== posterWorkflow.id && (
        <ResourcePreview key={preview.id} item={preview} close={closePreview} remove={item => {
          const next = [...hiddenResources, item.id];
          localStorage.setItem('asset-library-hidden', JSON.stringify(next));
          setHiddenResources(next);
          closePreview();
        }} />
      )}
      {uploadOpen && <Upload kind={library} favorite={library === "Asset" && category === "Likes"} close={() => setUploadOpen(false)} onSave={importTemplate} />}
    </div>
  );
}
