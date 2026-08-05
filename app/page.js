'use client';
import { useState } from 'react';

export default function Home() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    serviceType: '',
    totalPrice: 5000,
    repaymentMonths: 6,
    fullName: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    // Validate required fields
    if (!form.fullName || !form.fullName.trim()) {
      alert('Please enter your Full Name');
      return;
    }
    if (!form.email || !form.email.trim()) {
      alert('Please enter your Email Address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone || '',
          serviceType: form.serviceType,
          totalPrice: form.totalPrice,
          repaymentMonths: form.repaymentMonths,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (data.success) {
        alert(
          `✅ Application submitted!\n\n` +
          `Reference: ${data.code}\n` +
          `📧 A confirmation email has been sent to ${form.email}.\n\n` +
          `Check your inbox (and spam folder).`
        );
      } else {
        alert('Something went wrong. Please try again.');
        console.error('Error:', data);
      }

      // Reset to step 1
      setStep(1);
      setForm({
        serviceType: '',
        totalPrice: 5000,
        repaymentMonths: 6,
        fullName: '',
        email: '',
        phone: '',
      });
    } catch (error) {
      alert('Network error. Please check your connection.');
      console.error('Network error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white/80 backdrop-blur-sm max-w-2xl w-full p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/30 transition-all">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🏢</span>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Nkosih Z Trading
          </h1>
        </div>
        <p className="text-gray-500 mb-6 text-sm">Secure Debit Order Application</p>

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <label className="block font-semibold text-gray-700 text-lg">
              Select Service:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setForm({ ...form, serviceType: 'construction' });
                  setStep(2);
                }}
                className="group p-4 sm:p-8 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-lg hover:scale-105 transition-all duration-300 flex flex-col items-center"
              >
                <span className="text-4xl sm:text-5xl block mb-1 sm:mb-2">🏗️</span>
                <span className="font-semibold text-sm sm:text-base text-gray-700 group-hover:text-blue-600 truncate w-full text-center">
                  Construction
                </span>
              </button>
              <button
                onClick={() => {
                  setForm({ ...form, serviceType: 'trucking' });
                  setStep(2);
                }}
                className="group p-4 sm:p-8 bg-white border-2 border-gray-200 rounded-2xl hover:border-orange-500 hover:shadow-lg hover:scale-105 transition-all duration-300 flex flex-col items-center"
              >
                <span className="text-4xl sm:text-5xl block mb-1 sm:mb-2">🚛</span>
                <span className="font-semibold text-sm sm:text-base text-gray-700 group-hover:text-orange-600 truncate w-full text-center">
                  Trucking
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Pricing & Terms */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <button
              onClick={() => setStep(1)}
              className="text-blue-500 text-sm hover:underline flex items-center gap-1"
            >
              ← Change Service
            </button>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
              <p className="text-sm text-gray-500">
                Selected:{' '}
                <span className="font-semibold capitalize text-gray-800">
                  {form.serviceType}
                </span>
              </p>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Total Price:{' '}
                <span className="text-blue-600 font-bold text-xl">
                  R{form.totalPrice.toLocaleString()}
                </span>
              </label>
              <input
                type="range"
                min="1000"
                max="50000"
                step="500"
                value={form.totalPrice}
                onChange={(e) =>
                  setForm({ ...form, totalPrice: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>R1,000</span>
                <span>R50,000</span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Repayment Period:{' '}
                <span className="text-blue-600 font-bold">
                  {form.repaymentMonths} months
                </span>
              </label>
              <input
                type="range"
                min="2"
                max="24"
                value={form.repaymentMonths}
                onChange={(e) =>
                  setForm({ ...form, repaymentMonths: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>2 Months</span>
                <span>24 Months</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
              <p className="text-sm text-gray-600">Monthly Instalment:</p>
              <p className="text-3xl font-bold text-green-700">
                R{(form.totalPrice / form.repaymentMonths).toFixed(2)}
              </p>
            </div>

            <button
              onClick={() => setStep(3)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl w-full font-semibold transition shadow-lg shadow-blue-500/25"
            >
              Next: Client Details →
            </button>
          </div>
        )}

        {/* Step 3: Client Info */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <button
              onClick={() => setStep(2)}
              className="text-blue-500 text-sm hover:underline"
            >
              ← Back to Pricing
            </button>

            <input
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Full Name *"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />

            <input
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Email Address *"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Phone Number"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <button
              onClick={handleApply}
              disabled={loading}
              className={`w-full p-4 rounded-xl font-bold text-white transition shadow-lg ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-black to-gray-800 hover:scale-[1.02]'
              }`}
            >
              {loading ? '⏳ Processing...' : '🚀 Submit Application'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              A real confirmation email will be sent to your inbox.
            </p>
          </div>
        )}

        {/* Admin Link */}
        <div className="mt-8 text-center border-t border-gray-200 pt-4">
          <a
            href="/dashboard"
            className="text-sm text-blue-500 hover:underline font-medium"
          >
            🔐 Admin Dashboard →
          </a>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}