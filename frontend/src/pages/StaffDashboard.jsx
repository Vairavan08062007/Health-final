import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

// ── Header ────────────────────────────────────────────────
function StaffHeader({ user, today }) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    return (
        <header className="glass-card border-b border-white/10 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-lg font-bold">
                    {user?.full_name?.[0] || 'S'}
                </div>
                <div>
                    <p className="text-white font-bold text-sm">{user?.full_name || user?.username}</p>
                    <p className="text-emerald-300/60 text-xs">Staff Panel</p>
                </div>
            </div>
            <div className="flex items-center gap-2 text-white/40 text-sm">
                <span>📅</span><span>Today: {today}</span>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }}
                className="px-4 py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm transition-all">
                Logout
            </button>
        </header>
    );
}

// ── Patient Summary Card (Restricted View) ────────────────
function PatientSummaryCard({ patient }) {
    const fields = [
        { label: 'Age', value: patient.age ? `${patient.age} yrs` : '—' },
        { label: 'Gender', value: patient.gender || '—' },
        { label: 'Blood Group', value: patient.blood_group || '—' },
        { label: 'ABHA ID', value: patient.abha_id },
        { label: 'Emergency Contact', value: patient.emergency_contact ? `${patient.emergency_contact} (${patient.emergency_phone})` : '—' },
        { label: 'Current Medicines', value: patient.current_medicines || 'None' },
    ];
    return (
        <div className="mx-8 mt-4 glass-card rounded-2xl p-6 border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-2xl font-bold text-emerald-300">
                    {patient.name[0]}
                </div>
                <div>
                    <h2 className="text-white text-xl font-bold">{patient.name}</h2>
                    <span className="badge badge-active text-xs">Patient Found</span>
                    <span className="ml-2 text-xs text-orange-400/60 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                        View Only — No Medical Access
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {fields.map(f => (
                    <div key={f.label} className="bg-white/5 rounded-xl p-3">
                        <p className="text-white/40 text-xs mb-0.5">{f.label}</p>
                        <p className="text-white text-sm font-medium">{f.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Vitals Section ────────────────────────────────────────
function VitalsSection({ patientId, staffName }) {
    const [form, setForm] = useState({ systolic: '', diastolic: '', sugar_fasting: '', sugar_random: '', temperature: '' });
    const [list, setList] = useState([]);
    const [saving, setSaving] = useState(false);

    const loadVitals = async () => {
        try { const res = await api.get(`/vitals/${patientId}`); setList(res.data); } catch { }
    };

    const save = async () => {
        const payload = {
            patient_id: patientId,
            systolic: form.systolic ? parseInt(form.systolic) : null,
            diastolic: form.diastolic ? parseInt(form.diastolic) : null,
            sugar_fasting: form.sugar_fasting ? parseFloat(form.sugar_fasting) : null,
            sugar_random: form.sugar_random ? parseFloat(form.sugar_random) : null,
            temperature: form.temperature ? parseFloat(form.temperature) : null,
        };
        if (!payload.systolic && !payload.sugar_fasting && !payload.sugar_random)
            return toast.error('Enter at least BP or Sugar reading');
        setSaving(true);
        try {
            const res = await api.post('/vitals/', payload);
            setList([res.data, ...list]);
            setForm({ systolic: '', diastolic: '', sugar_fasting: '', sugar_random: '', temperature: '' });
            toast.success('Vitals saved!');
        } catch { toast.error('Failed to save vitals'); }
        finally { setSaving(false); }
    };

    useState(() => { loadVitals(); }, []);

    return (
        <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
                🩺 <span>Patient Vitals Entry</span>
            </h3>

            {/* Blood Pressure */}
            <div>
                <p className="text-white/40 text-xs mb-2 uppercase tracking-wide">Blood Pressure</p>
                <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <input type="number" placeholder="Systolic" className="glass-input text-sm pr-14"
                            value={form.systolic} onChange={e => setForm({ ...form, systolic: e.target.value })} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 text-xs">mmHg</span>
                    </div>
                    <div className="relative">
                        <input type="number" placeholder="Diastolic" className="glass-input text-sm pr-14"
                            value={form.diastolic} onChange={e => setForm({ ...form, diastolic: e.target.value })} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 text-xs">mmHg</span>
                    </div>
                </div>
            </div>

            {/* Blood Sugar */}
            <div>
                <p className="text-white/40 text-xs mb-2 uppercase tracking-wide">Blood Sugar</p>
                <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <input type="number" placeholder="Fasting" className="glass-input text-sm pr-14"
                            value={form.sugar_fasting} onChange={e => setForm({ ...form, sugar_fasting: e.target.value })} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 text-xs">mg/dL</span>
                    </div>
                    <div className="relative">
                        <input type="number" placeholder="Random" className="glass-input text-sm pr-14"
                            value={form.sugar_random} onChange={e => setForm({ ...form, sugar_random: e.target.value })} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 text-xs">mg/dL</span>
                    </div>
                </div>
            </div>

            {/* Temperature */}
            <div className="relative">
                <input type="number" step="0.1" placeholder="Temperature (optional)" className="glass-input text-sm pr-8"
                    value={form.temperature} onChange={e => setForm({ ...form, temperature: e.target.value })} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 text-xs">°F</span>
            </div>

            <button onClick={save} disabled={saving}
                className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm transition-all disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Vitals'}
            </button>

            {/* Vitals Table */}
            {list.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-white/70">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-2 text-white/40">Date</th>
                                <th className="text-left py-2 text-white/40">BP</th>
                                <th className="text-left py-2 text-white/40">Fasting</th>
                                <th className="text-left py-2 text-white/40">Random</th>
                                <th className="text-left py-2 text-white/40">Temp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map(v => (
                                <tr key={v.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="py-2">{new Date(v.created_at).toLocaleDateString('en-IN')}</td>
                                    <td className="py-2">
                                        {v.systolic && v.diastolic ? (
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.systolic > 130 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                                {v.systolic}/{v.diastolic}
                                            </span>
                                        ) : '—'}
                                    </td>
                                    <td className="py-2">{v.sugar_fasting ? `${v.sugar_fasting} mg/dL` : '—'}</td>
                                    <td className="py-2">{v.sugar_random ? `${v.sugar_random} mg/dL` : '—'}</td>
                                    <td className="py-2">{v.temperature ? `${v.temperature}°F` : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ── Report Upload + Drive ─────────────────────────────────
function StaffReportSection({ patientId }) {
    const CATS = ['Lab Report', 'Nursing Report', 'Daily Monitoring', 'Emergency Observation'];
    const ICONS = { 'Lab Report': '🧪', 'Nursing Report': '📋', 'Daily Monitoring': '📊', 'Emergency Observation': '🚨' };
    const [category, setCategory] = useState('Lab Report');
    const [file, setFile] = useState(null);
    const [reports, setReports] = useState([]);
    const [activeFolder, setActiveFolder] = useState(null);

    const load = async () => {
        try { const res = await api.get(`/reports/patient/${patientId}`); setReports(res.data); } catch { }
    };

    const upload = async () => {
        if (!file) return toast.error('Please select a file first');
        const fd = new FormData();
        fd.append('patient_id', patientId);
        fd.append('category', category);
        fd.append('file', file);
        try {
            await api.post('/reports/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Report uploaded successfully!');
            setFile(null); load();
        } catch { toast.error('Upload failed'); }
    };

    useState(() => { load(); }, []);

    const grouped = CATS.reduce((acc, c) => {
        acc[c] = reports.filter(r => r.category === c); return acc;
    }, {});

    return (
        <>
            {/* Upload */}
            <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                    📄 <span>Upload Medical Reports</span>
                </h3>
                <select value={category} onChange={e => setCategory(e.target.value)} className="glass-input text-sm">
                    {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
                <label className="border-2 border-dashed border-white/10 rounded-xl p-5 text-center cursor-pointer hover:border-emerald-500/40 transition-all">
                    <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" />
                    {file
                        ? <div><p className="text-white text-sm font-medium">{file.name}</p><p className="text-white/30 text-xs">{(file.size / 1024).toFixed(1)} KB</p></div>
                        : <div><p className="text-3xl mb-2">📎</p><p className="text-white/30 text-sm">Click to select PDF or Image</p></div>
                    }
                </label>
                <button onClick={upload}
                    className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm transition-all">
                    Upload Report
                </button>
            </div>

            {/* Folders (Drive Style) */}
            <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                    📂 <span>Report Folders</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {CATS.map(cat => (
                        <button key={cat} onClick={() => setActiveFolder(activeFolder === cat ? null : cat)}
                            className={`p-3 rounded-xl border text-left transition-all hover:border-emerald-500/40 ${activeFolder === cat ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/5 bg-white/5'}`}>
                            <div className="text-2xl mb-1">{ICONS[cat]}</div>
                            <p className="text-white text-xs font-medium">{cat}</p>
                            <p className="text-white/30 text-xs">{grouped[cat]?.length || 0} files</p>
                        </button>
                    ))}
                </div>
                {activeFolder && (
                    <div className="space-y-2 mt-1">
                        <p className="text-white/40 text-xs font-semibold uppercase tracking-wide">{activeFolder}</p>
                        {grouped[activeFolder]?.length === 0
                            ? <p className="text-white/20 text-sm text-center py-3">No files yet</p>
                            : grouped[activeFolder].map(r => (
                                <a key={r.id} href={`http://127.0.0.1:8000/uploads/${r.file_path}`}
                                    target="_blank" rel="noreferrer"
                                    className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-xl px-4 py-2.5 transition-all group">
                                    <span>{r.file_name.endsWith('.pdf') ? '📄' : '🖼️'}</span>
                                    <span className="text-white text-sm flex-1 truncate group-hover:text-emerald-300 transition-colors">{r.file_name}</span>
                                    <span className="text-white/20 text-xs">{new Date(r.upload_date).toLocaleDateString('en-IN')}</span>
                                </a>
                            ))
                        }
                    </div>
                )}
            </div>
        </>
    );
}

// ── Main Staff Dashboard ──────────────────────────────────
export default function StaffDashboard() {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [patient, setPatient] = useState(null);
    const [searching, setSearching] = useState(false);
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const searchPatient = async () => {
        if (query.length !== 12 || !/^\d{12}$/.test(query))
            return toast.error('Enter a valid 12-digit ABHA ID or Aadhaar number');
        setSearching(true);
        try {
            const res = await api.get(`/staff/patients/search?query=${query}`);
            setPatient(res.data);
            toast.success(`Patient found: ${res.data.name}`);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Patient not found');
            setPatient(null);
        } finally { setSearching(false); }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950">
            <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

            <StaffHeader user={user} today={today} />

            {/* Search */}
            <div className="mx-8 mt-6">
                <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-white font-bold text-lg mb-1 flex items-center gap-2">🔎 Patient Search</h2>
                    <p className="text-white/30 text-xs mb-4">Staff access — basic patient details only</p>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <input value={query}
                                onChange={e => setQuery(e.target.value.replace(/\D/g, '').slice(0, 12))}
                                onKeyDown={e => e.key === 'Enter' && searchPatient()}
                                className="glass-input pr-16" placeholder="Enter 12-digit ABHA ID or Aadhaar" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-xs">{query.length}/12</span>
                        </div>
                        <button onClick={searchPatient} disabled={searching}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50">
                            {searching ? '...' : '🔍 Fetch Patient'}
                        </button>
                    </div>
                    <p className="text-white/20 text-xs mt-2">Demo: ABHA ID 123456789000</p>
                </div>
            </div>

            {/* Patient found */}
            {patient && (
                <>
                    <PatientSummaryCard patient={patient} />
                    <div className="mx-8 mt-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <VitalsSection patientId={patient.id} staffName={user?.username} />
                        <StaffReportSection patientId={patient.id} />
                    </div>
                </>
            )}

            {!patient && (
                <div className="mx-8 mt-6 glass-card rounded-2xl p-12 text-center">
                    <div className="text-5xl mb-4">👩‍⚕️</div>
                    <h3 className="text-white font-bold text-xl mb-2">Staff Portal Ready</h3>
                    <p className="text-white/30">Enter a patient ABHA ID to record vitals and upload reports.</p>
                    <p className="text-emerald-400/40 text-sm mt-3">Demo: ABHA ID 123456789000</p>

                    {/* RBAC Info */}
                    <div className="mt-8 inline-flex flex-col gap-2 text-left bg-white/5 rounded-2xl p-5 border border-white/5">
                        <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-1">Your Permissions</p>
                        {[['✅', 'Search patient by ABHA ID'], ['✅', 'View basic patient info'], ['✅', 'Record Vitals (BP, Sugar, Temp)'], ['✅', 'Upload medical reports'], ['❌', 'Add doctor suggestions'], ['❌', 'Prescribe medicines'], ['❌', 'Change diagnosis'],].map(([icon, text]) => (
                            <div key={text} className="flex items-center gap-2">
                                <span className="text-sm">{icon}</span>
                                <span className={`text-xs ${icon === '❌' ? 'text-red-400/50' : 'text-emerald-400/60'}`}>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
