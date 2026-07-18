import { useState } from "react";
import type { MatchData } from "../lib/types";
import { useBettingStore } from "../store/useBettingStore";

export default function MatchCard({ match }: { match: MatchData }) {
  const updateOutcome = useBettingStore((s) => s.updateOutcome);
  const updateScore = useBettingStore((s) => s.updateScore);
  const updateTotalGoal = useBettingStore((s) => s.updateTotalGoal);

  return (
    <div className="animate-fade-up overflow-hidden rounded-xl border border-base-700 bg-base-800/60 p-5 shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-md bg-base-700 px-2 py-0.5 font-mono text-[11px] tracking-wide text-ink-400">
          {match.league}
        </span>
        <span className="font-mono text-[11px] text-ink-600">{match.matchTime}</span>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <span className="font-display text-lg font-semibold text-ink-50">
          {match.homeTeam}
        </span>
        <span className="rounded bg-base-700 px-2 py-0.5 font-mono text-xs text-ink-500">
          VS
        </span>
        <span className="font-display text-lg font-semibold text-ink-50">
          {match.awayTeam}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <DataBlock title="胜平负">
          {match.outcomes.map((o) => (
            <DataRow
              key={o.key}
              label={o.label}
              prob={o.probability}
              odds={o.odds}
              editable
              onProbChange={(v) =>
                updateOutcome(match.id, o.key, "probability", v)
              }
              onOddsChange={(v) => updateOutcome(match.id, o.key, "odds", v)}
            />
          ))}
        </DataBlock>

        <DataBlock title="Top 比分">
          {match.scores.map((s) => (
            <DataRow
              key={s.score}
              label={s.score}
              prob={s.probability}
              odds={s.odds}
              editable
              onProbChange={(v) =>
                updateScore(match.id, s.score, "probability", v)
              }
              onOddsChange={(v) => updateScore(match.id, s.score, "odds", v)}
            />
          ))}
        </DataBlock>

        <DataBlock title="Top 总进球">
          {match.totalGoals.map((g) => (
            <DataRow
              key={g.goals}
              label={`${g.goals}球`}
              prob={g.probability}
              odds={g.odds}
              editable
              onProbChange={(v) =>
                updateTotalGoal(match.id, g.goals, "probability", v)
              }
              onOddsChange={(v) =>
                updateTotalGoal(match.id, g.goals, "odds", v)
              }
            />
          ))}
        </DataBlock>
      </div>

      <p className="mt-3 font-mono text-[9px] text-ink-600">
        提示：点击概率或赔率数字可直接修改，修改后单关/串关推荐会实时重算。
      </p>
    </div>
  );
}

function DataBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-base-700/60 bg-base-900/40 p-3">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-600">
        {title}
      </p>
      <div className="space-y-1.5 overflow-hidden">{children}</div>
    </div>
  );
}

function DataRow({
  label,
  prob,
  odds,
  editable,
  onProbChange,
  onOddsChange,
}: {
  label: string;
  prob: number;
  odds: number;
  editable?: boolean;
  onProbChange?: (v: number) => void;
  onOddsChange?: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="min-w-0 shrink truncate text-ink-400">{label}</span>
      <span className="flex shrink-0 items-center gap-2 whitespace-nowrap font-mono tnum">
        <EditableNumber
          value={prob}
          mode="percent"
          editable={editable}
          onChange={onProbChange}
        />
        <EditableNumber
          value={odds}
          mode="odds"
          editable={editable}
          onChange={onOddsChange}
        />
      </span>
    </div>
  );
}

function EditableNumber({
  value,
  mode,
  editable,
  onChange,
}: {
  value: number;
  mode: "percent" | "odds";
  editable?: boolean;
  onChange?: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState("");

  const display =
    mode === "percent"
      ? `${(value * 100).toFixed(0)}%`
      : value.toFixed(2);

  if (!editable || !onChange) {
    return (
      <span
        className={`text-right ${
          mode === "percent" ? "text-ink-500" : "text-accent-400"
        }`}
      >
        {display}
      </span>
    );
  }

  const startEdit = () => {
    setRaw(
      mode === "percent" ? (value * 100).toFixed(1) : value.toFixed(2),
    );
    setEditing(true);
  };

  const commit = () => {
    const n = parseFloat(raw);
    if (!isNaN(n) && n >= 0) {
      onChange(mode === "percent" ? n / 100 : n);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        type="number"
        min={0}
        step={mode === "percent" ? 0.1 : 0.01}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        autoFocus
        className={`tnum w-14 rounded border border-accent-500 bg-base-800 px-1 py-0.5 text-right text-xs text-ink-50 outline-none focus:ring-1 focus:ring-accent-500/40`}
      />
    );
  }

  return (
    <button
      onClick={startEdit}
      title="点击修改"
      className={`tnum rounded border border-transparent px-1 py-0.5 text-right transition hover:border-base-600 hover:bg-base-800 ${
        mode === "percent" ? "text-ink-500" : "text-accent-400"
      }`}
    >
      {display}
    </button>
  );
}
