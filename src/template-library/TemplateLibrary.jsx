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
      sandbox={thumbnail ? '' : 'allow-scripts'}
      referrerPolicy="no-referrer"
      loading={thumbnail ? 'lazy' : undefined}
      tabIndex={thumbnail ? -1 : undefined}
    />
  );
}

function Upload({ kind, close, onSave }) {
  const [source, setSource] = useState('link');
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
      if (!template.name) throw new Error('Enter a template name.');
      if (source === 'link') {
        const url = new URL(data.get('url'));
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password)
          throw new Error('Enter an HTTP or HTTPS link.');
        template.url = url.href;
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
    <Modal title={`Upload ${kind} template`} close={busy ? () => {} : close}>
      <form className="tl-form" onSubmit={submit}>
        <fieldset disabled={busy}>
          <div className="tl-segments" aria-label="Import method">
            <button
              type="button"
              aria-pressed={source === 'link'}
              onClick={() => {
                setSource('link');
                setError('');
              }}
            >
              <Link2 size={16} /> HTML link
            </button>
            <button
              type="button"
              aria-pressed={source === 'zip'}
              onClick={() => {
                setSource('zip');
                setError('');
              }}
            >
              <FileArchive size={16} /> ZIP file
            </button>
          </div>
          <label>
            Name
            <input name="name" required maxLength={100} placeholder="Template name" />
          </label>
          <label>
            Category
            <select name="category">
              {categories.map(item => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          {source === 'link' ? (
            <label>
              HTML URL
              <input name="url" type="url" placeholder="https://example.com/index.html" required />
              <small>The site must allow embedding for an inline preview.</small>
            </label>
          ) : (
            <label>
              ZIP file
              <input name="zip" type="file" accept=".zip,application/zip" required />
              <small>Include index.html and its assets. Maximum ZIP size is 25 MB.</small>
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

export default function TemplateLibrary() {
  usePageSEO({ title: 'HTML Template Library', description: 'Browse and preview HTML templates.', path: '/' });
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view');
  const library = ['Poster', 'Asset', 'Skills', ...starterItems].includes(view) ? view : 'HTML';
  const isResources = library === 'Asset' || library === 'Skills';
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Newest');
  const [query, setQuery] = useState('');
  const [uploads, setUploads] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [localPreview, setPreview] = useState(null);
  const sharedPreview = samples.find(item => item.shareable && item.id === searchParams.get('template'));
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
  const all = (isResources ? resourceItems : [...uploads, ...samples])
    .filter(template => (template.kind ?? 'HTML') === library)
    .sort((a, b) => b.created - a.created);
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
    setCategory('All');
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
    browse('All', template.kind);
    setSort('Newest');
    setUploadOpen(false);
    openTemplate(template);
  }

  function openTemplate(template) {
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
              <span className="tl-pending">待开发</span>
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
              onClick={() => openTemplate(template)}
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
          <div className="tl-tabs" aria-label={isResources ? 'Resource type' : 'Library type'}>
            {(isResources ? ['Asset', 'Skills'] : ['HTML', 'Poster']).map(item => (
              <button key={item} aria-pressed={library === item} onClick={() => selectLibrary(item)}>
                {item}
              </button>
            ))}
          </div>
          {!isLibrary && !isResources ? (
            <>
              <h1>{library}</h1>
              <div className="tl-empty">待开发</div>
            </>
          ) : preview ? (
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
                {isLibrary && <button className="tl-upload" onClick={() => setUploadOpen(true)}>
                  <ArrowUpFromLine size={19} /> Upload
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
                <div className="tl-categories" aria-label="Template category">
                  {['All', ...(isResources ? new Set(all.map(item => item.category)) : categories)].map(item => (
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
              {items.length ? (
                <div className="tl-grid">
                  {items.map(template => (
                    <article className="tl-card" key={template.id}>
                      <div className="tl-thumbnail">
                        <Frame template={template} thumbnail />
                        <button
                          className="tl-cover"
                          onClick={() => openTemplate(template)}
                          aria-label={`Preview ${template.name}`}
                        />
                        {template.sample && <span className="tl-badge">Sample</span>}
                      </div>
                      <div className="tl-card-body">
                        <h2>{template.name}</h2>
                        <p>{template.description || template.category}</p>
                        <button className="tl-preview" onClick={() => openTemplate(template)}>
                          <ExternalLink size={16} /> Live Preview
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="tl-empty">
                  {all.length
                    ? isResources ? 'No resources match your search.' : 'No templates match your search.'
                    : isResources ? (library === 'Asset' ? 'No assets yet.' : 'No skills yet.')
                    : 'No templates yet. Upload a template to get started.'}
                </div>
              )}
            </>
          )}
        </main>
      </div>
      {uploadOpen && <Upload kind={library} close={() => setUploadOpen(false)} onSave={importTemplate} />}
    </div>
  );
}
