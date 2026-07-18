import { useMemo } from "react";
import { Download, Trash2, ShoppingBag } from "lucide-react";
import { useBettingStore } from "../store/useBettingStore";
import { exportToCsv } from "../lib/export";
import type { ExportRow } from "../lib/types";
import { KELLY_MODE_LABEL } from "../lib/types";

export default function SelectionSummary() {
  const betOptions = useBettingStore((s) => s.betOptions);
  const parlays = useBettingStore((s) => s.parlays);
  const selectedSingle = useBettingStore((s) => s.selectedSingle);
  const selectedParlay = useBettingStore((s) => s.selectedParlay);
  const clearSelection = useBettingStore((s) => s.clearSelection);
  const bankroll = useBettingStore((s) => s.bankroll);
  const kellyMode = useBettingStore((s) => s.kellyMode);

  const selectedSingles = useMemo(
    () => betOptions.filter((o) => selectedSingle.has(o.id)),
    [betOptions, selectedSingle],
  );
  const selectedParlays = useMemo(
    () => parlays.filter((p) => selectedParlay.has(p.id)),
    [parlays, selectedParlay],
  );

  const totalSuggested =
    selectedSingles.reduce((acc, o) => acc + o.suggestedAmount, 0) +
    selectedParlays.reduce((acc, p) => acc + p.suggestedAmount, 0);

  const totalExpectedReturn =
    selectedSingles.reduce((acc, o) => acc + o.suggestedAmount * o.odds, 0) +
    selectedParlays.reduce((acc, p) => acc + p.suggestedAmount * p.combinedOdds, 0);

  const count = selectedSingles.length + selectedParlays.length;

  const handleExport = () => {
    if (count === 0) return;
    const now = new Date().toLocaleString("zh-CN", { hour12: false });
    const rows: ExportRow[] = [
      ...selectedSingles.map((o) => ({
        type: "单关" as const,
        label: `${o.matchLabel} - ${o.category} ${o.option}`,
        odds: o.odds,
        probability: o.probability,
        kelly: o.kelly,
        kellyMode: KELLY_MODE_LABEL[kellyMode],
        suggestedAmount: o.suggestedAmount,
        expectedReturn: o.suggestedAmount * o.odds,
        exportedAt: now,
        totalBankroll: bankroll,
      })),
      ...selectedParlays.map((p) => ({
        type: "串关" as const,
        label: p.legs
          .map((l) => `${l.matchLabel.split(" vs ")[0]}·${l.option}`)
          .join(" × "),
        odds: p.combinedOdds,
        probability: p.combinedProbability,
        kelly: p.kelly,
        kellyMode: KELLY_MODE_LABEL[kellyMode],
        suggestedAmount: p.suggestedAmount,
        expectedReturn: p.suggestedAmount * p.combinedOdds,
        exportedAt: now,
        totalBankroll: bankroll,
      })),
    ];
    exportToCsv(rows);
  };

  return (
    <aside className="sticky top-[5.5rem] flex max-h-[calc(100vh-7rem)] flex-col rounded-xl border border-base-700 bg-base-850 shadow-card lg:max-h-[calc(100vh-8rem)]">
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-base-700 px-5 py-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-accent-400" />
          <h2 className="font-display text-sm font-semibold tracking-wide text-ink-50">
            投注单
          </h2>
          <span className="rounded-full bg-accent-500/15 px-2 py-0.5 font-mono text-[10px] text-accent-400">
            {count}
          </span>
          <span className="rounded bg-base-700 px-1.5 py-0.5 font-mono text-[9px] text-ink-500">
            {KELLY_MODE_LABEL[kellyMode]}
          </span>
        </div>
        {count > 0 && (
          <button
            onClick={clearSelection}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-ink-600 transition hover:text-danger-400"
          >
            <Trash2 className="h-3 w-3" />
            清空
          </button>
        )}
      </div>

      {/* 列表 */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        {count === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <ShoppingBag className="mb-3 h-8 w-8 text-base-600" />
            <p className="font-mono text-xs text-ink-600">
              勾选左侧推荐项
              <br />
              加入投注单
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {selectedSingles.map((o) => (
              <li
                key={o.id}
                className="rounded-lg border border-base-700/60 bg-base-900/40 p-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-accent-500/10 px-1.5 py-0.5 font-mono text-[9px] text-accent-400">
                    单关
                  </span>
                  <span className="font-mono tnum text-xs text-accent-400">
                    ¥{o.suggestedAmount.toFixed(2)}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-ink-400">
                  {o.matchLabel} · {o.option}
                </p>
                <p className="font-mono tnum text-[10px] text-ink-600">
                  赔率 {o.odds.toFixed(2)} · 凯利 {(o.kelly * 100).toFixed(1)}%
                </p>
              </li>
            ))}
            {selectedParlays.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-warn/20 bg-warn/5 p-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-warn/10 px-1.5 py-0.5 font-mono text-[9px] text-warn-400">
                    {p.legs.length}串1
                  </span>
                  <span className="font-mono tnum text-xs text-accent-400">
                    ¥{p.suggestedAmount.toFixed(2)}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-ink-400">{p.label}</p>
                <p className="font-mono tnum text-[10px] text-ink-600">
                  组合赔率 {p.combinedOdds.toFixed(2)} · 凯利{" "}
                  {(p.kelly * 100).toFixed(1)}%
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 汇总 + 导出 */}
      {count > 0 && (
        <div className="border-t border-base-700 px-5 py-3">
          <div className="mb-3 space-y-1 font-mono tnum text-xs">
            <div className="flex justify-between text-ink-500">
              <span>建议投注合计</span>
              <span>¥{totalSuggested.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-ink-500">
              <span>占资金比</span>
              <span>
                {bankroll > 0
                  ? ((totalSuggested / bankroll) * 100).toFixed(1)
                  : "0"}
                %
              </span>
            </div>
            <div className="flex justify-between border-t border-base-700 pt-1 text-accent-400">
              <span>预期回报合计</span>
              <span>¥{totalExpectedReturn.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 py-2.5 text-sm font-semibold text-base-900 transition hover:bg-accent-400 active:scale-95"
          >
            <Download className="h-4 w-4" />
            导出 CSV 投注单
          </button>
        </div>
      )}
    </aside>
  );
}
