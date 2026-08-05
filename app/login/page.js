'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data.success) {
                document.cookie = 'admin_session=true; path=/; max-age=604800';
                router.push('/dashboard');
            } else {
                setError('Invalid email or password');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
            <div className="bg-gray-800 max-w-md w-full p-8 rounded-2xl shadow-2xl border border-gray-700">
                {/* Header with Home Button */}
                <div className="flex justify-between items-center mb-6">
                    <div className="text-center flex-1">
                        <span className="text-4xl block mb-2">🏢</span>
                        <h1 className="text-2xl font-bold text-white">Nkosih Z Trading</h1>
                        <p className="text-gray-400 text-sm">Admin Login</p>
                    </div>
                    <Link
                        href="/"
                        className="text-gray-400 hover:text-white transition text-sm bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg"
                    >
                        🏠 Home
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="ceo@nkosihztrading.co.za"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-bold text-white transition ${
                            loading
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02]'
                        }`}
                    >
                        {loading ? '⏳ Logging in...' : '🔐 Login'}
                    </button>
                </form>

                <p className="text-center text-gray-500 text-xs mt-4">
                    Demo: ceo@nkosihztrading.co.za / admin#2026
                </p>
            </div>
        </div>
    );
}