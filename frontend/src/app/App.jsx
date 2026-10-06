import { useState, useEffect } from "react";
import {
  Brain, BookOpen, FileText, History, User, LogOut, ChevronRight,
  Star, Clock, Target, ArrowRight, Check, Sparkles,
  Calendar, TrendingUp, Download, Heart, Settings, Bell, Shield,
  Eye, EyeOff, Menu, X, Plus, Award, LayoutDashboard,
} from "lucide-react";
import { api, getToken, setToken, timeAgo } from "../lib/api.js";
import { useProgress } from "../lib/useProgress.js";
import {
  AssessmentResult, PlanResult, MaterialResult, ErrorBox, DownloadButton, ItemModal, downloadItem,
} from "../components/Results.jsx";


const FONT = { fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" };

// ─── Auth helpers ────────────────────────────────────────────────────────────
const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-800 text-sm";

function AuthShell({ title, subtitle, children }) {
  return (
    <div style={FONT} className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">StudyAI</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">{title}</h1>
          <p className="text-indigo-200 text-sm">{subtitle}</p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-2xl">{children}</div>
      </div>
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder, show, setShow }) {
  return (
    <div className="relative">
      <input type={show ? "text" : "password"} placeholder={placeholder} value={value} onChange={onChange} className={`${inputCls} pr-12`} />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}

const Label = ({ children }) => <label className="text-sm font-semibold text-gray-700 block mb-1.5">{children}</label>;

// ─── Login ──────────────────────────────────────────────────────────────────
function LoginPage({ onAuth, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try { onAuth(await api.login({ email, password })); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <AuthShell title="Welcome Back!" subtitle="Continue your AI-powered learning journey">
      <form onSubmit={submit} className="space-y-4">
        <div><Label>Email Address</Label>
          <input type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} /></div>
        <div><Label>Password</Label>
          <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" show={showPw} setShow={setShowPw} /></div>
        {error && <ErrorBox message={error} />}
        <button type="submit" disabled={busy || !email || !password}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
          {busy ? "Signing in…" : <>Sign In <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-gray-500">
        {"Don't have an account? "}
        <button onClick={onRegister} className="text-indigo-600 font-semibold hover:underline">Create Account</button>
      </div>
    </AuthShell>
  );
}

// ─── Register ────────────────────────────────────────────────────────────────
function RegisterPage({ onBack, onAuth }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords do not match");
    if (!agreed) return setError("Please accept the Terms and Privacy Policy");
    setError(""); setBusy(true);
    try { onAuth(await api.register({ name, email, password })); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <AuthShell title="Create Account" subtitle="Start your AI-powered learning journey today">
      <form onSubmit={submit} className="space-y-4">
        <div><Label>Full Name</Label><input type="text" required placeholder="Alex Johnson" value={name} onChange={e => setName(e.target.value)} className={inputCls} /></div>
        <div><Label>Email Address</Label><input type="email" required placeholder="alex@example.com" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} /></div>
        <div><Label>Password</Label><PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" show={showPw} setShow={setShowPw} /></div>
        <div><Label>Confirm Password</Label><input type="password" placeholder="Re-enter your password" value={confirm} onChange={e => setConfirm(e.target.value)} className={inputCls} /></div>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 rounded" />
          <span className="text-sm text-gray-600">I agree to the Terms of Service and Privacy Policy</span>
        </label>
        {error && <ErrorBox message={error} />}
        <button type="submit" disabled={busy}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-indigo-200">
          {busy ? "Creating account…" : "Create Account"}
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <button onClick={onBack} className="text-indigo-600 font-semibold hover:underline">Sign In</button>
      </div>
    </AuthShell>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ currentPage, onNavigate, onLogout, user, open, setOpen }) {
  const nav = [
    { id: "home", label: "Home", icon: LayoutDashboard },
    { id: "assessment", label: "AI Study Assessment", icon: Brain },
    { id: "planner", label: "AI Study Planner", icon: Calendar },
    { id: "materials", label: "AI Learning Materials", icon: BookOpen },
    { id: "history", label: "Learning History", icon: History },
    { id: "profile", label: "Profile", icon: User },
  ];

  const Content = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-base leading-none tracking-tight">StudyAI</div>
            <div className="text-indigo-300 text-xs mt-0.5">AI Study Assistant</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-3 py-2 mb-1">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Navigation</span>
        </div>
        {nav.map(item => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button key={item.id} onClick={() => { onNavigate(item.id); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-white/20 text-white" : "text-indigo-200 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
              <span className="flex-1 text-left">{item.label}</span>
              {active && <div className="w-1.5 h-1.5 rounded-full bg-white/80 flex-shrink-0" />}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-semibold truncate">{user?.name || "Student"}</div>
            <div className="text-indigo-300 text-xs truncate">{user?.email || ""}</div>
          </div>
        </div>
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-indigo-200 hover:bg-white/10 hover:text-white text-sm font-medium transition">
          <LogOut style={{ width: 16, height: 16 }} className="flex-shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-60
        bg-gradient-to-b from-indigo-700 to-indigo-900
        transform transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        flex-shrink-0
      `}>
        <Content />
      </div>
    </>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────
function PageShell({ title, icon: Icon, iconBg, iconColor, subtitle, children }) {
  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon style={{ width: 20, height: 20 }} className={iconColor} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function HomePage({ onNavigate, user }) {
  const features = [
    { id: "assessment", title: "AI Study Assessment", desc: "Let AI determine what you should study first based on your current knowledge level and goals.", icon: Brain, iconBg: "bg-indigo-100", iconColor: "text-indigo-600", badge: "Smart" },
    { id: "planner", title: "AI Study Planner", desc: "Get a personalized timetable built around your exam dates and available study hours.", icon: Calendar, iconBg: "bg-blue-100", iconColor: "text-blue-600", badge: "Popular" },
    { id: "materials", title: "AI Learning Materials", desc: "Generate study notes, chapter summaries, practice questions, and full PDF guides on demand.", icon: BookOpen, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", badge: "New" },
    { id: "history", title: "Learning History", desc: "Review your past sessions, saved plans, and all AI-generated materials in one place.", icon: History, iconBg: "bg-amber-100", iconColor: "text-amber-600", badge: null },
  ];

  const [st, setSt] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  useEffect(() => {
    api.stats().then(setSt).catch(() => {});
    api.items({ limit: 3 }).then(r => setRecentItems(r.items)).catch(() => {});
  }, []);

  const stats = [
    { label: "Study Streak", value: `${st?.streak ?? 0} day${st?.streak === 1 ? "" : "s"}`, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-100" },
    { label: "Hours Planned", value: `${st?.plannedHours ?? 0} hrs`, icon: Clock, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Materials Made", value: String(st?.counts.material ?? 0), icon: FileText, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Study Plans", value: String(st?.counts.plan ?? 0), icon: Target, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  const typeMeta = {
    assessment: { label: "Assessment", icon: Brain, color: "bg-indigo-100 text-indigo-600" },
    plan: { label: "Study Plan", icon: Calendar, color: "bg-blue-100 text-blue-600" },
    material: { label: "Study Material", icon: BookOpen, color: "bg-emerald-100 text-emerald-600" },
  };
  const recent = recentItems.map(i => ({ ...typeMeta[i.type], subject: i.title, date: timeAgo(i.createdAt), type: typeMeta[i.type].label, id: i.id }));

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-6 lg:p-8 mb-6 text-white">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-xs font-semibold mb-3">
            <Sparkles style={{ width: 13, height: 13 }} /> AI-Powered Learning
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">
            Welcome back, {user?.name?.split(" ")[0] || "Student"}! 👋
          </h1>
          <p className="text-indigo-200 text-sm mb-5">Ready to supercharge your studies today?</p>
          <button onClick={() => onNavigate("assessment")}
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition shadow">
            Start Assessment <ArrowRight style={{ width: 15, height: 15 }} />
          </button>
        </div>
        <div className="absolute -right-6 -top-6 w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute right-16 -bottom-8 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute right-36 top-4 w-5 h-5 rounded-full bg-white/20" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card rounded-2xl p-4 border border-border shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <Icon style={{ width: 18, height: 18 }} className={s.color} />
              </div>
              <div className="text-xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Features */}
      <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">AI-Powered Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {features.map(f => {
          const Icon = f.icon;
          return (
            <button key={f.id} onClick={() => onNavigate(f.id)}
              className="text-left bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-2xl ${f.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon style={{ width: 22, height: 22 }} className={f.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-foreground text-sm">{f.title}</span>
                    {f.badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-bold uppercase tracking-wide">{f.badge}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
                <ChevronRight style={{ width: 16, height: 16 }} className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Recent */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-foreground text-sm">Recent Activity</h2>
          <button onClick={() => onNavigate("history")} className="text-xs text-indigo-600 font-semibold hover:underline">View all</button>
        </div>
        <div className="space-y-2">
          {recent.length === 0 && <div className="text-sm text-muted-foreground p-3">Nothing yet — try one of the AI tools above.</div>}
          {recent.map((a, i) => {
            const Icon = a.icon;
            return (
              <div key={i} onClick={() => onNavigate("history")} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition cursor-pointer">
                <div className={`w-9 h-9 rounded-xl ${a.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon style={{ width: 16, height: 16 }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{a.subject}</div>
                  <div className="text-xs text-muted-foreground">{a.type} · {a.date}</div>
                </div>
                <ChevronRight style={{ width: 14, height: 14 }} className="text-gray-300 flex-shrink-0" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Assessment ───────────────────────────────────────────────────────────────
function AssessmentPage() {
  const [step, setStep] = useState("subject");
  const [data, setData] = useState({ subject: "", level: "", examDate: "", goals: "" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const progress = useProgress(step === "analyzing");

  const run = async () => {
    setError(""); setStep("analyzing");
    try { setResult(await api.assessment(data)); setStep("results"); }
    catch (err) { setError(err.message); setStep("goals"); }
  };

  const levels = ["Beginner", "Elementary", "Intermediate", "Advanced", "Expert"];
  const stepNum = { subject: 1, level: 2, examdate: 3, goals: 4, analyzing: 4, results: 4 };

  const aiMessages = {
    subject: "Hi there! I'm your AI study assistant. What subject would you like to study? I'll help you build the perfect learning plan.",
    level: `Great choice! What is your current knowledge level in ${data.subject || "this subject"}?`,
    examdate: "Perfect! When is your exam or target completion date? This lets me pace your schedule optimally.",
    goals: "Almost there! What are your main study goals? This helps me prioritize the topics that matter most.",
    analyzing: "Analyzing your responses and building your personalized assessment plan...",
  };

  return (
    <PageShell title="AI Study Assessment" icon={Brain} iconBg="bg-indigo-100" iconColor="text-indigo-600" subtitle="Let AI determine your optimal study path">
      {step !== "results" && step !== "analyzing" && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Step {stepNum[step]} of 4</span>
            <span>{Math.round((stepNum[step] / 4) * 100)}% complete</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${(stepNum[step] / 4) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {step !== "results" && (
          <div className="p-5 border-b border-border bg-indigo-50/50">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow">
                <Sparkles style={{ width: 16, height: 16 }} className="text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-indigo-100 flex-1">
                <p className="text-xs font-bold text-indigo-600 mb-1">StudyAI Assistant</p>
                <p className="text-sm text-gray-700">{aiMessages[step]}</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-5">
          {step === "subject" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Subject</label>
                <input type="text" placeholder="e.g. Mathematics, Physics, Chemistry..."
                  value={data.subject} onChange={e => setData({ ...data, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div className="flex flex-wrap gap-2">
                {["Mathematics", "Physics", "Chemistry", "Biology", "History", "Computer Science"].map(s => (
                  <button key={s} onClick={() => setData({ ...data, subject: s })}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition ${data.subject === s ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground hover:border-indigo-400 hover:text-indigo-600"}`}>
                    {s}
                  </button>
                ))}
              </div>
              <button onClick={() => data.subject && setStep("level")} disabled={!data.subject}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold disabled:opacity-40 hover:opacity-90 transition flex items-center justify-center gap-2">
                Next <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            </div>
          )}

          {step === "level" && (
            <div className="space-y-4">
              <label className="text-sm font-semibold text-foreground block">Current Knowledge Level</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {levels.map(l => (
                  <button key={l} onClick={() => setData({ ...data, level: l })}
                    className={`py-3 rounded-xl border text-sm font-semibold transition ${data.level === l ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-foreground hover:border-indigo-400"}`}>
                    {l}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep("subject")} className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-gray-50 transition">Back</button>
                <button onClick={() => data.level && setStep("examdate")} disabled={!data.level}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold disabled:opacity-40 hover:opacity-90 transition">Next</button>
              </div>
            </div>
          )}

          {step === "examdate" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Exam / Target Date</label>
                <input type="date" value={data.examDate} onChange={e => setData({ ...data, examDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep("level")} className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-gray-50 transition">Back</button>
                <button onClick={() => data.examDate && setStep("goals")} disabled={!data.examDate}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold disabled:opacity-40 hover:opacity-90 transition">Next</button>
              </div>
            </div>
          )}

          {step === "goals" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Study Goals</label>
                <textarea rows={3} placeholder="e.g. Pass my final exam with distinction, master core concepts, improve problem-solving skills..."
                  value={data.goals} onChange={e => setData({ ...data, goals: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
              </div>
              {error && <ErrorBox message={error} />}
              <div className="flex gap-3">
                <button onClick={() => setStep("examdate")} className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-gray-50 transition">Back</button>
                <button onClick={run}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
                  <Sparkles style={{ width: 15, height: 15 }} /> Analyze
                </button>
              </div>
            </div>
          )}

          {step === "analyzing" && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Brain style={{ width: 28, height: 28 }} className="text-indigo-600" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Analyzing your profile...</h3>
              <p className="text-sm text-muted-foreground mb-6">Building your personalized assessment</p>
              <div className="max-w-xs mx-auto">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-150" style={{ width: `${progress}%` }} />
                </div>
                <div className="text-xs text-muted-foreground mt-2">{Math.round(progress)}% complete</div>
              </div>
            </div>
          )}

          {step === "results" && result && (
            <div className="space-y-5">
              <AssessmentResult item={result} />
              <div className="flex gap-3">
                <DownloadButton item={result} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold transition" />
                <button onClick={() => { setStep("subject"); setResult(null); setData({ subject: "", level: "", examDate: "", goals: "" }); }}
                  className="flex-1 py-3 rounded-xl border border-indigo-200 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition">
                  Start New Assessment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

// ─── Planner ──────────────────────────────────────────────────────────────────
function PlannerPage() {
  const [step, setStep] = useState("form");
  const [subjects, setSubjects] = useState(["Mathematics", "Physics"]);
  const [newSub, setNewSub] = useState("");
  const [hours, setHours] = useState("3");
  const [intensity, setIntensity] = useState("Medium");
  const [startDate, setStartDate] = useState("");
  const [examDate, setExamDate] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const progress = useProgress(step === "generating");

  const run = async () => {
    if (!subjects.length) return setError("Add at least one subject");
    setError(""); setStep("generating");
    try {
      setResult(await api.planner({ subjects, hoursPerDay: hours, intensity, startDate, examDate }));
      setStep("done");
    } catch (err) { setError(err.message); setStep("form"); }
  };

  const addSubject = () => {
    if (newSub.trim() && !subjects.includes(newSub.trim())) {
      setSubjects([...subjects, newSub.trim()]);
      setNewSub("");
    }
  };

  return (
    <PageShell title="AI Study Planner" icon={Calendar} iconBg="bg-blue-100" iconColor="text-blue-600" subtitle="Generate your personalized weekly timetable">
      {step === "form" && (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-5">
          {/* Subjects */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Subjects to Study</label>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
              {subjects.map(s => (
                <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-100 text-indigo-700 text-sm font-semibold">
                  {s}
                  <button onClick={() => setSubjects(subjects.filter(x => x !== s))} className="text-indigo-400 hover:text-indigo-700 transition">
                    <X style={{ width: 13, height: 13 }} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Add a subject..." value={newSub}
                onChange={e => setNewSub(e.target.value)} onKeyDown={e => e.key === "Enter" && addSubject()}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              <button onClick={addSubject} className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition flex-shrink-0">
                <Plus style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>

          {/* Hours */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Available Study Hours / Day</label>
            <div className="flex gap-2">
              {["1", "2", "3", "4", "5", "6+"].map(h => (
                <button key={h} onClick={() => setHours(h)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition ${hours === h ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-foreground hover:border-indigo-400"}`}>
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Exam Date</label>
              <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
          </div>

          {/* Intensity */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Study Intensity</label>
            <div className="grid grid-cols-3 gap-2">
              {["Easy", "Medium", "Intensive"].map(d => (
                <button key={d} onClick={() => setIntensity(d)}
                  className={`py-2.5 rounded-xl border text-sm font-semibold transition ${intensity === d ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-foreground hover:border-indigo-400"}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {error && <ErrorBox message={error} />}
          <button onClick={run}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 shadow">
            <Sparkles style={{ width: 15, height: 15 }} /> Generate Study Plan
          </button>
        </div>
      )}

      {step === "generating" && (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Calendar style={{ width: 28, height: 28 }} className="text-blue-600" />
          </div>
          <h3 className="font-bold text-foreground mb-1">Creating your study plan...</h3>
          <p className="text-sm text-muted-foreground mb-6">AI is optimizing your schedule for maximum efficiency</p>
          <div className="max-w-xs mx-auto">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-150" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-xs text-muted-foreground mt-2">{Math.round(progress)}%</div>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-bold text-lg">Your Weekly Study Plan</h2>
                <p className="text-blue-200 text-sm">{subjects.join(", ")} · {hours} hrs/day · {intensity}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <DownloadButton item={result} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition" />
                <button onClick={() => setStep("form")} className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition">
                  Regenerate
                </button>
              </div>
            </div>
          </div>
          <PlanResult item={result} />
        </div>
      )}
    </PageShell>
  );
}

// ─── Save (favourite) button ──────────────────────────────────────────────────
function SaveButton({ item, className }) {
  const [saved, setSaved] = useState(Boolean(item.saved));
  const toggle = async () => {
    const next = !saved;
    setSaved(next);
    try { await api.setSaved(item.id, next); } catch { setSaved(!next); }
  };
  return (
    <button onClick={toggle} className={className}>
      <Heart style={{ width: 14, height: 14 }} className={saved ? "fill-current" : ""} /> {saved ? "Saved" : "Save"}
    </button>
  );
}

// ─── Materials ────────────────────────────────────────────────────────────────
function MaterialsPage() {
  const [step, setStep] = useState("form");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [matType, setMatType] = useState("Study Notes");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const progress = useProgress(step === "generating");

  const run = async () => {
    setError(""); setStep("generating");
    try { setResult(await api.materials({ subject, topic, type: matType })); setStep("done"); }
    catch (err) { setError(err.message); setStep("form"); }
  };

  const types = ["Study Notes", "Chapter Summary", "Practice Questions", "Full PDF Guide", "Flashcards"];

  return (
    <PageShell title="AI Learning Materials" icon={BookOpen} iconBg="bg-emerald-100" iconColor="text-emerald-600" subtitle="Generate personalized study content instantly">
      {step === "form" && (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Subject</label>
              <input type="text" placeholder="e.g. Mathematics" value={subject} onChange={e => setSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Topic / Chapter</label>
              <input type="text" placeholder="e.g. Differential Equations" value={topic} onChange={e => setTopic(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Material Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {types.map(t => (
                <button key={t} onClick={() => setMatType(t)}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition text-left ${matType === t ? "bg-emerald-600 text-white border-emerald-600" : "border-border text-foreground hover:border-emerald-400"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {error && <ErrorBox message={error} />}
          <button onClick={run} disabled={!subject.trim() || !topic.trim()}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 disabled:opacity-40 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 shadow">
            <Sparkles style={{ width: 15, height: 15 }} /> Generate Materials
          </button>
        </div>
      )}

      {step === "generating" && (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BookOpen style={{ width: 28, height: 28 }} className="text-emerald-600" />
          </div>
          <h3 className="font-bold text-foreground mb-1">Generating your materials...</h3>
          <p className="text-sm text-muted-foreground mb-6">AI is writing customized study content for you</p>
          <div className="max-w-xs mx-auto">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-150" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-xs text-muted-foreground mt-2">{Math.round(progress)}%</div>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-bold text-lg">{result.title}</h2>
                <p className="text-emerald-200 text-sm">{result.subject} · {matType}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <SaveButton item={result} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition" />
                <DownloadButton item={result} className="flex items-center gap-2 bg-white text-emerald-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition" />
              </div>
            </div>
          </div>

          <MaterialResult item={result} />

          <button onClick={() => { setStep("form"); setResult(null); setSubject(""); setTopic(""); }}
            className="w-full py-3 rounded-xl border border-emerald-200 text-emerald-600 font-semibold text-sm hover:bg-emerald-50 transition">
            Generate New Materials
          </button>
        </div>
      )}
    </PageShell>
  );
}

// ─── History ──────────────────────────────────────────────────────────────────
const TYPE_META = {
  assessment: { label: "Assessment", icon: Brain, color: "bg-indigo-100 text-indigo-600" },
  plan: { label: "Plan", icon: Calendar, color: "bg-blue-100 text-blue-600" },
  material: { label: "Materials", icon: BookOpen, color: "bg-emerald-100 text-emerald-600" },
};

/** Open / download / favourite / delete actions shared by History and Profile lists. */
function useItemActions(reload) {
  const [open, setOpen] = useState(null); // { item?, loading?, error? }
  const view = async (id) => {
    setOpen({ loading: true });
    try { setOpen({ item: await api.item(id) }); } catch (e) { setOpen({ error: e.message }); }
  };
  const download = async (id) => { try { downloadItem(await api.item(id)); } catch { /* ignore */ } };
  const toggleSaved = async (it) => { try { await api.setSaved(it.id, !it.saved); reload(); } catch { /* ignore */ } };
  const remove = async (it) => {
    if (!window.confirm(`Delete "${it.title}"?`)) return;
    try { await api.remove(it.id); reload(); } catch { /* ignore */ }
  };
  const modal = open && <ItemModal item={open.item} loading={open.loading} error={open.error} onClose={() => setOpen(null)} />;
  return { view, download, toggleSaved, remove, modal };
}

function useItems(params) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const key = JSON.stringify(params);
  const load = () => api.items(params).then(r => { setItems(r.items); setError(""); }).catch(e => setError(e.message));
  useEffect(() => { setItems(null); load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [key]);
  return { items, error, reload: load };
}

function HistoryPage() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Assessment", "Plan", "Materials"];
  const typeParam = { Assessment: "assessment", Plan: "plan", Materials: "material" }[filter];
  const { items, error, reload } = useItems(typeParam ? { type: typeParam } : {});
  const act = useItemActions(reload);

  return (
    <PageShell title="Learning History" icon={History} iconBg="bg-amber-100" iconColor="text-amber-600" subtitle="Your past AI study sessions and generated materials">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${filter === f ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {f}
          </button>
        ))}
      </div>

      {error && <ErrorBox message={error} onRetry={reload} />}
      {!items && !error && <div className="text-sm text-muted-foreground">Loading…</div>}
      {items && items.length === 0 && (
        <div className="bg-card rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">Nothing here yet. Generate an assessment, plan or study material and it will show up here.</div>
      )}

      <div className="space-y-3">
        {items?.map(item => {
          const m = TYPE_META[item.type];
          const Icon = m.icon;
          return (
            <div key={item.id} onClick={() => act.view(item.id)} className="bg-card rounded-2xl border border-border shadow-sm p-4 hover:shadow-md transition group cursor-pointer">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon style={{ width: 18, height: 18 }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-muted-foreground font-semibold">{m.label}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(item.createdAt)}</span>
                    {item.source === "demo" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">DEMO</span>}
                  </div>
                  <div className="font-semibold text-foreground text-sm">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.subject} · {item.result}</div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <button title={item.saved ? "Unsave" : "Save"} onClick={() => act.toggleSaved(item)}
                    className={`p-1.5 rounded-lg hover:bg-gray-100 transition ${item.saved ? "text-rose-500" : "text-muted-foreground hover:text-foreground sm:opacity-0 group-hover:opacity-100"}`}>
                    <Heart style={{ width: 14, height: 14 }} className={item.saved ? "fill-current" : ""} />
                  </button>
                  <button title="Download" onClick={() => act.download(item.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground hover:text-foreground transition sm:opacity-0 group-hover:opacity-100">
                    <Download style={{ width: 14, height: 14 }} />
                  </button>
                  <button title="Delete" onClick={() => act.remove(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition sm:opacity-0 group-hover:opacity-100">
                    <X style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {act.modal}
    </PageShell>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
function ProfilePage({ user, onLogout }) {
  const [section, setSection] = useState("overview");
  const [st, setSt] = useState(null);
  useEffect(() => { api.stats().then(setSt).catch(() => {}); }, []);
  const { items: saved, reload } = useItems({ saved: "1" });
  const act = useItemActions(reload);
  const savedPlans = saved?.filter(i => i.type === "plan") ?? [];
  const savedNotes = saved?.filter(i => i.type !== "plan") ?? [];

  const sections = ["Overview", "Saved Plans", "Saved Notes", "Settings"];
  const sectionId = (s) => s.toLowerCase().replace(" ", "-");
  const since = st?.memberSince ? new Date(st.memberSince).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "";

  const renderSaved = (list, Icon, bg, fg, empty) => (
    <div className="space-y-3">
      {saved && list.length === 0 && <div className="bg-card rounded-2xl border border-border p-6 text-center text-sm text-muted-foreground">{empty}</div>}
      {list.map(it => (
        <div key={it.id} className="bg-card rounded-2xl border border-border shadow-sm p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}><Icon style={{ width: 18, height: 18 }} className={fg} /></div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground text-sm truncate">{it.title}</div>
            <div className="text-xs text-muted-foreground">{it.subject} · {timeAgo(it.createdAt)}</div>
          </div>
          <div className="flex gap-1.5">
            <button title="Open" onClick={() => act.view(it.id)} className="p-2 rounded-lg hover:bg-gray-100 text-muted-foreground hover:text-foreground transition"><Eye style={{ width: 15, height: 15 }} /></button>
            <button title="Download" onClick={() => act.download(it.id)} className="p-2 rounded-lg hover:bg-gray-100 text-muted-foreground hover:text-foreground transition"><Download style={{ width: 15, height: 15 }} /></button>
            <button title="Remove from saved" onClick={() => act.toggleSaved(it)} className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition"><X style={{ width: 15, height: 15 }} /></button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-6 text-white mb-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user?.name || "Student"}</h1>
            <p className="text-indigo-200 text-sm">{user?.email}</p>
            {since && (
              <div className="flex items-center gap-1 mt-1.5">
                <Star style={{ width: 12, height: 12 }} className="text-amber-300 fill-amber-300" />
                <span className="text-xs text-indigo-200 font-medium">Member since {since}</span>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/20 relative z-10">
          {[{ label: "Study Plans", value: st?.counts.plan ?? 0 }, { label: "Materials", value: st?.counts.material ?? 0 }, { label: "Hours Planned", value: st?.plannedHours ?? 0 }].map(x => (
            <div key={x.label} className="text-center">
              <div className="text-2xl font-bold">{x.value}</div>
              <div className="text-xs text-indigo-200 mt-0.5">{x.label}</div>
            </div>
          ))}
        </div>
        <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute right-12 -bottom-6 w-20 h-20 rounded-full bg-white/10" />
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 overflow-x-auto">
        {sections.map(x => (
          <button key={x} onClick={() => setSection(sectionId(x))}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${section === sectionId(x) ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {x}
          </button>
        ))}
      </div>

      {section === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Study Streak", value: `${st?.streak ?? 0} days`, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-100" },
              { label: "Total Sessions", value: String(st?.total ?? 0), icon: Clock, color: "text-blue-600", bg: "bg-blue-100" },
              { label: "Top Subject", value: st?.topSubject || "—", icon: Star, color: "text-amber-600", bg: "bg-amber-100" },
              { label: "Assessments", value: String(st?.counts.assessment ?? 0), icon: Award, color: "text-emerald-600", bg: "bg-emerald-100" },
            ].map(x => {
              const Icon = x.icon;
              return (
                <div key={x.label} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
                  <div className={`w-9 h-9 rounded-xl ${x.bg} flex items-center justify-center mb-3`}><Icon style={{ width: 18, height: 18 }} className={x.color} /></div>
                  <div className="font-bold text-foreground truncate">{x.value}</div>
                  <div className="text-xs text-muted-foreground">{x.label}</div>
                </div>
              );
            })}
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <h3 className="font-bold text-foreground text-sm mb-3">Studied Subjects</h3>
            <div className="flex flex-wrap gap-2">
              {(st?.subjects ?? []).map(x => <span key={x} className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-semibold">{x}</span>)}
              {st && st.subjects.length === 0 && <span className="text-sm text-muted-foreground">No subjects yet.</span>}
            </div>
          </div>
        </div>
      )}

      {section === "saved-plans" && renderSaved(savedPlans, Calendar, "bg-blue-100", "text-blue-600", "No saved plans. Tap the heart on a plan in Learning History.")}
      {section === "saved-notes" && renderSaved(savedNotes, FileText, "bg-emerald-100", "text-emerald-600", "No saved notes. Tap the heart on an item in Learning History.")}

      {section === "settings" && (
        <div className="space-y-3">
          {[
            { label: "Notifications", desc: "Study reminders and progress updates", icon: Bell },
            { label: "Privacy & Data", desc: "Manage your personal data", icon: Shield },
            { label: "Account Settings", desc: "Update your email and password", icon: Settings },
          ].map(s => {
            const Icon = s.icon;
            return (
              <button key={s.label} className="w-full bg-card rounded-2xl border border-border shadow-sm p-4 flex items-center gap-3 hover:bg-gray-50 transition text-left">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Icon style={{ width: 18, height: 18 }} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground text-sm">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </div>
                <ChevronRight style={{ width: 16, height: 16 }} className="text-muted-foreground flex-shrink-0" />
              </button>
            );
          })}
          <button onClick={onLogout}
            className="w-full bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 hover:bg-red-100 transition">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <LogOut style={{ width: 18, height: 18 }} className="text-red-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-red-600 text-sm">Sign Out</div>
              <div className="text-xs text-red-400">You will be returned to the login screen</div>
            </div>
          </button>
        </div>
      )}
      {act.modal}
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(Boolean(getToken()));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Restore session from the saved token
  useEffect(() => {
    if (!getToken()) return;
    api.me().then(r => { setUser(r.user); setPage("home"); }).catch(() => setToken(null)).finally(() => setBooting(false));
  }, []);

  const handleAuth = ({ token, user }) => { setToken(token); setUser(user); setPage("home"); };
  const handleLogout = () => { setToken(null); setUser(null); setPage("login"); };

  // Token expired/invalid mid-session
  useEffect(() => {
    window.addEventListener("studyai:unauthorized", handleLogout);
    return () => window.removeEventListener("studyai:unauthorized", handleLogout);
  }, []);

  if (booting) return <div style={FONT} className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  if (!user && page === "register") return <RegisterPage onBack={() => setPage("login")} onAuth={handleAuth} />;
  if (!user) return <LoginPage onAuth={handleAuth} onRegister={() => setPage("register")} />;

  const pageTitles = {
    home: "Home", assessment: "AI Study Assessment", planner: "AI Study Planner",
    materials: "AI Learning Materials", history: "Learning History", profile: "Profile",
  };

  return (
    <div style={FONT} className="flex h-screen bg-background overflow-hidden">
      <Sidebar currentPage={page} onNavigate={setPage} onLogout={handleLogout} user={user} open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-gray-100 transition">
            <Menu style={{ width: 20, height: 20 }} className="text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <Brain style={{ width: 18, height: 18 }} className="text-indigo-600" />
            <span className="font-bold text-foreground text-sm">{pageTitles[page]}</span>
          </div>
        </div>

        {page === "home" && <HomePage onNavigate={setPage} user={user} />}
        {page === "assessment" && <AssessmentPage />}
        {page === "planner" && <PlannerPage />}
        {page === "materials" && <MaterialsPage />}
        {page === "history" && <HistoryPage />}
        {page === "profile" && <ProfilePage user={user} onLogout={handleLogout} />}
      </main>
    </div>
  );
}
