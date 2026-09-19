import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import VoiceAgent from '../../components/VoiceAgent';
import LanguageSelector from '../../components/LanguageSelector';
import Logo from '../../components/Logo';
import { LayoutDashboard, Search, Handshake, LogOut, UserCircle, ClipboardList, Menu, X } from 'lucide-react';
import TeluguWordHelper from '../../components/TeluguWordHelper';

export default function BuyerLayout() {
  const { logout, profileIssue } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/buyer/dashboard', icon: LayoutDashboard },
    { name: 'Browse Crops', path: '/buyer/browse', icon: Search },
    { name: 'Requests', path: '/buyer/requests', icon: ClipboardList },
    { name: 'My Deals', path: '/buyer/deals', icon: Handshake },
    { name: 'Profile', path: '/buyer/profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans text-[var(--cream)]">
      {/* Top Nav */}
      <nav className="bg-[rgba(15,46,31,0.78)] backdrop-blur-md border-b border-[var(--line)] sticky top-0 z-20 rounded-b-2xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                type="button"
                className="sm:hidden -ml-2 mr-2 p-2 rounded-md text-[var(--muted)] hover:text-[var(--cream)] hover:bg-[var(--glass)] focus:outline-none"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="flex-shrink-0 flex items-center">
                <Logo className="w-8 h-8" />
                <span className="ml-2 text-xl font-bold font-serif text-[var(--sun-2)]">Krishi Setu</span>
              </div>
              <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-8">
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
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <VoiceAgent />
              <TeluguWordHelper />
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-1.5 border border-[var(--line)] rounded-full text-sm font-medium text-[var(--clay)] hover:bg-[var(--line)] transition-colors"
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
        <div className="relative z-40 sm:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-[var(--bg-2)] shadow-xl">
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
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-up">
        {profileIssue && <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{profileIssue}</div>}
        <Outlet />
      </main>
    </div>
  );
}
