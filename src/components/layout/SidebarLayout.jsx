import Navbar from '../landingnew/Navbar/Navbar';
import Sidebar from '../navs/Sidebar';

export default function SidebarLayout({ children }) {
  return (
    <main className="app-container">
      <Navbar showDocs catalog />
      <section className="category-wrapper catalog-layout">
        <Sidebar catalog />
        {children}
      </section>
    </main>
  );
}
