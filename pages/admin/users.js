import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({ username: '', password: '', limit: '' });
  const [newLimit, setNewLimit] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else if (res.status === 401) {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('/api/admin/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUser.username,
          password: newUser.password,
          limit: newUser.limit || 0
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`✅ User ${data.user.username} created with ID: ${data.user.userId}`);
        setNewUser({ username: '', password: '', limit: '' });
        setShowAddModal(false);
        fetchUsers();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Connection error');
    }
  };

  const handleSetLimit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('/api/admin/set-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.userId,
          limit: newLimit
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`✅ Limit for ${selectedUser.username} set to ${newLimit}`);
        setShowLimitModal(false);
        setNewLimit('');
        setSelectedUser(null);
        fetchUsers();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Connection error');
    }
  };

  const handleLogout = async () => {
    document.cookie = 'admin_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Head><title>Users - Admin Panel</title></Head>

      <div className="flex h-screen">
        <div className="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-red-500">🔴 Tracker Panel</h1>
          </div>
          <nav className="space-y-2 flex-1">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 rounded-xl">
              Dashboard
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 bg-red-600/20 text-red-400 rounded-xl">
              Users
            </Link>
            <Link href="/admin/targets" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 rounded-xl">
              Targets
            </Link>
          </nav>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 px-4 py-3">
            Logout
          </button>
        </div>

        <div className="flex-1 overflow-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Users</h2>
              <p className="text-gray-400 mt-1">Manage tracking users</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-all"
            >
              + Add User
            </button>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-xl ${message.startsWith('✅') ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
              {message}
            </div>
          )}

          {/* Add User Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">
                <h3 className="text-xl font-bold mb-6">Add New User</h3>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Username</label>
                    <input
                      type="text"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Password</label>
                    <input
                      type="text"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Limit (0 = no access, -1 = unlimited)</label>
                    <input
                      type="number"
                      value={newUser.limit}
                      onChange={(e) => setNewUser({...newUser, limit: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold">
                      Create User
                    </button>
                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Set Limit Modal */}
          {showLimitModal && selectedUser && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">
                <h3 className="text-xl font-bold mb-6">Set Limit - {selectedUser.username}</h3>
                <form onSubmit={handleSetLimit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">New Limit (-1 = unlimited)</label>
                    <input
                      type="number"
                      value={newLimit}
                      onChange={(e) => setNewLimit(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold">
                      Set Limit
                    </button>
                    <button type="button" onClick={() => { setShowLimitModal(false); setSelectedUser(null); }} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">User ID</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Username</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Limit</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Used</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {loading ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.userId} className="hover:bg-gray-800/30">
                        <td className="px-6 py-4 text-sm font-mono text-gray-300">{user.userId}</td>
                        <td className="px-6 py-4 text-sm">{user.username}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.limit === -1 ? 'bg-purple-600/20 text-purple-400' :
                            user.limit === 0 ? 'bg-red-600/20 text-red-400' :
                            'bg-blue-600/20 text-blue-400'
                          }`}>
                            {user.limit === -1 ? 'Unlimited' : user.limit}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">{user.usedCount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isActive ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => { setSelectedUser(user); setNewLimit(user.limit); setShowLimitModal(true); }}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-all"
                          >
                            Set Limit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
