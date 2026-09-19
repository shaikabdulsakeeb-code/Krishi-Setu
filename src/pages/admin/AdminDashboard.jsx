import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { ref, get, update, remove } from 'firebase/database';
import { ShieldCheck, UserX, CheckCircle, LogOut, X, AlertTriangle } from 'lucide-react';
import Logo from '../../components/Logo';

export default function AdminDashboard() {
  const { logout, userData } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, all

  const [approvingUser, setApprovingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // Checkbox states for approval modal
  const [verifyName, setVerifyName] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState(false);
  const [verifyId1, setVerifyId1] = useState(false);
  const [verifyId2, setVerifyId2] = useState(false);

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

  const handleApprove = async () => {
    if (!approvingUser) return;
    try {
      const userRef = ref(db, `users/${approvingUser.id}`);
      await update(userRef, { status: 'approved' });
      setUsers(users.map(u => u.id === approvingUser.id ? { ...u, status: 'approved' } : u));
      setApprovingUser(null);
      resetCheckboxes();
    } catch (err) {
      alert("Error approving user: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      const userRef = ref(db, `users/${deletingUser.id}`);
      await remove(userRef);
      setUsers(users.filter(u => u.id !== deletingUser.id));
      setDeletingUser(null);
    } catch (err) {
      alert("Error deleting user: " + err.message);
    }
  };

  const resetCheckboxes = () => {
    setVerifyName(false);
    setVerifyEmail(false);
    setVerifyId1(false);
    setVerifyId2(false);
  };

  const openApproveModal = (user) => {
    setApprovingUser(user);
    resetCheckboxes();
  };

  const filteredUsers = users.filter(u => {
    if (u.role === 'admin') return false;
    const userStatus = u.status || 'pending';
    if (filter === 'all') return true;
    return userStatus === filter;
  });

  const canApprove = () => {
    if (!approvingUser) return false;
    if (!verifyName || !verifyEmail) return false;
    if (approvingUser.role === 'farmer' && !verifyId1) return false;
    if (approvingUser.role === 'buyer' && (!verifyId1 || !verifyId2)) return false;
    return true;
  };

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
                    <tr 
                      key={user.id} 
                      className="hover:bg-[rgba(255,246,214,0.03)] transition-colors cursor-pointer"
                      onClick={() => (user.status || 'pending') === 'pending' && openApproveModal(user)}
                    >
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
                        {(user.status || 'pending') === 'approved' ? (
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
                        {(user.status || 'pending') !== 'approved' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); openApproveModal(user); }}
                            className="text-green-400 hover:text-green-300 mr-4 font-semibold transition-colors"
                          >
                            Review & Approve
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeletingUser(user); }}
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

      {/* Approval Modal */}
      {approvingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-[var(--bg-2)] border border-[var(--line)] rounded-[20px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--line)]">
              <h2 className="text-xl font-serif font-bold text-[var(--cream)]">Review & Approve User</h2>
              <button onClick={() => setApprovingUser(null)} className="text-[var(--muted)] hover:text-[var(--cream)] transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">
              <p className="text-sm text-[var(--muted)] mb-2">Please verify the following details before approving this user.</p>
              
              <label className="flex items-start gap-3 p-3 rounded-xl border border-[var(--line)] bg-[rgba(255,246,214,0.02)] cursor-pointer hover:bg-[rgba(255,246,214,0.05)] transition-colors">
                <input type="checkbox" checked={verifyName} onChange={(e) => setVerifyName(e.target.checked)} className="mt-1 w-4 h-4 text-[var(--sun-2)] bg-transparent border-[var(--line)] rounded focus:ring-[var(--sun-2)] focus:ring-2" />
                <div>
                  <div className="text-xs text-[var(--muted)] uppercase font-bold tracking-wider mb-1">Name</div>
                  <div className="text-sm text-[var(--cream)] font-medium">{approvingUser.name}</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-[var(--line)] bg-[rgba(255,246,214,0.02)] cursor-pointer hover:bg-[rgba(255,246,214,0.05)] transition-colors">
                <input type="checkbox" checked={verifyEmail} onChange={(e) => setVerifyEmail(e.target.checked)} className="mt-1 w-4 h-4 text-[var(--sun-2)] bg-transparent border-[var(--line)] rounded focus:ring-[var(--sun-2)] focus:ring-2" />
                <div>
                  <div className="text-xs text-[var(--muted)] uppercase font-bold tracking-wider mb-1">Email</div>
                  <div className="text-sm text-[var(--cream)] font-medium">{approvingUser.email}</div>
                </div>
              </label>

              {approvingUser.role === 'farmer' && (
                <label className="flex items-start gap-3 p-3 rounded-xl border border-[var(--line)] bg-[rgba(255,246,214,0.02)] cursor-pointer hover:bg-[rgba(255,246,214,0.05)] transition-colors">
                  <input type="checkbox" checked={verifyId1} onChange={(e) => setVerifyId1(e.target.checked)} className="mt-1 w-4 h-4 text-[var(--sun-2)] bg-transparent border-[var(--line)] rounded focus:ring-[var(--sun-2)] focus:ring-2" />
                  <div>
                    <div className="text-xs text-[var(--muted)] uppercase font-bold tracking-wider mb-1">Farmer ID</div>
                    <div className="text-sm text-[var(--cream)] font-medium">{approvingUser.farmerId || 'Not provided'}</div>
                  </div>
                </label>
              )}

              {approvingUser.role === 'buyer' && (
                <>
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-[var(--line)] bg-[rgba(255,246,214,0.02)] cursor-pointer hover:bg-[rgba(255,246,214,0.05)] transition-colors">
                    <input type="checkbox" checked={verifyId1} onChange={(e) => setVerifyId1(e.target.checked)} className="mt-1 w-4 h-4 text-[var(--sun-2)] bg-transparent border-[var(--line)] rounded focus:ring-[var(--sun-2)] focus:ring-2" />
                    <div>
                      <div className="text-xs text-[var(--muted)] uppercase font-bold tracking-wider mb-1">Trader ID</div>
                      <div className="text-sm text-[var(--cream)] font-medium">{approvingUser.traderId || 'Not provided'}</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-[var(--line)] bg-[rgba(255,246,214,0.02)] cursor-pointer hover:bg-[rgba(255,246,214,0.05)] transition-colors">
                    <input type="checkbox" checked={verifyId2} onChange={(e) => setVerifyId2(e.target.checked)} className="mt-1 w-4 h-4 text-[var(--sun-2)] bg-transparent border-[var(--line)] rounded focus:ring-[var(--sun-2)] focus:ring-2" />
                    <div>
                      <div className="text-xs text-[var(--muted)] uppercase font-bold tracking-wider mb-1">Business License</div>
                      <div className="text-sm text-[var(--cream)] font-medium">{approvingUser.businessLicense || 'Not provided'}</div>
                    </div>
                  </label>
                </>
              )}
            </div>
            <div className="p-6 border-t border-[var(--line)] flex justify-end gap-3 bg-[var(--bg-1)]">
              <button 
                onClick={() => setApprovingUser(null)} 
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-[var(--cream)] hover:bg-[rgba(255,255,255,0.05)] transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleApprove}
                disabled={!canApprove()}
                className="btn-success disabled:opacity-50 disabled:cursor-not-allowed rounded-full px-6 py-2.5"
              >
                Approve User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-[var(--bg-2)] border border-red-500/30 rounded-[20px] w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-[var(--cream)] mb-2">Delete User?</h2>
              <p className="text-sm text-[var(--muted)]">
                Are you sure you want to delete <span className="font-semibold text-white">{deletingUser.name}</span>? This action cannot be undone and will permanently remove their access and data.
              </p>
            </div>
            <div className="p-6 pt-0 flex flex-col gap-3">
              <button 
                onClick={handleDelete}
                className="btn-danger w-full py-3 rounded-xl text-base"
              >
                Yes, Delete User
              </button>
              <button 
                onClick={() => setDeletingUser(null)} 
                className="w-full py-3 rounded-xl text-sm font-semibold text-[var(--cream)] border border-[var(--line)] hover:bg-[rgba(255,255,255,0.05)] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
