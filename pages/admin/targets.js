import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function TargetsView() {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterUserId, setFilterUserId] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchTargets();
  }, [page, filterUserId]);

  const fetchTargets = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page, limit: 50 });
      if (filterUserId) query.append('userId', filterUserId);
      
      const res = await fetch(`/api/admin/targets?${query}`);
      const data = await res.json();
      
      if (data.success) {
        setTargets(data.targets);
        setTotalPages(data.pagination.pages);
      } else if (res.status === 401) {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Fetch targets error:', error);
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
      <Head><title>Targets - Admin Panel</title></Head>

      <div className="flex h-screen">
        <div className="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-red-500">🔴 Tracker Panel</h1>
          </div>
          <nav className="space-y-2 flex-1">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 rounded-xl">
              Dashboard
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 rounded-xl">
              Users
            </Link>
            <Link href="/admin/targets" className="flex items-center gap-3 px-4 py-3 bg-red-600/20 text-red-400 rounded-xl">
              Targets
            </Link>
          </nav>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 px-4 py-3">
            Logout
          </button>
        </div>

        <div className="flex-1 overflow-auto p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Targets</h2>
            <p className="text-gray-400 mt-1">Collected tracking data</p>
          </div>

          <div className="mb-6">
            <input
              type="text"
              value={filterUserId}
              onChange={(e) => { setFilterUserId(e.target.value); setPage(1); }}
              placeholder="Filter by User ID..."
              className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white w-full max-w-xs"
            />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">User ID</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">IP</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Browser/OS</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Referrer</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {loading ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                  ) : targets.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No targets found</td></tr>
                  ) : (
                    targets.map((target, idx) => (
                      <tr key={idx} className="hover:bg-gray-800/30">
                        <td className="px-6 py-4 text-sm font-mono">{target.userId}</td>
                        <td className="px-6 py-4 text-sm font-mono">{target.ip}</td>
                        <td className="px-6 py-4 text-sm">
                          {target.browser} / {target.os}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {target.location?.city || 'N/A'}, {target.location?.country || ''}
                          <br />
                          <span className="text-xs text-gray-500">{target.location?.isp}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 max-w-[150px] truncate">
                          {target.referrer}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                          {new Date(target.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-800 flex items-center justify-between">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-sm"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
