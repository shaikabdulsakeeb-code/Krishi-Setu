import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, PlusCircle, Inbox, Handshake, LogOut, UserCircle, Menu, X, TrendingUp } from 'lucide-react';
import VoiceAgent from '../../components/VoiceAgent';
import LanguageSelector from '../../components/LanguageSelector';
import Logo from '../../components/Logo';

export default function FarmerLayout() {
  const { logout, profileIssue } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/farmer/dashboard', icon: LayoutDashboard },
    { name: 'Add Crop', path: '/farmer/add-crop', icon: PlusCircle },
    { name: 'Buyer Requests', path: '/farmer/requests', icon: Inbox },
    { name: 'My Deals', path: '/farmer/deals', icon: Handshake },
    { name: 'Market', path: '/farmer/market-analysis', icon: TrendingUp },
    { name: 'Profile', path: '/farmer/profile', icon: UserCircle },
  ];

  return (
    <div className="app-shell min-h-screen flex flex-col font-sans text-[var(--cream)]">
      {/* Top Nav */}
      <nav className="bg-[rgba(11,42,32,0.92)] backdrop-blur-md border-b border-[var(--line)] sticky top-0 z-20 shadow-sm">
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
                          ? 'border-[var(--sun-2)] text-[var(--sun-2)]'
                          : 'border-transparent text-[var(--muted)] hover:border-[var(--line)] hover:text-[var(--cream)]'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 lg:gap-3">
              <div className="hidden lg:flex lg:items-center lg:gap-3">
                <LanguageSelector />
                <VoiceAgent />
              </div>
              <button
                onClick={logout}
                aria-label="Sign out"
                className="inline-flex items-center px-2.5 sm:px-3 py-2 border border-[var(--line)] rounded-full text-sm font-medium text-[#ffb4a8] hover:bg-[var(--glass)] transition-colors"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
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
                      isActive ? 'bg-[var(--glass)] text-[var(--sun-2)] font-bold' : 'text-[var(--cream)] hover:bg-[var(--glass)]'
                    } group flex items-center px-2 py-3 text-base font-medium rounded-md`}
                  >
                    <Icon className={`${isActive ? 'text-[var(--sun-2)]' : 'text-[var(--muted)] group-hover:text-[var(--cream)]'} mr-4 h-6 w-6`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-[var(--line)] p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Tools</p>
              <div className="flex items-center justify-between gap-3"><LanguageSelector /><VoiceAgent /></div>
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
