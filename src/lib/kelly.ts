import type {
  BetOption,
  KellyMode,
  MatchData,
  ParlayOption,
} from "./types";

/**
 * 凯利比例：f* = (p * o - 1) / (o - 1)
 */
export function kellyFraction(probability: number, odds: number): number {
  if (odds <= 1) return 0;
  return (probability * odds - 1) / (odds - 1);
}

/**
 * 期望价值：EV = p * o - 1
 */
export function expectedValue(probability: number, odds: number): number {
  return probability * odds - 1;
}

/**
 * 根据凯利模式获取资金乘数。
 */
export function kellyMultiplier(mode: KellyMode): number {
  switch (mode) {
    case "full":
      return 1;
    case "half":
      return 0.5;
    case "quarter":
      return 0.25;
    default:
      return 0.5;
  }
}

/**
 * 建议金额（按凯利模式缩放），并向下取整为 2 的倍数，便于实际投注。
 */
export function suggestedAmount(
  kelly: number,
  bankroll: number,
  mode: KellyMode = "half",
): number {
  const raw = Math.max(0, kelly * kellyMultiplier(mode) * bankroll);
  return Math.floor(raw / 2) * 2;
}

/**
 * 从单场比赛生成所有投注选项（胜平负 / 比分 / 总进球）。
 */
export function buildBetOptions(
  matches: MatchData[],
  bankroll: number,
  mode: KellyMode = "half",
): BetOption[] {
  const options: BetOption[] = [];
  for (const match of matches) {
    const matchLabel = `${match.homeTeam} vs ${match.awayTeam}`;
    // 胜平负
    for (const o of match.outcomes) {
      options.push(
        makeOption(match.id, matchLabel, "胜平负", o.label, o.probability, o.odds, bankroll, mode),
      );
    }
    // 比分
    for (const s of match.scores) {
      options.push(
        makeOption(match.id, matchLabel, "比分", s.score, s.probability, s.odds, bankroll, mode),
      );
    }
    // 总进球
    for (const g of match.totalGoals) {
      options.push(
        makeOption(match.id, matchLabel, "总进球", `${g.goals}球`, g.probability, g.odds, bankroll, mode),
      );
    }
  }
  return options;
}

function makeOption(
  matchId: string,
  matchLabel: string,
  category: BetOption["category"],
  option: string,
  probability: number,
  odds: number,
  bankroll: number,
  mode: KellyMode,
): BetOption {
  const kelly = kellyFraction(probability, odds);
  const ev = expectedValue(probability, odds);
  return {
    id: `${matchId}|${category}|${option}`,
    matchId,
    matchLabel,
    category,
    option,
    probability,
    odds,
    kelly,
    ev,
    suggestedAmount: suggestedAmount(kelly, bankroll, mode),
  };
}

/**
 * 生成串关组合（2串1 与 3串1）。
 * 策略：每场比赛取凯利最高的正EV选项参与串关，避免组合爆炸。
 * 仅保留组合凯利 > 0 的组合，按凯利降序排列。
 */
export function buildParlays(
  matches: MatchData[],
  bankroll: number,
  mode: KellyMode = "half",
  maxParlaySize = 3,
  topN = 12,
): ParlayOption[] {
  // 每场比赛取凯利最高的正EV单关选项（参与串关的腿候选）
  const legCandidates: BetOption[] = [];
  for (const match of matches) {
    const all = buildBetOptions([match], bankroll, mode);
    const positive = all
      .filter((o) => o.kelly > 0)
      .sort((a, b) => b.kelly - a.kelly);
    // 每场最多取 2 个最佳腿
    legCandidates.push(...positive.slice(0, 2));
  }

  if (legCandidates.length < 2) return [];

  const parlays: ParlayOption[] = [];

  // 生成 2串1 ~ N串1
  for (let size = 2; size <= Math.min(maxParlaySize, legCandidates.length); size++) {
    const combos = combinations(legCandidates, size);
    for (const combo of combos) {
      // 同一场比赛不能出现在同一串关中
      const matchIds = new Set(combo.map((c) => c.matchId));
      if (matchIds.size !== combo.length) continue;

      const combinedOdds = combo.reduce((acc, c) => acc * c.odds, 1);
      const combinedProbability = combo.reduce((acc, c) => acc * c.probability, 1);
      const kelly = kellyFraction(combinedProbability, combinedOdds);
      if (kelly <= 0) continue;
      const ev = expectedValue(combinedProbability, combinedOdds);

      parlays.push({
        id: `parlay|${combo.map((c) => c.id).join("|")}`,
        legs: combo,
        combinedOdds,
        combinedProbability,
        kelly,
        ev,
        suggestedAmount: suggestedAmount(kelly, bankroll, mode),
        label: combo
          .map((c) => `${c.matchLabel.split(" vs ")[0]}·${c.option}`)
          .join(" × "),
      });
    }
  }

  return parlays.sort((a, b) => b.kelly - a.kelly).slice(0, topN);
}

/** 组合 C(n, k) */
function combinations<T>(arr: T[], k: number): T[][] {
  const result: T[][] = [];
  const combo: T[] = [];
  function backtrack(start: number) {
    if (combo.length === k) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      backtrack(i + 1);
      combo.pop();
    }
  }
  backtrack(0);
  return result;
}
