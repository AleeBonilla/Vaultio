import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-[#0066CC] focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
      >
        Saltar al contenido principal
      </a>
      <Sidebar />
      <TopNav />
      <main id="main-content" className="pt-16 lg:ml-64" tabIndex={-1}>
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
