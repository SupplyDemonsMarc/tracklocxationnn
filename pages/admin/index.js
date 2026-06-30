import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, targets: 0, activeUsers: 0 });
  const [recentTargets, setRecentTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
    fetchRecentTargets();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, targetsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/targets?limit=1')
      ]);

      const usersData = await usersRes.json();
      const targetsData = await targetsRes.json();

      if (usersData.success) {
        setStats(prev => ({
          ...prev,
          users: usersData.users.length,
          activeUsers: usersData.users.filter(u => u.isActive).length
        }));
      }

      if (targetsData.success) {
        setStats(prev => ({
          ...prev,
          targets: targetsData.pagination.total
        }));
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  };

  const fetchRecentTargets = async () => {
    try {
      const res = await fetch('/api/admin/targets?limit=10');
      const data = await res.json();
      if (data.success) {
        setRecentTargets(data.targets);
      }
    } catch (error) {
      console.error('Targets fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    document.cookie = 'admin_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Head>
        <title>Admin Dashboard - Tracker Panel</title>
      </Head>

      {/* Sidebar */}
      <div className="flex h-screen">
        <div className="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-red-500">🔴 Tracker Panel</h1>
            <p className="text-sm text-gray-500 mt-1">Admin Control</p>
          </div>

          <nav className="space-y-2 flex-1">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-red-600/20 text-red-400 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 rounded-xl transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Users
            </Link>
            <Link href="/admin/targets" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 rounded-xl transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Targets
            </Link>
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-red-600/20 hover:text-red-400 rounded-xl transition-all mt-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-gray-400 mt-1">Overview of your tracking system</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">Total Users</span>
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold">{stats.users}</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">Total Targets</span>
                <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold">{stats.targets}</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">Active Users</span>
                <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold">{stats.activeUsers}</p>
            </div>
          </div>

          {/* Recent Targets Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-semibold">Recent Targets</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">IP</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Browser</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : recentTargets.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No targets yet
                      </td>
                    </tr>
                  ) : (
                    recentTargets.map((target, idx) => (
                      <tr key={idx} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono">{target.ip}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{target.browser}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {target.location?.city || 'Unknown'}, {target.location?.country || ''}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(target.timestamp).toLocaleString()}
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
