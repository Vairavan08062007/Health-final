import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

const StatCard = ({ icon, label, value, color }) => (
    <div className="stat-card">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-xl mb-2`}>{icon}</div>
        <p className="text-white/40 text-sm">{label}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
    </div>
);

export default function AdminDashboard() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ username: '', password: '', role: 'doctor', full_name: '' });

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users/');
            setUsers(res.data);
        } catch (e) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleToggle = async (userId) => {
        try {
            await api.patch(`/users/${userId}/toggle`);
            await fetchUsers();
            toast.success('User status updated');
        } catch { toast.error('Failed to update user'); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/', form);
            toast.success('User created!');
            setShowModal(false);
            setForm({ username: '', password: '', role: 'doctor', full_name: '' });
            await fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to create user');
        }
    };

    const stats = {
        total: users.length,
        doctors: users.filter(u => u.role === 'doctor').length,
        staff: users.filter(u => u.role === 'staff').length,
        active: users.filter(u => u.status).length,
    };

    const roleBadgeClass = { admin: 'badge-admin', doctor: 'badge-doctor', staff: 'badge-staff' };

    return (
        <DashboardLayout>
            <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
            <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                        <p className="text-white/40 text-sm mt-1">Welcome back, {user?.full_name || user?.username}</p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white text-sm font-semibold transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add User
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard icon="👥" label="Total Users" value={stats.total} color="bg-blue-500/20" />
                    <StatCard icon="🩺" label="Doctors" value={stats.doctors} color="bg-cyan-500/20" />
                    <StatCard icon="🏥" label="Staff" value={stats.staff} color="bg-emerald-500/20" />
                    <StatCard icon="✅" label="Active" value={stats.active} color="bg-green-500/20" />
                </div>

                {/* Users Table */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-white font-semibold">Hospital Users</h2>
                        <span className="badge badge-admin">{stats.total} total</span>
                    </div>
                    {loading ? (
                        <div className="p-12 text-center text-white/30">Loading users...</div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    {['Name', 'Username', 'Role', 'Status', 'Action'].map(h => (
                                        <th key={h} className="text-left px-6 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-white font-medium">{u.full_name || '—'}</td>
                                        <td className="px-6 py-4 text-white/60 font-mono text-sm">{u.username}</td>
                                        <td className="px-6 py-4"><span className={`badge ${roleBadgeClass[u.role]}`}>{u.role}</span></td>
                                        <td className="px-6 py-4"><span className={`badge ${u.status ? 'badge-active' : 'badge-inactive'}`}>{u.status ? 'Active' : 'Inactive'}</span></td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleToggle(u.id)} className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all">
                                                Toggle
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="glass-card rounded-2xl p-8 w-full max-w-md mx-4">
                        <h3 className="text-white font-bold text-lg mb-6">Create New User</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-white/60 text-sm block mb-1">Full Name</label>
                                <input className="glass-input" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Dr. Jane Doe" />
                            </div>
                            <div>
                                <label className="text-white/60 text-sm block mb-1">Username *</label>
                                <input required className="glass-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="username" />
                            </div>
                            <div>
                                <label className="text-white/60 text-sm block mb-1">Password *</label>
                                <input required type="password" className="glass-input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="text-white/60 text-sm block mb-1">Role *</label>
                                <select required className="glass-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                    <option value="doctor">Doctor</option>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-3 mt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition-all text-sm">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all text-sm">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
