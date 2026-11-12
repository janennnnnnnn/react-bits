import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpFromLine, Bookmark, ChevronDown, ExternalLink, FileArchive, Link2, Search, X } from 'lucide-react';
import { samples } from './samples';
import { deleteTemplate, getTemplates, saveTemplate, unpackTemplate } from './storage';
import usePageSEO from '../hooks/usePageSEO';
import logo from '../assets/logos/react-bits-logo-small.svg';
import './library.css';

const categories = ['Presentation', 'Product', 'Solution', 'Exhibition'];
const menus = [
  ['Library', ['HTML', 'Poster']],
  ['Resources', ['Asset', 'Skills']],
  ['Creative Tools', ['Background', 'Text', 'Texture']]
];
const starterItems = ['Introduction', 'Installation', 'MCP Server', 'Saved'];

function Modal({ title, close, children, wide }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? 'tl-dialog tl-dialog-wide' : 'tl-dialog'}
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

function Upload({ close, onSave }) {
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
    <Modal title="Upload HTML template" close={busy ? () => {} : close}>
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
  const [library, setLibrary] = useState('HTML');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Newest');
  const [query, setQuery] = useState('');
  const [uploads, setUploads] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const [notice, setNotice] = useState('');
  const [menu, setMenu] = useState(null);
  const search = useRef(null);
  const nav = useRef(null);

  useEffect(() => {
    getTemplates()
      .then(setUploads)
      .catch(() => setNotice('Could not load templates stored in this browser.'));
    function shortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && search.current) {
        event.preventDefault();
        search.current.focus();
      }
      if (event.key === 'Escape') setMenu(null);
    }
    function dismiss(event) {
      if (!nav.current?.contains(event.target)) setMenu(null);
    }
    document.addEventListener('keydown', shortcut);
    document.addEventListener('pointerdown', dismiss);
    return () => {
      document.removeEventListener('keydown', shortcut);
      document.removeEventListener('pointerdown', dismiss);
    };
  }, []);

  const all = [...uploads, ...samples];
  const needle = query.trim().toLowerCase();
  const items = all.filter(
    item =>
      (category === 'All' || category === item.category) &&
      [item.name, item.category, item.description].some(value => value.toLowerCase().includes(needle))
  );
  items.sort((a, b) =>
    sort === 'Newest' ? b.created - a.created : (sort === 'A–Z' ? 1 : -1) * a.name.localeCompare(b.name)
  );

  function selectLibrary(value) {
    setLibrary(value);
    setMenu(null);
  }

  function browse(value) {
    selectLibrary('HTML');
    setCategory(value);
    setQuery('');
  }

  async function importTemplate(template) {
    await saveTemplate(template);
    setUploads(current => [...current, template]);
    browse('All');
    setSort('Newest');
    setUploadOpen(false);
    setPreview(template);
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
      <header className="tl-header">
        <Link to="/" className="tl-logo" aria-label="Template Library home" onClick={() => browse('All')}>
          <img src={logo} alt="" />
        </Link>
        <nav className="tl-nav" aria-label="Main navigation" ref={nav}>
          {menus.map(([label, options]) => (
            <div className="tl-menu" key={label}>
              <button
                aria-expanded={menu === label}
                onClick={() => setMenu(current => (current === label ? null : label))}
              >
                {label}
                <ChevronDown size={14} />
              </button>
              {menu === label && (
                <div className="tl-popover">
                  {options.map(name => (
                    <button
                      key={name}
                      aria-current={library === name ? 'page' : undefined}
                      onClick={() => selectLibrary(name)}
                    >
                      {name}
                      {name !== 'HTML' && <span className="tl-pending">待开发</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button
            className="tl-global-search"
            onClick={() => {
              selectLibrary('HTML');
              requestAnimationFrame(() => search.current?.focus());
            }}
          >
            <Search size={16} />
            <span>Search…</span>
            <kbd>⌘ K</kbd>
          </button>
        </nav>
      </header>
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
          {['All', ...categories].map(item => (
            <button
              key={item}
              aria-current={library === 'HTML' && category === item ? 'page' : undefined}
              onClick={() => browse(item)}
            >
              {item === 'All' ? 'All Templates' : item}
            </button>
          ))}
        </aside>
        <main className="tl-main">
          <div className="tl-tabs" aria-label="Library type">
            <button aria-pressed={library === 'HTML'} onClick={() => selectLibrary('HTML')}>
              HTML
            </button>
            <button aria-pressed={library === 'Poster'} onClick={() => selectLibrary('Poster')}>
              Poster
            </button>
          </div>
          {library !== 'HTML' ? (
            <>
              <h1>{library}</h1>
              <div className="tl-empty">待开发</div>
            </>
          ) : (
            <>
              <div className="tl-title">
                <h1>HTML Template</h1>
                <button className="tl-upload" onClick={() => setUploadOpen(true)}>
                  <ArrowUpFromLine size={19} /> Upload
                </button>
              </div>
              <div className="tl-toolbar">
                <label className="tl-search">
                  <Search size={19} />
                  <input
                    ref={search}
                    type="search"
                    aria-label="Search templates"
                    placeholder="Search"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                  />
                </label>
                <div className="tl-segments" aria-label="Sort templates">
                  {['Newest', 'A–Z', 'Z–A'].map(item => (
                    <button key={item} aria-pressed={sort === item} onClick={() => setSort(item)}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div className="tl-filters">
                <div className="tl-categories" aria-label="Template category">
                  {['All', ...categories].map(item => (
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
                          onClick={() => setPreview(template)}
                          aria-label={`Preview ${template.name}`}
                        />
                        {template.sample && <span className="tl-badge">Sample</span>}
                      </div>
                      <div className="tl-card-body">
                        <h2>{template.name}</h2>
                        <p>{template.description || template.category}</p>
                        <button className="tl-preview" onClick={() => setPreview(template)}>
                          <ExternalLink size={16} /> Live Preview
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="tl-empty">No templates match your search.</div>
              )}
            </>
          )}
        </main>
      </div>
      {uploadOpen && <Upload close={() => setUploadOpen(false)} onSave={importTemplate} />}
      {preview && (
        <Modal
          wide
          title={preview.name}
          close={() => {
            setPendingRemoval(null);
            setPreview(null);
          }}
        >
          <Frame template={preview} />
          <footer className="tl-preview-footer">
            <span>{preview.category}</span>
            {preview.url && (
              <a href={preview.url} target="_blank" rel="noopener noreferrer">
                Open original <ExternalLink size={14} />
              </a>
            )}
            {!preview.sample &&
              (pendingRemoval === preview.id ? (
                <div className="tl-removal">
                  <button onClick={() => setPendingRemoval(null)}>Cancel</button>
                  <button
                    onClick={() => {
                      setPendingRemoval(null);
                      removeTemplate(preview);
                    }}
                  >
                    Confirm removal
                  </button>
                </div>
              ) : (
                <button onClick={() => setPendingRemoval(preview.id)}>Remove</button>
              ))}
          </footer>
        </Modal>
      )}
    </div>
  );
}
