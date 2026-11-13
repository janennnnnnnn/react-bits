import CustomizeDropdown from './CustomizeDropdown';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, Download, ExternalLink, Link2, RotateCcw } from 'lucide-react';
import { customizeHtml, downloadSkill, loadEditableSource, original } from './customize';
import { deleteEffect, readEffects, saveEffect } from './effects';
import { resolveTheme, themes } from './themes';
import logoCatalog from './logos/catalog.json';

const logoFiles = import.meta.glob('./logos/*.{png,svg}', { eager: true, query: '?url', import: 'default' });
const logos = logoCatalog.map(item => ({ ...item, url: logoFiles['./logos/' + item.file] }));

function Color({ label, value, fallback, change, defaultLabel = 'Original' }) {
  return (
    <label className="tl-control">
      {label}
      <span>{value.toUpperCase() || defaultLabel}</span>
      <input type="color" value={value || fallback} onChange={event => change(event.target.value)} />
    </label>
  );
}

function Slider({ label, value, fallback, suffix, min, max, change }) {
  return (
    <label className="tl-control tl-range">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value === '' ? fallback : value}
        onChange={event => change(event.target.valueAsNumber)}
      />
      <output>{value === '' ? 'Original' : value + suffix}</output>
    </label>
  );
}

export default function TemplateDetail({ template, settings, onSettings, onBack, onRemove, onSource }) {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deletingEffect, setDeletingEffect] = useState(false);
  const [effects, setEffects] = useState([]);
  useEffect(() => {
    let active = true;
    readEffects()
      .then(list => {
        if (active) setEffects(list.sort((a, b) => b.created - a.created));
      })
      .catch(() => {
        if (active) setStatus('Could not read My Effects.');
      });
    return () => {
      active = false;
    };
  }, []);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const controller = useRef(null);
  useEffect(() => () => controller.current?.abort(), []);
  const effect = effects.find(item => item.id === settings.background);
  const [repairFailed, setRepairFailed] = useState('');
  const repairing = effect?.configuration && !effect.slideReady && repairFailed !== effect.id;
  useEffect(() => {
    if (!repairing) return;
    const controller = new AbortController();
    async function refreshEffect() {
      try {
        const { renderEffectImage } = await import('../tools/background-studio/utils/effectImage');
        const theme = effect.id.startsWith('light:') ? 'light' : 'dark';
        const image = await renderEffectImage(effect.configuration, theme, controller.signal);
        if (controller.signal.aborted) return;
        const refreshed = { ...effect, image, slideReady: true };
        setEffects(items => items.map(item => (item.id === effect.id ? refreshed : item)));
        await saveEffect(refreshed);
      } catch {
        if (!controller.signal.aborted) {
          setRepairFailed(effect.id);
          setStatus('Could not refresh this background. Save it again in Background Studio.');
        }
      }
    }
    refreshEffect();
    return () => controller.abort();
  }, [effect, repairing]);
  const logo = logos.find(item => item.id === settings.logo);
  const html = useMemo(() => customizeHtml(template, settings, { effect, logo }), [template, settings, effect, logo]);
  const previewHtml = useMemo(() => {
    if (!html || !template.shareable || !effect?.configuration) return html;
    const url = new URL('/studio-frame.html', window.location.origin);
    url.searchParams.set('effect', effect.configuration);
    url.searchParams.set('theme', effect.id.startsWith('light:') ? 'light' : 'dark');
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const canvas = doc.querySelector('.canvas');
    if (!canvas) return html;
    const frame = doc.createElement('iframe');
    frame.src = url.href;
    frame.className = 'deck-live-effect';
    frame.title = 'Animated background';
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');
    canvas.prepend(frame);
    return '<!doctype html>' + doc.documentElement.outerHTML;
  }, [html, template.skill, effect]);
  const theme = resolveTheme(settings);
  const modified = Object.keys(original).some(key => original[key] !== (settings[key] ?? original[key]));
  const change = (key, value) => onSettings({ ...settings, [key]: value });

  async function removeSelectedEffect(effect) {
    if (!effect || !window.confirm(`Delete “${effect.name}” from My Effects?`)) return;
    setDeletingEffect(true);
    try {
      await deleteEffect(effect.id);
      setEffects(items => items.filter(item => item.id !== effect.id));
      if (settings.background === effect.id) change('background', '');
      setStatus('Effect deleted.');
    } catch {
      setStatus('Could not delete this effect.');
    } finally {
      setDeletingEffect(false);
    }
  }

  async function loadSource() {
    controller.current = new AbortController();
    setLoading(true);
    setStatus('');
    try {
      const result = await loadEditableSource(template.url, controller.current.signal);
      await onSource({ ...template, ...result });
      setStatus('Editable HTML source loaded.');
    } catch (error) {
      if (error.name !== 'AbortError')
        setStatus('Could not load editable HTML from this link. Import the source as a ZIP to customize it.');
    } finally {
      setLoading(false);
    }
  }

  async function download() {
    setDownloading(true);
    try {
      await downloadSkill(template, settings, html, logo, effect);
      setStatus('HTML and skill package ready.');
    } catch (error) {
      setStatus(error.message || 'Could not prepare the download.');
    } finally {
      setDownloading(false);
    }
  }

  async function copyLink() {
    try {
      const url = new URL(window.location.href);
      url.search = '';
      url.searchParams.set('template', template.id);
      await navigator.clipboard.writeText(url.href);
      setStatus('Link copied. Recipients can preview the original deck and download its skill.');
    } catch {
      setStatus('Clipboard unavailable. Copy the address from your browser.');
    }
  }

  return (
    <section className="tl-detail">
      <div className="tl-crumb">
        <button onClick={onBack}>All Templates</button>
        <ChevronRight size={14} />
        <span>{template.category}</span>
        <ChevronRight size={14} />
        <span>{template.name}</span>
      </div>
      <div className="tl-detail-heading">
        <div>
          <h1>{template.name}</h1>
          {template.description && <p>{template.description}</p>}
        </div>
        <div className="tl-detail-actions">
          {template.url && (
            <a className="tl-action" href={template.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={16} /> Open original
            </a>
          )}
          {template.shareable && (
            <button className="tl-action" onClick={copyLink}>
              <Link2 size={16} /> Copy Link
            </button>
          )}
          <button className="tl-action tl-primary" disabled={!html || downloading || repairing} onClick={download}>
            <Download size={16} /> {downloading ? 'Preparing…' : 'Download HTML + Skill'}
          </button>
        </div>
      </div>
      <div className={template.kind === 'Poster' ? 'tl-stage tl-stage-poster' : 'tl-stage'}>
        <iframe
          title={template.name + ' preview'}
          src={html ? undefined : template.url}
          srcDoc={previewHtml}
          sandbox={template.shareable ? 'allow-scripts allow-same-origin' : 'allow-scripts'}
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="tl-customize-heading">
        <h2>Customize</h2>
        <button className="tl-action" disabled={!modified} onClick={() => onSettings(original)}>
          <RotateCcw size={16} /> Reset
        </button>
      </div>
      {html ? (
        <div className="tl-controls">
          <div className="tl-control">
            Theme
            <CustomizeDropdown
              label="Theme"
              value={theme.family ?? 'tech'}
              options={Object.entries(themes).map(([id, item]) => ({ id, name: item.name }))}
              onChange={value => change('theme', value)}
            />
          </div>
          <div className="tl-control">
            Background
            <CustomizeDropdown
              label="Background"
              value={effect?.id ?? ''}
              options={[
                { id: '', name: theme.backdrop ? 'Theme default' : 'Original' },
                ...effects.map(item => ({ ...item, saved: true }))
              ]}
              group={effects.length ? 'My Effects' : undefined}
              onChange={value => change('background', value)}
              onDelete={removeSelectedEffect}
              disabled={deletingEffect || Boolean(repairing)}
            />
          </div>
          <div className="tl-control">
            Logo
            {logo && <img className="tl-logo-choice" src={logo.url} alt="" />}
            <CustomizeDropdown
              label="Logo"
              value={settings.logo}
              options={[{ id: '', name: 'Original' }, ...logos]}
              onChange={value => change('logo', value)}
            />
          </div>
          <Color
            label="Text color"
            defaultLabel={theme.text?.toUpperCase()}
            value={settings.text}
            fallback={theme.text ?? (template.skill ? '#ffffff' : '#181818')}
            change={value => change('text', value)}
          />
          <div className="tl-control">
            Font
            <CustomizeDropdown
              label="Font"
              value={settings.font}
              options={[{ id: '', name: 'Original' }, ...['Sans', 'Serif', 'Mono'].map(name => ({ id: name, name }))]}
              onChange={value => change('font', value)}
            />
          </div>
          <div className="tl-control">
            Alignment
            <CustomizeDropdown
              label="Alignment"
              value={settings.align}
              options={[
                { id: '', name: 'Original' },
                { id: 'left', name: 'Left' },
                { id: 'center', name: 'Center' }
              ]}
              onChange={value => change('align', value)}
            />
          </div>
          <Slider
            label="Page padding"
            value={settings.padding}
            fallback={24}
            min={0}
            max={96}
            suffix=" px"
            change={value => change('padding', value)}
          />
          <Slider
            label="Content scale"
            value={settings.scale}
            min={60}
            max={140}
            suffix="%"
            change={value => change('scale', value)}
          />
        </div>
      ) : (
        <div className="tl-controls tl-source">
          <p>Load the linked HTML to customize it. If the source blocks access, import a ZIP instead.</p>
          <button className="tl-action" disabled={loading} onClick={loadSource}>
            {loading ? 'Loading…' : 'Load editable source'}
          </button>
        </div>
      )}
      {status && (
        <p role="status" className="tl-detail-status">
          {status}
        </p>
      )}
      {!template.sample && (
        <div className="tl-detail-actions tl-remove">
          {confirmRemove ? (
            <>
              <button className="tl-action" onClick={() => setConfirmRemove(false)}>
                Cancel
              </button>
              <button className="tl-action" onClick={() => onRemove(template)}>
                Confirm removal
              </button>
            </>
          ) : (
            <button className="tl-action" onClick={() => setConfirmRemove(true)}>
              Remove template
            </button>
          )}
        </div>
      )}
    </section>
  );
}
