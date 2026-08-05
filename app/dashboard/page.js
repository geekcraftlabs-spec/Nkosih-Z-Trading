'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

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

  const getFilteredPending = () => {
    if (filter === 'all') return pending;
    if (filter === 'construction') return pending.filter(p => p.serviceType === 'construction');
    if (filter === 'trucking') return pending.filter(p => p.serviceType === 'trucking');
    return pending;
  };

  const filteredPending = getFilteredPending();

  // Toggle all selection
  const toggleAll = (e) => {
    if (e.target.checked) {
      setSelected(filteredPending.map(p => p.code));
    } else {
      setSelected([]);
    }
  };

  // Toggle single selection
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
          <a
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + New Application
          </a>
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

          {/* DESKTOP TABLE (hidden on mobile) */}
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
                      <td className="p-3 text-white">{p.fullName}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          p.serviceType === 'construction' 
                            ? 'bg-blue-900/50 text-blue-300' 
                            : 'bg-orange-900/50 text-orange-300'
                        }`}>
                          {p.serviceType}
                        </span>
                      </td>
                      <td className="p-3 text-green-400">R{p.totalPrice}</td>
                      <td className="p-3 text-white">R{p.monthlyAmount}</td>
                      <td className="p-3 text-gray-400">{p.repaymentMonths}m</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS (visible only on mobile) */}
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
                      p.serviceType === 'construction' 
                        ? 'bg-blue-900/50 text-blue-300' 
                        : 'bg-orange-900/50 text-orange-300'
                    }`}>
                      {p.serviceType}
                    </span>
                  </div>
                  <p className="text-white font-medium">{p.fullName}</p>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Total</p>
                      <p className="text-green-400 font-semibold">R{p.totalPrice}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Monthly</p>
                      <p className="text-white font-semibold">R{p.monthlyAmount}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Term</p>
                      <p className="text-gray-300">{p.repaymentMonths}m</p>
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
                  <th className="p-3 text-left text-gray-400 font-medium">Next Billing</th>
                </tr>
              </thead>
              <tbody>
                {active.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-500">
                      No active subscriptions
                    </td>
                  </tr>
                ) : (
                  active.map((a) => (
                    <tr key={a.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                      <td className="p-3 font-mono text-sm text-green-400">{a.code}</td>
                      <td className="p-3 text-white">{a.fullName}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          a.serviceType === 'construction' 
                            ? 'bg-blue-900/50 text-blue-300' 
                            : 'bg-orange-900/50 text-orange-300'
                        }`}>
                          {a.serviceType}
                        </span>
                      </td>
                      <td className="p-3 text-white">R{a.monthlyAmount}</td>
                      <td className="p-3 text-green-400">R{a.totalPaid || 0}</td>
                      <td className="p-3 text-gray-300">{a.nextBilling || 'Pending'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="sm:hidden p-4 space-y-4">
            {active.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No active subscriptions</p>
            ) : (
              active.map((a) => (
                <div key={a.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-sm text-green-400">{a.code}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      a.serviceType === 'construction' 
                        ? 'bg-blue-900/50 text-blue-300' 
                        : 'bg-orange-900/50 text-orange-300'
                    }`}>
                      {a.serviceType}
                    </span>
                  </div>
                  <p className="text-white font-medium">{a.fullName}</p>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Monthly</p>
                      <p className="text-white font-semibold">R{a.monthlyAmount}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Paid</p>
                      <p className="text-green-400 font-semibold">R{a.totalPaid || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Next</p>
                      <p className="text-gray-300 text-xs">{a.nextBilling || 'Pending'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}