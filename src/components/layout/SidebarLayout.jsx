import LibraryHeader from '../../template-library/LibraryHeader';
import { useSearch } from '../context/SearchContext/useSearch';
import Sidebar from '../navs/Sidebar';

export default function SidebarLayout({ children }) {
  const { toggleSearch } = useSearch();
  return (
    <main className="app-container tl-docs-header">
      <div className="tl-header-theme">
        <LibraryHeader onSearch={toggleSearch} />
      </div>
      <section className="category-wrapper catalog-layout">
        <Sidebar catalog />
        {children}
      </section>
    </main>
  );
}
