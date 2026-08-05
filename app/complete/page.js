'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Complete() {
  const params = useSearchParams();
  const code = params.get('code');
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (code) {
      fetch(`/api/application-details?code=${code}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError('Application not found. Please check your link.');
          } else {
            setApp(data);
          }
        })
        .catch(() => setError('Network error. Please try again.'));
    } else {
      setError('No reference code provided.');
    }
  }, [code]);

  const handlePay = async () => {
    if (!app) return;

    setLoading(true);

    // Simulate Paystack card processing (2-second delay)
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const res = await fetch('/api/confirm-payment', {
        method: 'POST',
        body: JSON.stringify({ code: app.code }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (data.success) {
        setPaid(true);
        alert('✅ Payment successful! Your debit order is active.');
      } else {
        alert('❌ Payment failed. Please try again.');
      }
    } catch (error) {
      alert('Network error. Please check your connection.');
      console.error(error);
    }

    setLoading(false);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl text-center">
          <span className="text-6xl block mb-4">❌</span>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <a href="/" className="mt-4 inline-block text-blue-500 hover:underline">
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading application details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">💳</span>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Complete Debit Order
          </h1>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          Reference: <strong className="font-mono text-blue-600">{app.code}</strong>
        </p>

        <div className="bg-gray-50 p-4 rounded-xl mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Service:</span>
            <span className="font-semibold capitalize">{app.serviceType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-semibold text-green-600">R{app.totalPrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Monthly Instalment:</span>
            <span className="font-semibold text-blue-600">R{app.monthlyAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Term:</span>
            <span className="font-semibold">{app.repaymentMonths} months</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="text-gray-600">Client:</span>
            <span className="font-semibold">{app.fullName}</span>
          </div>
        </div>

        {!paid ? (
          <>
            <div className="space-y-3">
              <input
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Full Name"
                defaultValue={app.fullName}
                readOnly
              />
              <input
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Card Number"
                defaultValue="4084 0840 8408 4081"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="MM/YY"
                  defaultValue="12/26"
                />
                <input
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="CVV"
                  defaultValue="123"
                />
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={loading}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-white transition shadow-lg ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02] shadow-blue-500/25'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  Processing...
                </span>
              ) : (
                '🔒 Pay First Instalment'
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              This is a demo. No real money will be charged.
            </p>
          </>
        ) : (
          <div className="text-center p-6 bg-green-50 rounded-xl border-2 border-green-200">
            <span className="text-5xl block mb-3">🎉</span>
            <h3 className="text-xl font-bold text-green-700">Subscription Active!</h3>
            <p className="text-sm text-gray-600 mt-2">
              We will debit your card monthly for {app.repaymentMonths} months.
            </p>
            <a
              href="/"
              className="mt-4 inline-block text-blue-500 hover:underline text-sm"
            >
              ← Back to Home
            </a>
          </div>
        )}
      </div>
    </div>
  );
}