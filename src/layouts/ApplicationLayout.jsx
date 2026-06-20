import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const NAV = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    path: '/customers',
    label: 'Customers',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    path: '/products',
    label: 'Products',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    path: '/orders',
    label: 'Orders',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

function navLinkClass({ isActive }) {
  return `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'border border-blue-500 bg-white text-gray-900 shadow-sm'
      : 'border border-transparent text-gray-600 hover:bg-gray-50'
  }`;
}

function SidebarNav({ onNavigate }) {
  return (
    <>
      <div className="mb-8 px-2">
        <p className="text-sm font-semibold text-gray-900">Admin</p>
        <p className="text-xs text-gray-500">Console</p>
      </div>
      <nav className="space-y-1">
        {NAV.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={navLinkClass}
            onClick={onNavigate}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default function ApplicationLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-gray-200 px-4 py-6 md:flex">
        <SidebarNav />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <aside className="relative flex h-full w-64 flex-col border-r border-gray-200 bg-white px-4 py-6">
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium"
          >
            Menu
          </button>
          <span className="text-sm font-semibold text-gray-900">Admin Console</span>
        </header>

        <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 md:px-10 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
