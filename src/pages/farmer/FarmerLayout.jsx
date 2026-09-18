import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Sprout, LayoutDashboard, PlusCircle, Inbox, Handshake, LogOut, UserCircle } from 'lucide-react';
import TeluguWordHelper from '../../components/TeluguWordHelper';

export default function FarmerLayout() {
  const { logout, profileIssue } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/farmer/dashboard', icon: LayoutDashboard },
    { name: 'Add Crop', path: '/farmer/add-crop', icon: PlusCircle },
    { name: 'Buyer Requests', path: '/farmer/requests', icon: Inbox },
    { name: 'My Deals', path: '/farmer/deals', icon: Handshake },
    { name: 'Profile', path: '/farmer/profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Sprout className="h-8 w-8 text-green-600" />
                <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">Harvie</span>
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
                          ? 'border-green-500 text-gray-900'
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
            <div className="flex items-center">
              <TeluguWordHelper />
              <button
                onClick={logout}
                className="inline-flex items-center border border-transparent text-sm font-medium focus:outline-none btn-destructive"
              >
                <LogOut className="w-4 h-4 mr-2 hidden sm:block" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {profileIssue && <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{profileIssue}</div>}
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`${
                  isActive ? 'text-green-600' : 'text-gray-500 hover:text-gray-900'
                } flex flex-col items-center py-3 px-2 text-xs font-medium`}
              >
                <Icon className="w-6 h-6 mb-1" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
