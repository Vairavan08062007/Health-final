import { useNavigate } from 'react-router-dom';

export default function PatientLogin() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 flex items-center justify-center p-6">

            {/* Glow orbs */}
            <div className="fixed top-[-150px] left-[-150px] w-[500px] h-[500px] rounded-full bg-emerald-600/15 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-150px] right-[-150px] w-[500px] h-[500px] rounded-full bg-teal-600/15 blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md text-center">

                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/30">
                        🧑
                    </div>
                </div>
                <h1 className="text-3xl font-extrabold text-white mb-2">Patient Portal</h1>
                <p className="text-white/40 text-sm mb-10">VitaSage AI · Secure Patient Access</p>

                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-3xl mx-auto mb-5">
                        🚧
                    </div>
                    <h2 className="text-white font-bold text-xl mb-3">Coming Soon</h2>
                    <p className="text-white/40 text-sm mb-6">
                        The Patient Self-Service Portal is under development.<br />
                        It will allow patients to view records, book appointments, and manage ABHA-linked health data.
                    </p>

                    <div className="space-y-2 text-left mb-8">
                        {['ABHA ID linked record access', 'Lab report download', 'Appointment booking', 'Emergency data sharing'].map(f => (
                            <div key={f} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5">
                                <span className="text-emerald-400/60">⏳</span>
                                <span className="text-white/50 text-sm">{f}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <a href="https://abha.abdm.gov.in/abha/v3/register" target="_blank" rel="noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:scale-[1.02] transition-all">
                            🔗 Register / View Your ABHA ID
                        </a>
                        <button onClick={() => navigate('/')}
                            className="w-full py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm transition-all">
                            ← Back to Home
                        </button>
                    </div>
                </div>

                <p className="text-white/20 text-xs mt-6">
                    Are you hospital staff? <button onClick={() => navigate('/login')} className="text-emerald-400/50 hover:text-emerald-400 underline">Hospital Login →</button>
                </p>
            </div>
        </div>
    );
}
