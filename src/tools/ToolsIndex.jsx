import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { ToolCaseIcon } from '@hugeicons/core-free-icons';
import { LuArrowUpRight } from 'react-icons/lu';
import ReactBitsLogo from '../assets/logos/react-bits-logo.svg';
import { CREATIVE_TOOLS as TOOLS } from '../constants/Tools';
import ToolBackdrop from './ToolBackdrop';
import { TOOL_ICONS } from './toolIcons';
import '../css/tools-index.css';

const BLURBS = {
  'background-studio':
    'Pick an animated background, start from a preset, tune it live, then export the code, a 4K image or a looping video.',
  'sound-lab':
    'Interface and video sounds, tune them live, then install one with a single command or download WAV, MP3 or OGG.'
};

const FOLLOW = 0.16;
const FADE = 0.11;

const useHoverLight = () => {
  const cardRef = useRef(null);
  const wellRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    const well = wellRef.current;
    if (!card || !well) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const state = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, h: 0, th: 0, frame: 0 };

    const write = () => {
      well.style.setProperty('--mx', `${(state.x * 100).toFixed(2)}%`);
      well.style.setProperty('--my', `${(state.y * 100).toFixed(2)}%`);
      well.style.setProperty('--px', (state.x - 0.5).toFixed(4));
      well.style.setProperty('--py', (state.y - 0.5).toFixed(4));
      well.style.setProperty('--hover', state.h.toFixed(4));
    };

    const tick = () => {
      state.x += (state.tx - state.x) * FOLLOW;
      state.y += (state.ty - state.y) * FOLLOW;
      state.h += (state.th - state.h) * FADE;
      write();
      const moving = Math.abs(state.tx - state.x) + Math.abs(state.ty - state.y) + Math.abs(state.th - state.h);
      state.frame = moving > 0.0005 ? requestAnimationFrame(tick) : 0;
    };

    const wake = () => {
      if (!state.frame) state.frame = requestAnimationFrame(tick);
    };

    const aim = event => {
      const box = well.getBoundingClientRect();
      state.tx = Math.min(1.1, Math.max(-0.1, (event.clientX - box.left) / box.width));
      state.ty = Math.min(1.1, Math.max(-0.1, (event.clientY - box.top) / box.height));
    };

    const enter = event => {
      if (event.pointerType !== 'mouse') return;
      aim(event);
      if (state.h < 0.05) {
        state.x = state.tx;
        state.y = state.ty;
      }
      state.th = 1;
      wake();
    };

    const move = event => {
      if (event.pointerType !== 'mouse') return;
      aim(event);
      state.th = 1;
      wake();
    };

    const leave = () => {
      state.th = 0;
      state.tx = 0.5;
      state.ty = 0.5;
      wake();
    };

    card.addEventListener('pointerenter', enter);
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(state.frame);
      card.removeEventListener('pointerenter', enter);
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerleave', leave);
    };
  }, []);

  return { cardRef, wellRef };
};

function ToolCard({ tool, index }) {
  const { cardRef, wellRef } = useHoverLight();
  return (
    <Link
      ref={cardRef}
      to={tool.path}
      className={`pg-tile ct-card ct-card--${tool.id}`}
      style={{ '--ct-order': index }}
    >
      <div ref={wellRef} className="pg-well ct-well">
        <div className="ct-art" aria-hidden="true">
          <ToolBackdrop id={tool.id} />
          <ToolBackdrop id={tool.id} lit />
        </div>
        <div className="ct-lockup" aria-hidden="true">
          <img className="ct-logo" src={ReactBitsLogo} alt="" width="115" height="23" />
          <span className="ct-pill">
            <span className="ct-pill-icon">
              <HugeiconsIcon icon={TOOL_ICONS[tool.id]} size={17} strokeWidth={1.6} />
            </span>
            <span className="ct-pill-label">{tool.label}</span>
          </span>
        </div>
      </div>
      <div className="ct-caption">
        <div className="ct-caption-row">
          <h2 className="ct-name">{tool.label}</h2>
          <span className="ct-open">
            Open
            <LuArrowUpRight size={14} aria-hidden="true" />
          </span>
        </div>
        <p className="ct-desc">{BLURBS[tool.id] || tool.description}</p>
      </div>
    </Link>
  );
}

export default function ToolsIndex() {
  return (
    <main className="ct-main">
      <header className="ct-head">
        <p className="ct-eyebrow">
          <HugeiconsIcon icon={ToolCaseIcon} size={16} strokeWidth={1.8} /> Creative Tools
        </p>
        <h1 className="ct-title">Make your product look and sound its best</h1>
      </header>
      <div className="ct-grid">
        {TOOLS.map((tool, index) => (
          <ToolCard key={tool.id} tool={tool} index={index} />
        ))}
      </div>
    </main>
  );
}
