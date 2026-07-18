import { useBettingStore } from "../store/useBettingStore";
import type { BetOption } from "../lib/types";
import { KELLY_MODE_LABEL } from "../lib/types";
import { TrendingUp } from "lucide-react";

const CATEGORY_STYLE: Record<BetOption["category"], string> = {
  胜平负: "text-accent-400 border-accent-500/30 bg-accent-500/10",
  比分: "text-warn-400 border-warn/30 bg-warn/10",
  总进球: "text-violet-300 border-violet-500/30 bg-violet-500/10",
};

export default function SingleBetTable() {
  const betOptions = useBettingStore((s) => s.betOptions);
  const selected = useBettingStore((s) => s.selectedSingle);
  const toggle = useBettingStore((s) => s.toggleSingle);
  const kellyMode = useBettingStore((s) => s.kellyMode);

  // 仅展示正凯利比例，按凯利降序
  const positive = betOptions
    .filter((o) => o.kelly > 0)
    .sort((a, b) => b.kelly - a.kelly);

  return (
    <section className="rounded-xl border border-base-700 bg-base-800/60 shadow-card">
      <div className="flex items-center justify-between border-b border-base-700 px-5 py-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent-400" />
          <h2 className="font-display text-sm font-semibold tracking-wide text-ink-50">
            单关推荐
          </h2>
          <span className="rounded-full bg-base-700 px-2 py-0.5 font-mono text-[10px] text-ink-400">
            {positive.length} 项 · 正凯利
          </span>
        </div>
        <p className="hidden font-mono text-[10px] text-ink-600 sm:block">
          勾选后加入投注单
        </p>
      </div>

      {positive.length === 0 ? (
        <EmptyHint text="暂无正凯利单关选项，请上传数据或加载示例" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-700 text-left font-mono text-[10px] uppercase tracking-wider text-ink-600">
                <th className="w-10 px-4 py-2"></th>
                <th className="px-2 py-2">选项</th>
                <th className="px-2 py-2 text-right">概率</th>
                <th className="px-2 py-2 text-right">赔率</th>
                <th className="px-2 py-2 text-right">凯利 f*</th>
                <th className="px-2 py-2 text-right">EV</th>
                <th className="px-4 py-2 text-right">
                  建议金额
                  <span className="ml-1.5 rounded bg-accent-500/10 px-1 py-0.5 text-[9px] text-accent-400">
                    {KELLY_MODE_LABEL[kellyMode]}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {positive.map((opt) => {
                const checked = selected.has(opt.id);
                return (
                  <tr
                    key={opt.id}
                    className={`border-b border-base-800/60 transition hover:bg-base-750/50 ${
                      checked ? "bg-accent-500/5" : ""
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <input
                        type="checkbox"
                        className="bet-check"
                        checked={checked}
                        onChange={() => toggle(opt.id)}
                      />
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex flex-col gap-1">
                        <span className="text-ink-50">{opt.matchLabel}</span>
                        <span className="flex items-center gap-1.5">
                          <span
                            className={`rounded border px-1.5 py-0.5 text-[10px] ${CATEGORY_STYLE[opt.category]}`}
                          >
                            {opt.category}
                          </span>
                          <span className="text-ink-400">{opt.option}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-right font-mono tnum text-ink-400">
                      {(opt.probability * 100).toFixed(1)}%
                    </td>
                    <td className="px-2 py-2.5 text-right font-mono tnum text-ink-50">
                      {opt.odds.toFixed(2)}
                    </td>
                    <td className="px-2 py-2.5 text-right font-mono tnum font-semibold text-accent-400">
                      {(opt.kelly * 100).toFixed(2)}%
                    </td>
                    <td className="px-2 py-2.5 text-right font-mono tnum text-accent-400/80">
                      +{(opt.ev * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tnum font-semibold text-ink-50">
                      ¥{opt.suggestedAmount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="px-5 py-10 text-center font-mono text-xs text-ink-600">
      {text}
    </div>
  );
}
