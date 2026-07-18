import { useBettingStore } from "../store/useBettingStore";
import { KELLY_MODE_LABEL } from "../lib/types";
import { Layers } from "lucide-react";

export default function ParlayList() {
  const parlays = useBettingStore((s) => s.parlays);
  const selected = useBettingStore((s) => s.selectedParlay);
  const toggle = useBettingStore((s) => s.toggleParlay);
  const kellyMode = useBettingStore((s) => s.kellyMode);

  return (
    <section className="rounded-xl border border-base-700 bg-base-800/60 shadow-card">
      <div className="flex items-center justify-between border-b border-base-700 px-5 py-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-warn-400" />
          <h2 className="font-display text-sm font-semibold tracking-wide text-ink-50">
            串关推荐
          </h2>
          <span className="rounded-full bg-base-700 px-2 py-0.5 font-mono text-[10px] text-ink-400">
            {parlays.length} 组 · 正凯利
          </span>
        </div>
        <p className="hidden font-mono text-[10px] text-ink-600 sm:block">
          2串1 / 3串1
        </p>
      </div>

      {parlays.length === 0 ? (
        <div className="px-5 py-10 text-center font-mono text-xs text-ink-600">
          暂无正凯利串关组合，需至少 2 场比赛
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 p-4 lg:grid-cols-2">
          {parlays.map((p) => {
            const checked = selected.has(p.id);
            return (
              <label
                key={p.id}
                className={`group cursor-pointer rounded-lg border p-3 transition ${
                  checked
                    ? "border-accent-500/50 bg-accent-500/5 shadow-glow"
                    : "border-base-700 bg-base-900/40 hover:border-base-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="bet-check mt-0.5"
                    checked={checked}
                    onChange={() => toggle(p.id)}
                  />
                  <div className="min-w-0 flex-1">
                    {/* 组合描述 */}
                    <p className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-ink-50">
                      {p.legs.map((leg, i) => (
                        <span key={leg.id} className="flex items-center gap-1.5">
                          {i > 0 && (
                            <span className="font-mono text-warn-400">×</span>
                          )}
                          <span>
                            {leg.matchLabel.split(" vs ")[0]}
                            <span className="text-ink-500"> · {leg.option}</span>
                          </span>
                        </span>
                      ))}
                    </p>
                    {/* 数据 */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4 font-mono tnum text-[11px]">
                      <Metric label="组合赔率" value={p.combinedOdds.toFixed(2)} />
                      <Metric
                        label="组合概率"
                        value={(p.combinedProbability * 100).toFixed(2) + "%"}
                      />
                      <Metric
                        label="凯利"
                        value={(p.kelly * 100).toFixed(2) + "%"}
                        highlight
                      />
                      <Metric
                        label={KELLY_MODE_LABEL[kellyMode] + "金额"}
                        value={"¥" + p.suggestedAmount.toFixed(2)}
                      />
                    </div>
                  </div>
                  <span className="rounded bg-warn/10 px-1.5 py-0.5 font-mono text-[10px] text-warn-400">
                    {p.legs.length}串1
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wider text-ink-600">{label}</p>
      <p className={highlight ? "text-accent-400" : "text-ink-50"}>{value}</p>
    </div>
  );
}
