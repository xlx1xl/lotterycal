import type { MatchData, MatchRaw, OutcomeOption } from "./types";

const OUTCOME_LABELS: Record<string, string> = {
  win: "主胜",
  draw: "平局",
  loss: "客胜",
};

/**
 * 解析 odd.txt 文件内容。
 * 文件由多个 JSON 对象拼接而成（非数组），每个对象描述一场比赛。
 * 由于 probabilities 字段中 win/draw/loss 与 odds 平铺为重复键，
 * 标准 JSON.parse 会丢失数据，因此采用自定义解析提取每场的 probability 与 odds。
 */
export function parseOddFile(text: string): MatchData[] {
  const objects = splitJsonObjects(text);
  return objects.map((obj, idx) => normalizeMatch(obj, idx));
}

/**
 * 将文本切分为多个顶层 JSON 对象字符串。
 * 通过花括号深度匹配实现，能容忍对象间的空白与换行。
 */
function splitJsonObjects(text: string): string[] {
  const results: string[] = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escape = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && start >= 0) {
        results.push(text.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return results;
}

/**
 * 解析单场比赛原始对象。
 * 由于原文件 probabilities 中存在重复键（win/draw/loss 后紧跟 odds），
 * 这里用正则从原始文本中恢复每组的 probability 与 odds。
 */
function normalizeMatch(objStr: string, idx: number): MatchData {
  const raw = JSON.parse(objStr) as MatchRaw;
  const info = raw.match_info;

  // 从原始文本恢复胜平负的 probability 与 odds
  const outcomes = extractOutcomes(objStr);

  return {
    id: `match-${idx}`,
    league: info.league,
    homeTeam: info.home_team,
    awayTeam: info.away_team,
    matchTime: info.match_time,
    outcomes,
    scores: raw.top_three_scores ?? [],
    totalGoals: raw.top_total_goals ?? [],
  };
}

/**
 * 从原始文本提取胜平负的 probability 与 odds。
 * 原始结构形如：
 *   "win": 0.30, "odds": 2.98, "draw": 0.29, "odds": 3.64, ...
 * 每个 win/draw/loss 后面紧跟其 odds。
 */
function extractOutcomes(objStr: string): OutcomeOption[] {
  const result: OutcomeOption[] = [];
  const keys: Array<"win" | "draw" | "loss"> = ["win", "draw", "loss"];
  for (const key of keys) {
    const re = new RegExp(
      `"${key}"\\s*:\\s*([0-9.]+)\\s*,\\s*"odds"\\s*:\\s*([0-9.]+)`,
    );
    const m = re.exec(objStr);
    if (m) {
      result.push({
        key,
        label: OUTCOME_LABELS[key],
        probability: parseFloat(m[1]),
        odds: parseFloat(m[2]),
      });
    }
  }
  return result;
}
