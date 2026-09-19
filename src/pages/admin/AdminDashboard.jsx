import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { ref, get, update, remove } from 'firebase/database';
import { ShieldCheck, UserX, CheckCircle, Search, LogOut } from 'lucide-react';
import Logo from '../../components/Logo';

export default function AdminDashboard() {
  const { logout, userData } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, all

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const usersList = [];
        snapshot.forEach((child) => {
          usersList.push({ id: child.key, ...child.val() });
        });
        setUsers(usersList);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const userRef = ref(db, `users/${userId}`);
      await update(userRef, { status: 'approved' });
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'approved' } : u));
    } catch (err) {
      alert("Error approving user: " + err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This will remove their data from the database and block their access.")) return;
    try {
      const userRef = ref(db, `users/${userId}`);
      await remove(userRef); // Remove the user node
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert("Error deleting user: " + err.message);
    }
  };

  const filteredUsers = users.filter(u => {
    if (u.role === 'admin') return false; // Hide admin users
    if (filter === 'all') return true;
    return u.status === filter;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-1)] text-[var(--cream)] font-sans">
      <nav className="bg-[rgba(15,46,31,0.78)] backdrop-blur-md border-b border-[var(--line)] sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <Logo className="w-8 h-8" />
              <span className="text-xl font-bold font-serif text-[var(--sun-2)]">Admin Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-[var(--muted)] hidden sm:block">{userData?.email}</span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-1.5 border border-[var(--line)] rounded-full text-sm font-medium text-[var(--cream)] hover:bg-[var(--line)] transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold">User Management</h1>
            <p className="text-[var(--muted)] mt-1">Approve or remove farmers and buyers.</p>
          </div>
          <div className="flex bg-[var(--glass)] p-1 rounded-full border border-[var(--line)]">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filter === 'pending' ? 'bg-[var(--sun-2)] text-[var(--ink)]' : 'text-[var(--muted)] hover:text-[var(--cream)]'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filter === 'approved' ? 'bg-[var(--sun-2)] text-[var(--ink)]' : 'text-[var(--muted)] hover:text-[var(--cream)]'}`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filter === 'all' ? 'bg-[var(--sun-2)] text-[var(--ink)]' : 'text-[var(--muted)] hover:text-[var(--cream)]'}`}
            >
              All Users
            </button>
          </div>
        </div>

        <div className="bg-[var(--glass)] border border-[var(--line)] backdrop-blur-md rounded-[20px] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--line)]">
              <thead className="bg-[rgba(15,46,31,0.5)]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--muted)] uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-[var(--muted)]">Loading users...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-[var(--muted)]">
                      No users found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[rgba(255,246,214,0.03)] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-[var(--sun)] rounded-full flex items-center justify-center text-[var(--ink)] font-bold">
                            {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-[var(--cream)]">{user.name}</div>
                            <div className="text-sm text-[var(--muted)]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'farmer' ? 'bg-[#3a674f] text-[#a0d2b3]' : 'bg-[#724d00] text-[#febe51]'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.status === 'approved' ? (
                          <span className="flex items-center text-sm text-green-400">
                            <CheckCircle className="w-4 h-4 mr-1.5" /> Approved
                          </span>
                        ) : (
                          <span className="flex items-center text-sm text-amber-400">
                            <ShieldCheck className="w-4 h-4 mr-1.5" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {user.status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="text-green-400 hover:text-green-300 mr-4 font-semibold transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-[#ff967e] hover:text-red-400 font-semibold transition-colors flex items-center justify-end w-full sm:w-auto sm:inline-flex"
                        >
                          <UserX className="w-4 h-4 mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
