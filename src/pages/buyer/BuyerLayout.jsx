import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LanguageSelector from '../../components/LanguageSelector';
import Logo from '../../components/Logo';
import { LayoutDashboard, Search, Handshake, LogOut, UserCircle, ClipboardList, Menu, X, ChevronDown } from 'lucide-react';
import TeluguWordHelper from '../../components/TeluguWordHelper';

export default function BuyerLayout() {
  const { logout, profileIssue } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/buyer/dashboard', icon: LayoutDashboard },
    { name: 'Browse Crops', path: '/buyer/browse', icon: Search },
    { name: 'Requests', path: '/buyer/requests', icon: ClipboardList },
    { name: 'My Deals', path: '/buyer/deals', icon: Handshake },
  ];

  return (
    <div className="app-shell min-h-screen flex flex-col font-sans text-[var(--cream)]">
      {/* Top Nav */}
      <nav className="bg-[color-mix(in_srgb,var(--bg-card)_94%,transparent)] backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between gap-3 h-16">
            <div className="flex min-w-0 items-center">
              {/* Mobile menu button */}
              <button
                type="button"
                aria-label="Open navigation"
                className="lg:hidden -ml-2 mr-1 p-2 rounded-md text-[var(--muted)] hover:text-[var(--cream)] hover:bg-[var(--glass)] focus:outline-none"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="flex-shrink-0 flex items-center">
                <Logo className="w-8 h-8" />
                <span className="ml-2 text-lg sm:text-xl font-bold font-serif text-[var(--sun-2)]">Krishi Setu</span>
              </div>
              <div className="hidden lg:-my-px lg:ml-8 lg:flex lg:space-x-6">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`${
                        isActive
                          ? 'bg-[var(--bg-card-alt)] text-[var(--primary)] font-bold'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-alt)] hover:text-[var(--primary)]'
                      } inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="relative flex shrink-0 items-center gap-2">
              <button onClick={() => setAccountMenuOpen((open) => !open)} aria-expanded={accountMenuOpen} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm font-semibold text-[var(--primary-dark)] hover:bg-[var(--bg-card-alt)]">
                <UserCircle className="h-5 w-5 text-[var(--primary)]" />
                <span className="hidden sm:inline">Account</span><ChevronDown className="h-4 w-4" />
              </button>
              {accountMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-72 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 shadow-lg">
                  <div className="border-b border-[var(--border)] pb-3"><LanguageSelector /></div>
                  <div className="py-3"><TeluguWordHelper /></div>
                  <Link to="/buyer/profile" onClick={() => setAccountMenuOpen(false)} className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-card-alt)]"><UserCircle className="h-4 w-4" /> Profile</Link>
                  <button onClick={logout} className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[var(--danger)] hover:bg-red-50"><LogOut className="h-4 w-4" /> Sign out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar (Drawer) */}
      {mobileMenuOpen && (
        <div className="relative z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 flex w-[min(19rem,86vw)] flex-col bg-[var(--bg-2)] shadow-xl">
            <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--line)]">
              <span className="text-xl font-bold font-serif text-[var(--sun-2)]">Krishi Setu</span>
              <button
                type="button"
                className="p-2 text-[var(--muted)] hover:text-[var(--cream)] focus:outline-none"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`${
                      isActive ? 'bg-[var(--bg-card-alt)] text-[var(--primary)] font-bold' : 'text-[var(--text-primary)] hover:bg-[var(--bg-card-alt)]'
                    } group flex items-center px-2 py-3 text-base font-medium rounded-md`}
                  >
                    <Icon className={`${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--primary)]'} mr-4 h-6 w-6`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-[var(--border)] p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Tools</p>
              <LanguageSelector />
              <div><TeluguWordHelper /></div>
              <Link to="/buyer/profile" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[var(--primary)]"><UserCircle className="h-4 w-4" /> Profile</Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-up">
        {profileIssue && <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{profileIssue}</div>}
        <Outlet />
      </main>
    </div>
  );
}
