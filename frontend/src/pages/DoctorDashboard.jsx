import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

// ── Sub-components ────────────────────────────────────────

function Header({ doctor, today }) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => { logout(); navigate('/login'); };
    return (
        <header className="glass-card border-b border-white/10 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg font-bold">
                    {doctor?.full_name?.[0] || 'D'}
                </div>
                <div>
                    <p className="text-white font-bold text-sm">{doctor?.full_name || doctor?.username}</p>
                    <p className="text-cyan-300/60 text-xs capitalize">{doctor?.role}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 text-white/40 text-sm">
                <span>📅</span>
                <span>Today: {today}</span>
            </div>
            <button onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm transition-all">
                Logout
            </button>
        </header>
    );
}

function EmergencyBanner({ patientName }) {
    return (
        <div className="mx-8 mt-4 p-4 rounded-2xl border-2 border-red-500 bg-red-500/10 animate-pulse flex items-center gap-3">
            <span className="text-2xl">🔴</span>
            <div>
                <p className="text-red-400 font-bold text-lg">EMERGENCY PATIENT — HIGH RISK</p>
                <p className="text-red-300/70 text-sm">{patientName} requires immediate attention.</p>
            </div>
        </div>
    );
}

function PatientCard({ patient }) {
    const fields = [
        { label: 'Age', value: patient.age ? `${patient.age} yrs` : '—' },
        { label: 'Gender', value: patient.gender || '—' },
        { label: 'Blood Group', value: patient.blood_group || '—' },
        { label: 'ABHA ID', value: patient.abha_id },
        { label: 'Allergies', value: patient.allergies || 'None' },
        { label: 'Chronic Conditions', value: patient.chronic_conditions || 'None' },
        { label: 'Emergency Contact', value: patient.emergency_contact ? `${patient.emergency_contact} (${patient.emergency_phone})` : '—' },
        { label: 'Current Medicines', value: patient.current_medicines || 'None' },
    ];
    return (
        <div className="mx-8 mt-4 glass-card rounded-2xl p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-cyan-500/20">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-2xl font-bold text-cyan-300">
                    {patient.name[0]}
                </div>
                <div>
                    <h2 className="text-white text-xl font-bold">{patient.name}</h2>
                    <span className={`badge ${patient.risk_level === 'High' ? 'badge-inactive' : patient.risk_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'badge-active'}`}>
                        {patient.risk_level} Risk
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

function SuggestionSection({ patientId, doctorName }) {
    const [notes, setNotes] = useState('');
    const [risk, setRisk] = useState('Low');
    const [followup, setFollowup] = useState('');
    const [list, setList] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const load = async () => {
        if (loaded) return;
        try {
            const res = await api.get(`/suggestions/${patientId}`);
            setList(res.data); setLoaded(true);
        } catch { }
    };

    const save = async () => {
        if (!notes.trim()) return toast.error('Please enter diagnosis notes');
        try {
            const res = await api.post('/suggestions/', { patient_id: patientId, notes, risk_level: risk, followup_date: followup || null });
            setList([res.data, ...list]);
            setNotes(''); setFollowup('');
            toast.success('Suggestion saved');
        } catch { toast.error('Failed to save suggestion'); }
    };

    useState(() => { load(); }, []);

    return (
        <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-white font-bold flex items-center gap-2">📝 <span>Doctor Suggestion</span></h3>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
                className="glass-input resize-none h-24 text-sm" placeholder="Diagnosis notes..." />
            <div className="flex gap-3">
                <select value={risk} onChange={e => setRisk(e.target.value)} className="glass-input text-sm flex-1">
                    <option>Low</option><option>Medium</option><option>High</option>
                </select>
                <input type="date" value={followup} onChange={e => setFollowup(e.target.value)}
                    className="glass-input text-sm flex-1" />
            </div>
            <button onClick={save} className="btn-primary py-2.5 text-sm">Save Suggestion</button>
            <div className="space-y-2 max-h-40 overflow-y-auto">
                {list.map(s => (
                    <div key={s.id} className="bg-white/5 rounded-xl p-3 text-sm">
                        <div className="flex justify-between items-start mb-1">
                            <span className={`badge text-xs ${s.risk_level === 'High' ? 'badge-inactive' : s.risk_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'badge-active'}`}>{s.risk_level}</span>
                            <span className="text-white/30 text-xs">{new Date(s.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-white/80">{s.notes}</p>
                        {s.followup_date && <p className="text-cyan-400/60 text-xs mt-1">Follow-up: {s.followup_date}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}

function PrescriptionSection({ patientId }) {
    const [form, setForm] = useState({ medicine_name: '', dosage: '', frequency: '', duration: '' });
    const [list, setList] = useState([]);

    const load = async () => {
        try { const res = await api.get(`/prescriptions/${patientId}`); setList(res.data); } catch { }
    };

    const add = async () => {
        if (!form.medicine_name) return toast.error('Enter medicine name');
        try {
            const res = await api.post('/prescriptions/', { patient_id: patientId, ...form });
            setList([res.data, ...list]);
            setForm({ medicine_name: '', dosage: '', frequency: '', duration: '' });
            toast.success('Prescription added');
        } catch { toast.error('Failed to add prescription'); }
    };

    useState(() => { load(); }, []);

    return (
        <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-white font-bold flex items-center gap-2">💊 <span>Prescribed Medicines</span></h3>
            <input className="glass-input text-sm" placeholder="Medicine Name *" value={form.medicine_name}
                onChange={e => setForm({ ...form, medicine_name: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
                {[['dosage', 'Dosage e.g. 500mg'], ['frequency', 'Frequency'], ['duration', 'Duration']].map(([k, p]) => (
                    <input key={k} className="glass-input text-xs" placeholder={p}
                        value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
                ))}
            </div>
            <button onClick={add} className="btn-primary py-2.5 text-sm">Add Medicine</button>
            <div className="space-y-2 max-h-40 overflow-y-auto">
                {list.map(rx => (
                    <div key={rx.id} className="bg-white/5 rounded-xl px-4 py-2.5 flex justify-between items-center text-sm">
                        <div>
                            <span className="text-white font-medium">{rx.medicine_name}</span>
                            <span className="text-white/40 ml-2">{rx.dosage} · {rx.frequency} · {rx.duration}</span>
                        </div>
                        <span className="text-white/30 text-xs">{new Date(rx.created_at).toLocaleDateString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ReportSection({ patientId }) {
    const [category, setCategory] = useState('Lab Report');
    const [file, setFile] = useState(null);
    const [reports, setReports] = useState([]);
    const [activeFolder, setActiveFolder] = useState(null);

    const CATS = ['Lab Report', 'Radiology', 'Prescription', 'Emergency'];
    const ICONS = { 'Lab Report': '🧪', 'Radiology': '🩻', 'Prescription': '📋', 'Emergency': '🚨' };

    const load = async () => {
        try { const res = await api.get(`/reports/patient/${patientId}`); setReports(res.data); } catch { }
    };

    const upload = async () => {
        if (!file) return toast.error('Select a file first');
        const fd = new FormData();
        fd.append('patient_id', patientId);
        fd.append('category', category);
        fd.append('file', file);
        try {
            await api.post('/reports/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Report uploaded');
            setFile(null);
            load();
        } catch { toast.error('Upload failed'); }
    };

    useState(() => { load(); }, []);

    const grouped = CATS.reduce((acc, c) => { acc[c] = reports.filter(r => r.category === c); return acc; }, {});

    return (
        <>
            {/* Upload Section */}
            <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
                <h3 className="text-white font-bold flex items-center gap-2">📄 <span>Upload Report</span></h3>
                <select value={category} onChange={e => setCategory(e.target.value)} className="glass-input text-sm">
                    {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
                <label className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500/40 transition-all">
                    <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" />
                    {file ? <p className="text-white text-sm">{file.name}</p> :
                        <p className="text-white/30 text-sm">Click to select PDF or Image</p>}
                </label>
                <button onClick={upload} className="btn-primary py-2.5 text-sm">Upload</button>
            </div>

            {/* Drive Folders */}
            <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
                <h3 className="text-white font-bold flex items-center gap-2">📂 <span>Patient Report Folders</span></h3>
                <div className="grid grid-cols-2 gap-3">
                    {CATS.map(cat => (
                        <button key={cat} onClick={() => setActiveFolder(activeFolder === cat ? null : cat)}
                            className={`p-3 rounded-xl border text-left transition-all hover:border-blue-500/40 ${activeFolder === cat ? 'border-blue-500/40 bg-blue-500/10' : 'border-white/5 bg-white/5'}`}>
                            <div className="text-xl mb-1">{ICONS[cat]}</div>
                            <p className="text-white text-sm font-medium">{cat}</p>
                            <p className="text-white/30 text-xs">{grouped[cat]?.length || 0} files</p>
                        </button>
                    ))}
                </div>
                {activeFolder && grouped[activeFolder]?.length > 0 && (
                    <div className="mt-2 space-y-2">
                        <p className="text-white/40 text-xs font-semibold uppercase">{activeFolder}</p>
                        {grouped[activeFolder].map(r => (
                            <a key={r.id} href={`http://127.0.0.1:8000/uploads/${r.file_path}`} target="_blank" rel="noreferrer"
                                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-xl px-4 py-2.5 transition-all">
                                <span>{r.file_name.endsWith('.pdf') ? '📄' : '🖼️'}</span>
                                <span className="text-white text-sm flex-1 truncate">{r.file_name}</span>
                                <span className="text-white/30 text-xs">{new Date(r.upload_date).toLocaleDateString()}</span>
                            </a>
                        ))}
                    </div>
                )}
                {activeFolder && grouped[activeFolder]?.length === 0 && (
                    <p className="text-white/30 text-sm text-center py-2">No files in {activeFolder}</p>
                )}
            </div>
        </>
    );
}

// ── Main Doctor Dashboard ─────────────────────────────────
export default function DoctorDashboard() {
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
            const res = await api.get(`/patients/search?query=${query}`);
            setPatient(res.data);
            toast.success(`Patient found: ${res.data.name}`);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Patient not found');
            setPatient(null);
        } finally { setSearching(false); }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
            <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

            <Header doctor={user} today={today} />

            {/* Search */}
            <div className="mx-8 mt-6">
                <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <span>🔎</span> Patient Search
                    </h2>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <input
                                value={query}
                                onChange={e => setQuery(e.target.value.replace(/\D/g, '').slice(0, 12))}
                                onKeyDown={e => e.key === 'Enter' && searchPatient()}
                                className="glass-input pr-32"
                                placeholder="Enter 12-digit ABHA ID or Aadhaar number"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-xs">
                                {query.length}/12
                            </span>
                        </div>
                        <button onClick={searchPatient} disabled={searching}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2">
                            {searching ? '...' : '🔍 Fetch Patient'}
                        </button>
                    </div>
                    <p className="text-white/20 text-xs mt-2">Example — ABHA ID: 123456789000</p>
                </div>
            </div>

            {/* Patient found */}
            {patient && (
                <>
                    {patient.risk_level === 'High' && <EmergencyBanner patientName={patient.name} />}
                    <PatientCard patient={patient} />

                    {/* 4 Sections Grid */}
                    <div className="mx-8 mt-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SuggestionSection patientId={patient.id} doctorName={user?.full_name} />
                        <PrescriptionSection patientId={patient.id} />
                        <ReportSection patientId={patient.id} />
                    </div>
                </>
            )}

            {!patient && (
                <div className="mx-8 mt-6 glass-card rounded-2xl p-12 text-center">
                    <div className="text-5xl mb-4">🩺</div>
                    <h3 className="text-white font-bold text-xl mb-2">Doctor Portal Ready</h3>
                    <p className="text-white/30">Enter a patient's ABHA ID or Aadhaar number above to load their full profile.</p>
                    <p className="text-cyan-400/40 text-sm mt-3">Demo: ABHA ID 123456789000</p>
                </div>
            )}
        </div>
    );
}
