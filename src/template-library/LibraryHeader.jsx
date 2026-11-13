import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Search } from 'lucide-react';
import logo from '../assets/logos/react-bits-logo-small.svg';
import './library.css';

const menus = [
  ['Library', ['HTML', 'Poster']],
  ['Resources', ['Asset', 'Skills']]
];
export const starterItems = ['Introduction', 'Installation', 'MCP Server', 'Saved'];
export const libraryView = name => (name === 'HTML' ? '/' : '/?view=' + encodeURIComponent(name));

export default function LibraryHeader({ active, onSelect, onSearch, onHome }) {
  const [menu, setMenu] = useState(null);
  const nav = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    function dismiss(event) {
      if (!nav.current?.contains(event.target)) setMenu(null);
    }
    function shortcut(event) {
      if (event.key === 'Escape') setMenu(null);
    }
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', shortcut);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', shortcut);
    };
  }, []);

  function option(name, pending) {
    const content = (
      <>
        {name}
        {pending && <span className="tl-pending">待开发</span>}
      </>
    );
    return onSelect ? (
      <button
        key={name}
        aria-current={active === name ? 'page' : undefined}
        onClick={() => {
          onSelect(name);
          setMenu(null);
        }}
      >
        {content}
      </button>
    ) : (
      <Link key={name} to={libraryView(name)} onClick={() => setMenu(null)}>
        {content}
      </Link>
    );
  }

  const search = (
    <>
      <Search size={16} />
      <span>Search…</span>
      <kbd>⌘ K</kbd>
    </>
  );
  return (
    <header className="tl-header">
      <Link to="/" className="tl-logo" aria-label="Template Library home" onClick={onHome}>
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
              <div className="tl-popover">{options.map(name => option(name, label === 'Resources'))}</div>
            )}
          </div>
        ))}
        <Link
          className="tl-tools-link"
          to="/tools"
          aria-current={pathname.startsWith('/tools') ? 'location' : undefined}
          onClick={() => setMenu(null)}
        >
          Creative Tools
        </Link>
        {onSearch ? (
          <button className="tl-global-search" onClick={onSearch}>
            {search}
          </button>
        ) : (
          <Link className="tl-global-search" to="/?focus=search">
            {search}
          </Link>
        )}
      </nav>
    </header>
  );
}
