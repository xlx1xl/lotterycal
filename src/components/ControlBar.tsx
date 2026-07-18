import { useRef } from "react";
import { Upload, Wallet, FlaskConical, Crosshair, Gauge } from "lucide-react";
import { useBettingStore } from "../store/useBettingStore";
import type { KellyMode } from "../lib/types";
import { KELLY_MODE_LABEL } from "../lib/types";

export default function ControlBar() {
  const fileRef = useRef<HTMLInputElement>(null);
  const bankroll = useBettingStore((s) => s.bankroll);
  const setBankroll = useBettingStore((s) => s.setBankroll);
  const kellyMode = useBettingStore((s) => s.kellyMode);
  const setKellyMode = useBettingStore((s) => s.setKellyMode);
  const loadFromText = useBettingStore((s) => s.loadFromText);
  const loadSample = useBettingStore((s) => s.loadSample);
  const matches = useBettingStore((s) => s.matches);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => loadFromText(String(reader.result));
    reader.readAsText(file);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-base-700 bg-base-850/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <div className="flex flex-shrink-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500/15 ring-1 ring-accent-500/30">
            <Crosshair className="h-5 w-5 text-accent-400" />
          </div>
          <div className="leading-tight">
            <h1 className="font-display text-lg font-bold tracking-tight text-ink-50">
              凯利投注计算器
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-600">
              Kelly Bet Terminal
            </p>
          </div>
        </div>

        <div className="hidden h-8 w-px bg-base-700 lg:block" />

        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-ink-500" />
          <label className="text-xs font-medium text-ink-400">总资金</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-ink-600">
              ¥
            </span>
            <input
              type="number"
              min={0}
              value={bankroll}
              onChange={(e) => setBankroll(Number(e.target.value))}
              className="tnum w-32 rounded-lg border border-base-600 bg-base-800 py-1.5 pl-7 pr-3 font-mono text-sm text-ink-50 outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-500/40"
            />
          </div>
        </div>

        <div className="hidden h-8 w-px bg-base-700 lg:block" />

        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-ink-500" />
          <label className="text-xs font-medium text-ink-400">投注模式</label>
          <div className="flex overflow-hidden rounded-lg border border-base-600 bg-base-800 p-0.5">
            {(["full", "half", "quarter"] as KellyMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setKellyMode(mode)}
                className={`px-2.5 py-1 text-xs font-semibold transition ${
                  kellyMode === mode
                    ? "rounded-md bg-accent-500 text-base-900"
                    : "text-ink-500 hover:text-ink-50"
                }`}
              >
                {KELLY_MODE_LABEL[mode]}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-base-900 transition hover:bg-accent-400 active:scale-95"
          >
            <Upload className="h-4 w-4" />
            上传 odd.txt
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          <button
            onClick={loadSample}
            className="inline-flex items-center gap-2 rounded-lg border border-base-600 bg-base-800 px-4 py-2 text-sm font-semibold text-ink-400 transition hover:border-accent-500/50 hover:text-ink-50 active:scale-95"
          >
            <FlaskConical className="h-4 w-4" />
            加载示例
          </button>
        </div>
      </div>

      {matches.length > 0 && (
        <div className="border-t border-base-800 bg-base-900/60 px-6 py-1.5">
          <div className="mx-auto flex max-w-[1800px] items-center gap-4 font-mono text-[11px] text-ink-600">
            <span>
              已加载 <span className="text-accent-400">{matches.length}</span> 场比赛
            </span>
            <span className="text-base-600">·</span>
            <span>凯利比例 f* = (p·o − 1) / (o − 1)</span>
            <span className="text-base-600">·</span>
            <span>
              建议金额 = {KELLY_MODE_LABEL[kellyMode]} × 总资金
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
