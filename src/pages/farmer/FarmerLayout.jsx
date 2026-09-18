import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Sprout, LayoutDashboard, PlusCircle, Inbox, Handshake, LogOut, UserCircle, Menu, X, TrendingUp } from 'lucide-react';
import TeluguWordHelper from '../../components/TeluguWordHelper';

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
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-[#1e1b14]">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                type="button"
                className="sm:hidden -ml-2 mr-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="flex-shrink-0 flex items-center">
                <Sprout className="h-8 w-8 text-[#3a674f]" />
                <span className="ml-2 text-xl font-bold font-serif text-[#033621]">Krishi Setu</span>
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
                          ? 'border-[#3a674f] text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
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
              <TeluguWordHelper />
              <button
                onClick={logout}
                className="inline-flex items-center border border-transparent text-sm font-medium focus:outline-none btn-destructive"
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
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
              <span className="text-xl font-bold font-serif text-[#033621]">Krishi Setu</span>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
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
                      isActive ? 'bg-[#f5ede1] text-[#033621] font-bold' : 'text-gray-700 hover:bg-gray-50'
                    } group flex items-center px-2 py-3 text-base font-medium rounded-md`}
                  >
                    <Icon className={`${isActive ? 'text-[#3a674f]' : 'text-gray-400 group-hover:text-gray-500'} mr-4 h-6 w-6`} />
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
