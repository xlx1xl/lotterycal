import ControlBar from "@/components/ControlBar";
import MatchCard from "@/components/MatchCard";
import SingleBetTable from "@/components/SingleBetTable";
import ParlayList from "@/components/ParlayList";
import SelectionSummary from "@/components/SelectionSummary";
import { useBettingStore } from "@/store/useBettingStore";
import { useEffect } from "react";

export default function Home() {
  const matches = useBettingStore((s) => s.matches);
  const error = useBettingStore((s) => s.error);

  useEffect(() => {
    // 默认加载示例数据，方便首次使用
    useBettingStore.getState().loadSample();
  }, []);

  return (
    <div className="grid-bg flex min-h-full flex-col">
      <ControlBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-5">
        {error && (
          <div className="mb-4 rounded-lg border border-danger-600/30 bg-danger-600/10 px-4 py-3 text-sm text-danger-400">
            文件解析错误：{error}
          </div>
        )}

        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-base-600 bg-base-800/30 py-24 text-center">
            <p className="font-display text-xl font-semibold text-ink-50">
              暂无比赛数据
            </p>
            <p className="mt-2 max-w-md text-sm text-ink-600">
              点击右上角「上传 odd.txt」读取本地赔率文件，或点击「加载示例」查看效果。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              {/* 比赛数据 */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-display text-sm font-semibold tracking-wide text-ink-50">
                    比赛数据
                  </h2>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-600">
                    Match Data
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {matches.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              </section>

              {/* 单关推荐 */}
              <SingleBetTable />

              {/* 串关推荐 */}
              <ParlayList />
            </div>

            {/* 投注单汇总侧栏 */}
            <SelectionSummary />
          </div>
        )}
      </main>
    </div>
  );
}
