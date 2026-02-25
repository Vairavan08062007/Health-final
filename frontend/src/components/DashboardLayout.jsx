import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const navConfig = {
    admin: [
        { path: '/admin', label: 'Dashboard', icon: '📊' },
        { path: '/admin/users', label: 'User Management', icon: '👥' },
    ],
    doctor: [
        { path: '/doctor', label: 'Dashboard', icon: '📊' },
        { path: '/doctor/patients', label: 'My Patients', icon: '🩺' },
    ],
    staff: [
        { path: '/staff', label: 'Dashboard', icon: '📊' },
        { path: '/staff/appointments', label: 'Appointments', icon: '📅' },
    ],
};

const roleColors = {
    admin: 'from-purple-500/20 to-purple-900/20',
    doctor: 'from-cyan-500/20 to-cyan-900/20',
    staff: 'from-emerald-500/20 to-emerald-900/20',
};

export default function DashboardLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const navItems = navConfig[user?.role] || [];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-slate-950">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 glass-card border-r border-white/5 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">VitaSage AI</p>
                            <p className="text-white/30 text-xs">{user?.hospital_id}</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* User info + Logout */}
                <div className="p-4 border-t border-white/5">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${roleColors[user?.role]} border border-white/5 mb-3`}>
                        <p className="text-white font-medium text-sm truncate">{user?.full_name || user?.username}</p>
                        <p className="text-white/40 text-xs capitalize">{user?.role}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full nav-item text-red-400 hover:text-red-300 hover:bg-red-500/10 justify-center"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
