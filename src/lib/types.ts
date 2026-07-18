// 输入数据模型：odd.txt 中的单场比赛数据
export interface MatchRaw {
  match_info: {
    league: string;
    home_team: string;
    away_team: string;
    match_time: string;
  };
  // 胜平负：原文件中 win/draw/loss 与 odds 平铺为重复键，
  // JSON.parse 仅保留最后一个 odds，因此解析时需特殊处理
  probabilities: Record<string, number>;
  top_three_scores: Array<{
    score: string;
    probability: number;
    odds: number;
  }>;
  top_total_goals: Array<{
    goals: number;
    probability: number;
    odds: number;
  }>;
}

// 胜平负单项（解析后归一化结构）
export interface OutcomeOption {
  key: "win" | "draw" | "loss";
  label: string;
  probability: number;
  odds: number;
}

// 解析后的单场比赛
export interface MatchData {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  matchTime: string;
  outcomes: OutcomeOption[]; // 胜平负
  scores: MatchRaw["top_three_scores"];
  totalGoals: MatchRaw["top_total_goals"];
}

// 单个投注选项（单关）
export interface BetOption {
  id: string;
  matchId: string;
  matchLabel: string;
  category: "胜平负" | "比分" | "总进球";
  option: string;
  probability: number;
  odds: number;
  kelly: number;
  ev: number;
  suggestedAmount: number;
}

// 串关组合
export interface ParlayOption {
  id: string;
  legs: BetOption[];
  combinedOdds: number;
  combinedProbability: number;
  kelly: number;
  ev: number;
  suggestedAmount: number;
  label: string;
}

// 凯利模式
export type KellyMode = "full" | "half" | "quarter";

export const KELLY_MODE_LABEL: Record<KellyMode, string> = {
  full: "全凯利",
  half: "半凯利",
  quarter: "四分之一凯利",
};

// 导出投注行（CSV 每行结构）
export interface ExportRow {
  type: "单关" | "串关";
  label: string;
  odds: number;
  probability: number;
  kelly: number;
  kellyMode: string;
  suggestedAmount: number;
  expectedReturn: number;
  exportedAt: string;
  totalBankroll: number;
}
