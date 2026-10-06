import { useState } from "react";
import { Award, Check, Target, Sparkles, Download, X, AlertCircle } from "lucide-react";

const BADGE = { High: "bg-red-100 text-red-600", Medium: "bg-amber-100 text-amber-600", Low: "bg-green-100 text-green-700" };
const DIFF = { Easy: "bg-green-100 text-green-700", Medium: "bg-amber-100 text-amber-700", Hard: "bg-red-100 text-red-700" };
const SLOT_COLORS = [
  "bg-indigo-100 text-indigo-800 border-indigo-200", "bg-blue-100 text-blue-800 border-blue-200",
  "bg-purple-100 text-purple-800 border-purple-200", "bg-emerald-100 text-emerald-800 border-emerald-200",
  "bg-amber-100 text-amber-800 border-amber-200", "bg-rose-100 text-rose-800 border-rose-200",
];
const colorFor = (s) => SLOT_COLORS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % SLOT_COLORS.length];
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

export function DemoBadge({ source }) {
  if (source !== "demo") return null;
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
      <AlertCircle style={{ width: 14, height: 14 }} className="mt-0.5 flex-shrink-0" />
      <span>Demo mode: this is template content. Set <code>ANTHROPIC_API_KEY</code> on the server to get real AI output.</span>
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-700 flex items-center gap-3">
      <AlertCircle style={{ width: 18, height: 18 }} className="flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && <button onClick={onRetry} className="font-semibold underline">Try again</button>}
    </div>
  );
}

// ── Assessment ────────────────────────────────────────────────────────────────
export function AssessmentResult({ item }) {
  const o = item.output;
  const total = sum(o.topics.map((t) => t.hours));
  return (
    <div className="space-y-5">
      <DemoBadge source={item.source} />
      <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Award style={{ width: 20, height: 20 }} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-foreground">{item.subject} Assessment Complete</div>
          <div className="text-xs text-muted-foreground">Level: {item.input?.level} · ~{total} hours to exam readiness</div>
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{o.summary}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <Check style={{ width: 14, height: 14 }} className="text-green-600" />
            <span className="text-xs font-bold text-green-800 uppercase tracking-wide">Strong Areas</span>
          </div>
          {o.strongAreas.map((a) => (
            <div key={a} className="text-xs text-green-700 flex items-center gap-1.5 mt-1.5"><div className="w-1 h-1 rounded-full bg-green-500 flex-shrink-0" />{a}</div>
          ))}
        </div>
        <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <Target style={{ width: 14, height: 14 }} className="text-red-600" />
            <span className="text-xs font-bold text-red-800 uppercase tracking-wide">Improve These</span>
          </div>
          {o.weakAreas.map((a) => (
            <div key={a} className="text-xs text-red-700 flex items-center gap-1.5 mt-1.5"><div className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />{a}</div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Recommended Study Topics</h3>
        <div className="space-y-2">
          {o.topics.map((t, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-gray-50">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">{i + 1}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{t.topic}</div>
                <div className="text-xs text-muted-foreground">{t.hours} hours recommended</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${BADGE[t.priority]}`}>{t.priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Planner ───────────────────────────────────────────────────────────────────
export function PlanResult({ item }) {
  const o = item.output;
  return (
    <div className="space-y-4">
      <DemoBadge source={item.source} />
      <p className="text-sm text-gray-700 leading-relaxed">{o.summary}</p>
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-gray-50"><h3 className="font-bold text-foreground text-sm">Weekly Schedule</h3></div>
        <div className="divide-y divide-border">
          {o.week.map((day) => (
            <div key={day.day} className="flex gap-4 px-5 py-3">
              <div className="w-20 text-xs font-bold text-muted-foreground pt-1.5 flex-shrink-0">{day.day}</div>
              <div className="flex flex-wrap gap-2 flex-1">
                {day.slots.map((s, i) => (
                  <div key={i} className={`px-3 py-2 rounded-xl border text-xs ${colorFor(s.subject)}`}>
                    <div className="font-bold">{s.subject}</div>
                    <div className="opacity-70 mt-0.5">{s.topic} · {s.hours}h</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles style={{ width: 14, height: 14 }} className="text-amber-600" />
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">AI Study Tips</span>
        </div>
        <ul className="text-sm text-amber-700 space-y-1">{o.tips.map((t, i) => <li key={i}>· {t}</li>)}</ul>
      </div>
    </div>
  );
}

// ── Materials ─────────────────────────────────────────────────────────────────
function Flashcard({ card }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button onClick={() => setFlipped(!flipped)}
      className={`text-left rounded-2xl border p-4 min-h-[110px] transition shadow-sm ${flipped ? "bg-emerald-50 border-emerald-200" : "bg-card border-border hover:shadow-md"}`}>
      <div className="text-[10px] font-bold uppercase tracking-wide mb-1.5 text-muted-foreground">{flipped ? "Answer" : "Question — tap to flip"}</div>
      <div className={`text-sm ${flipped ? "text-emerald-900" : "font-semibold text-foreground"}`}>{flipped ? card.back : card.front}</div>
    </button>
  );
}

export function MaterialResult({ item, initialTab }) {
  const o = item.output;
  const defaultTab = initialTab || (item.input?.type === "Practice Questions" ? "questions" : item.input?.type === "Flashcards" ? "cards" : "notes");
  const [tab, setTab] = useState(defaultTab);
  const tabs = [{ id: "notes", label: "Notes" }, { id: "questions", label: "Questions" }, { id: "cards", label: "Flashcards" }];
  return (
    <div className="space-y-4">
      <DemoBadge source={item.source} />
      <p className="text-sm text-gray-700 leading-relaxed">{o.summary}</p>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${tab === t.id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "notes" && (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-5">
          {o.notes.map((s, i) => (
            <div key={i}>
              <h4 className="font-bold text-foreground text-sm mb-1.5">{s.heading}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
          ))}
        </div>
      )}
      {tab === "questions" && (
        <div className="space-y-3">
          {o.questions.map((q, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border shadow-sm p-4 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 flex-shrink-0 mt-0.5">{i + 1}</div>
              <div className="flex-1">
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold mb-2 ${DIFF[q.diff]}`}>{q.diff}</span>
                <p className="text-sm font-semibold text-foreground mb-2">{q.q}</p>
                <details>
                  <summary className="text-xs text-emerald-600 cursor-pointer font-semibold hover:underline list-none">Show Answer ▾</summary>
                  <div className="mt-2 px-3 py-2 bg-emerald-50 rounded-xl text-sm text-emerald-800 font-semibold border border-emerald-100 whitespace-pre-line">{q.a}</div>
                </details>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === "cards" && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{o.flashcards.map((c, i) => <Flashcard key={i} card={c} />)}</div>}
    </div>
  );
}

export const ResultFor = ({ item }) =>
  item.type === "assessment" ? <AssessmentResult item={item} /> : item.type === "plan" ? <PlanResult item={item} /> : <MaterialResult item={item} />;

// ── Download as Markdown ────────────────────────────────────────────────────────
export function toMarkdown(item) {
  const o = item.output;
  const L = [`# ${item.title}`, `*${item.subject}*`, ""];
  if (o.summary) L.push(o.summary, "");
  if (item.type === "assessment") {
    L.push("## Strong areas", ...o.strongAreas.map((a) => `- ${a}`), "", "## Improve these", ...o.weakAreas.map((a) => `- ${a}`), "", "## Recommended topics");
    o.topics.forEach((t, i) => L.push(`${i + 1}. **${t.topic}** — ${t.priority}, ${t.hours}h`));
  } else if (item.type === "plan") {
    o.week.forEach((d) => { L.push(`## ${d.day}`); d.slots.forEach((s) => L.push(`- ${s.subject}: ${s.topic} (${s.hours}h)`)); L.push(""); });
    L.push("## Tips", ...o.tips.map((t) => `- ${t}`));
  } else {
    o.notes.forEach((n) => L.push(`## ${n.heading}`, n.body, ""));
    L.push("## Practice questions");
    o.questions.forEach((q, i) => L.push(`${i + 1}. (${q.diff}) ${q.q}`, `   - Answer: ${q.a}`));
    L.push("", "## Flashcards", ...o.flashcards.map((c) => `- **${c.front}** → ${c.back}`));
  }
  return L.join("\n");
}

export function downloadItem(item) {
  const blob = new Blob([toMarkdown(item)], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${item.title.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-").toLowerCase() || "studyai"}.md`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function DownloadButton({ item, className = "" }) {
  return (
    <button onClick={() => downloadItem(item)} className={className}>
      <Download style={{ width: 14, height: 14 }} /> Download
    </button>
  );
}

// ── Modal to open any saved item ──────────────────────────────────────────────────
export function ItemModal({ item, loading, error, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-background rounded-3xl w-full max-w-3xl my-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground truncate pr-4">{item?.title || "Loading…"}</h2>
          <div className="flex items-center gap-2 flex-shrink-0">
            {item && <DownloadButton item={item} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition" />}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X style={{ width: 18, height: 18 }} /></button>
          </div>
        </div>
        <div className="p-6">
          {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {error && <ErrorBox message={error} />}
          {item && <ResultFor item={item} />}
        </div>
      </div>
    </div>
  );
}
