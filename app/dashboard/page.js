'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [resending, setResending] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const isLoggedIn = document.cookie.includes('admin_session');
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [router]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/subscriptions?status=pending');
      const p = await res.json();
      setPending(p);

      const res2 = await fetch('/api/subscriptions?status=active');
      const a = await res2.json();
      setActive(a);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async () => {
    if (selected.length === 0) {
      alert('Please select at least one application');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/approve', {
        method: 'POST',
        body: JSON.stringify({ codes: selected }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (data.success) {
        alert(`✅ Approved ${data.approved} applications! Emails sent to clients.`);
        setSelected([]);
        fetchData();
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      alert('Network error. Please check your connection.');
      console.error(error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    document.cookie = 'admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

  const getFilteredPending = () => {
    if (filter === 'all') return pending;
    if (filter === 'construction') return pending.filter(p => p.service_type === 'construction');
    if (filter === 'trucking') return pending.filter(p => p.service_type === 'trucking');
    return pending;
  };

  const getFilteredActive = () => {
    if (activeFilter === 'all') return active;
    if (activeFilter === 'paid') return active.filter(a => (a.total_paid || 0) > 0);
    if (activeFilter === 'unpaid') return active.filter(a => (a.total_paid || 0) == 0);
    return active;
  };

  const filteredPending = getFilteredPending();
  const filteredActive = getFilteredActive();

  const toggleAll = (e) => {
    if (e.target.checked) {
      setSelected(filteredPending.map(p => p.code));
    } else {
      setSelected([]);
    }
  };

  const toggleSelect = (code) => {
    if (selected.includes(code)) {
      setSelected(selected.filter(c => c !== code));
    } else {
      setSelected([...selected, code]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">📊 Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Nkosih Z Trading – Debit Order Management</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Logout
            </button>
            <a
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              + New Application
            </a>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={handleApprove}
            disabled={loading || selected.length === 0}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              loading || selected.length === 0
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {loading ? '⏳ Processing...' : `✅ Approve Selected (${selected.length})`}
          </button>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('construction')}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                filter === 'construction'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🏗️ C---
            </button>
            <button
              onClick={() => setFilter('trucking')}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                filter === 'trucking'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🚛 T---
            </button>
          </div>
        </div>

        {/* ==================== PENDING ==================== */}
        <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">
              ⏳ Pending Approvals ({filteredPending.length})
            </h2>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="p-3 text-left text-gray-400 font-medium">
                    <input
                      type="checkbox"
                      onChange={toggleAll}
                      checked={selected.length === filteredPending.length && filteredPending.length > 0}
                      className="rounded border-gray-600 bg-gray-700"
                    />
                  </th>
                  <th className="p-3 text-left text-gray-400 font-medium">Code</th>
                  <th className="p-3 text-left text-gray-400 font-medium">Client</th>
                  <th className="p-3 text-left text-gray-400 font-medium">Service</th>
                  <th className="p-3 text-left text-gray-400 font-medium">Total</th>
                  <th className="p-3 text-left text-gray-400 font-medium">Monthly</th>
                  <th className="p-3 text-left text-gray-400 font-medium">Term</th>
                </tr>
              </thead>
              <tbody>
                {filteredPending.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-gray-500">
                      No pending applications
                    </td>
                  </tr>
                ) : (
                  filteredPending.map((p) => (
                    <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(p.code)}
                          onChange={() => toggleSelect(p.code)}
                          className="rounded border-gray-600 bg-gray-700"
                        />
                      </td>
                      <td className="p-3 font-mono text-sm text-blue-400">{p.code}</td>
                      <td className="p-3 text-white">{p.full_name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          p.service_type === 'construction' 
                            ? 'bg-blue-900/50 text-blue-300' 
                            : 'bg-orange-900/50 text-orange-300'
                        }`}>
                          {p.service_type}
                        </span>
                      </td>
                      <td className="p-3 text-green-400">R{p.total_price}</td>
                      <td className="p-3 text-white">R{p.monthly_amount}</td>
                      <td className="p-3 text-gray-400">{p.repayment_months}m</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="sm:hidden p-4 space-y-4">
            {filteredPending.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No pending applications</p>
            ) : (
              filteredPending.map((p) => (
                <div key={p.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(p.code)}
                        onChange={() => toggleSelect(p.code)}
                        className="rounded border-gray-600 bg-gray-700"
                      />
                      <span className="font-mono text-sm text-blue-400">{p.code}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      p.service_type === 'construction' 
                        ? 'bg-blue-900/50 text-blue-300' 
                        : 'bg-orange-900/50 text-orange-300'
                    }`}>
                      {p.service_type}
                    </span>
                  </div>
                  <p className="text-white font-medium">{p.full_name}</p>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Total</p>
                      <p className="text-green-400 font-semibold">R{p.total_price}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Monthly</p>
                      <p className="text-white font-semibold">R{p.monthly_amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Term</p>
                      <p className="text-gray-300">{p.repayment_months}m</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ==================== ACTIVE ==================== */}
        <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">
              ✅ Active Subscriptions ({active.length})
            </h2>
          </div>

          {/* Active Filter Buttons */}
          <div className="px-4 sm:px-6 py-3 border-b border-gray-700 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All ({active.length})
            </button>
            <button
              onClick={() => setActiveFilter('paid')}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                activeFilter === 'paid'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ✅ Paid ({active.filter(a => (a.total_paid || 0) > 0).length})
            </button>
            <button
              onClick={() => setActiveFilter('unpaid')}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                activeFilter === 'unpaid'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ⏳ Unpaid ({active.filter(a => (a.total_paid || 0) == 0).length})
            </button>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="p-3 text-left text-gray-400 font-medium">Code</th>
                  <th className="p-3 text-left text-gray-400 font-medium">Client</th>
                  <th className="p-3 text-left text-gray-400 font-medium">Service</th>
                  <th className="p-3 text-left text-gray-400 font-medium">Monthly</th>
                  <th className="p-3 text-left text-gray-400 font-medium">Total Paid</th>
                  <th className="p-3 text-left text-gray-400 font-medium">Approved On</th>
                  <th className="p-3 text-left text-gray-400 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredActive.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-gray-500">
                      No active subscriptions
                    </td>
                  </tr>
                ) : (
                  filteredActive.map((a) => (
                    <tr key={a.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                      <td className="p-3 font-mono text-sm text-green-400">{a.code}</td>
                      <td className="p-3 text-white">{a.full_name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          a.service_type === 'construction' 
                            ? 'bg-blue-900/50 text-blue-300' 
                            : 'bg-orange-900/50 text-orange-300'
                        }`}>
                          {a.service_type}
                        </span>
                      </td>
                      <td className="p-3 text-white">R{a.monthly_amount}</td>
                      <td className="p-3 text-green-400">R{a.total_paid || 0}</td>
                      <td className="p-3 text-gray-300 text-sm">
                        {a.approved_at ? new Date(a.approved_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3">
                        {a.total_paid == 0 ? (
                          <button
                            onClick={async () => {
                              if (!confirm('Resend approval email to this client?')) return;
                              setResending(true);
                              try {
                                const res = await fetch('/api/resend-approval', {
                                  method: 'POST',
                                  body: JSON.stringify({ code: a.code }),
                                  headers: { 'Content-Type': 'application/json' },
                                });
                                const data = await res.json();
                                alert(data.success ? '✅ Reminder email sent!' : '❌ Failed to send');
                              } catch (error) {
                                alert('Network error');
                              }
                              setResending(false);
                            }}
                            disabled={resending}
                            className="text-blue-400 hover:text-blue-300 text-xs font-medium transition disabled:opacity-50"
                          >
                            📧 Resend
                          </button>
                        ) : (
                          <span className="text-green-400 text-xs font-medium">✅ Paid</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="sm:hidden p-4 space-y-4">
            {filteredActive.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No active subscriptions</p>
            ) : (
              filteredActive.map((a) => (
                <div key={a.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-sm text-green-400">{a.code}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      a.service_type === 'construction' 
                        ? 'bg-blue-900/50 text-blue-300' 
                        : 'bg-orange-900/50 text-orange-300'
                    }`}>
                      {a.service_type}
                    </span>
                  </div>
                  <p className="text-white font-medium">{a.full_name}</p>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Monthly</p>
                      <p className="text-white font-semibold">R{a.monthly_amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Paid</p>
                      <p className="text-green-400 font-semibold">R{a.total_paid || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Approved</p>
                      <p className="text-gray-300 text-xs">
                        {a.approved_at ? new Date(a.approved_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {a.total_paid == 0 ? (
                    <button
                      onClick={async () => {
                        if (!confirm('Resend approval email to this client?')) return;
                        setResending(true);
                        try {
                          const res = await fetch('/api/resend-approval', {
                            method: 'POST',
                            body: JSON.stringify({ code: a.code }),
                            headers: { 'Content-Type': 'application/json' },
                          });
                          const data = await res.json();
                          alert(data.success ? '✅ Reminder sent!' : '❌ Failed');
                        } catch (error) {
                          alert('Network error');
                        }
                        setResending(false);
                      }}
                      disabled={resending}
                      className="text-blue-400 hover:text-blue-300 text-xs font-medium transition disabled:opacity-50 mt-3"
                    >
                      📧 Resend Email
                    </button>
                  ) : (
                    <span className="text-green-400 text-xs font-medium mt-3 inline-block">✅ Paid</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}