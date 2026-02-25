import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const user = await login(data.hospital_id, data.username, data.password);
            toast.success(`Welcome back, ${user.full_name || user.username}!`);
            const routes = { admin: '/admin', doctor: '/doctor', staff: '/staff' };
            setTimeout(() => navigate(routes[user.role] || '/admin'), 600);
        } catch (err) {
            const msg = err.response?.data?.detail || 'Invalid credentials. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
            <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

            {/* Animated background orbs */}
            <div className="bg-orb w-96 h-96 bg-blue-600 top-[-5rem] left-[-5rem]" />
            <div className="bg-orb w-72 h-72 bg-indigo-600 bottom-[-3rem] right-[-3rem]" style={{ animationDelay: '3s' }} />
            <div className="bg-orb w-48 h-48 bg-cyan-500 top-1/2 left-[-8rem]" style={{ animationDelay: '1.5s' }} />

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl shadow-blue-500/30 mb-4 animate-float">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                        VitaSage AI
                    </h1>
                    <p className="text-white/40 text-sm mt-1">Hospital Management Platform</p>
                </div>

                {/* Glass Card */}
                <div className="glass-card rounded-3xl p-8">
                    <h2 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
                        <span className="w-1 h-5 bg-blue-500 rounded-full" />
                        Secure Sign In
                    </h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Hospital ID */}
                        <div>
                            <label className="block text-white/60 text-sm font-medium mb-1.5">Hospital ID</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-4 flex items-center text-white/30">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </span>
                                <input
                                    {...register('hospital_id', { required: 'Hospital ID is required' })}
                                    className="glass-input pl-10"
                                    placeholder="e.g. HSP001"
                                />
                            </div>
                            {errors.hospital_id && <p className="text-red-400 text-xs mt-1">{errors.hospital_id.message}</p>}
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-white/60 text-sm font-medium mb-1.5">Username</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-4 flex items-center text-white/30">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </span>
                                <input
                                    {...register('username', { required: 'Username is required' })}
                                    className="glass-input pl-10"
                                    placeholder="Enter your username"
                                />
                            </div>
                            {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-white/60 text-sm font-medium mb-1.5">Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-4 flex items-center text-white/30">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input
                                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                                    type="password"
                                    className="glass-input pl-10"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary mt-2">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Authenticating...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Secure Login
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-white/40 text-xs font-medium mb-1.5">🔑 Demo Credentials</p>
                        <div className="space-y-0.5 text-xs text-white/30">
                            <p><span className="text-blue-400">Admin:</span> HSP001 / admin / Admin@123</p>
                            <p><span className="text-cyan-400">Doctor:</span> HSP001 / dr.smith / Admin@123</p>
                            <p><span className="text-emerald-400">Staff:</span> HSP001 / staff01 / Admin@123</p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-white/20 text-xs mt-6">
                    © 2026 VitaSage AI · All data encrypted · HIPAA Compliant
                </p>
            </div>
        </div>
    );
}
