import { create } from "zustand";
import type { BetOption, KellyMode, MatchData, ParlayOption } from "../lib/types";
import { buildBetOptions, buildParlays } from "../lib/kelly";
import { parseOddFile } from "../lib/parser";
import { SAMPLE_ODD_TXT } from "../lib/sampleData";

interface BettingState {
  matches: MatchData[];
  bankroll: number;
  kellyMode: KellyMode;
  betOptions: BetOption[];
  parlays: ParlayOption[];
  selectedSingle: Set<string>;
  selectedParlay: Set<string>;
  error: string | null;

  setBankroll: (v: number) => void;
  setKellyMode: (mode: KellyMode) => void;
  loadFromText: (text: string) => void;
  loadSample: () => void;
  updateOutcome: (
    matchId: string,
    key: "win" | "draw" | "loss",
    field: "probability" | "odds",
    value: number,
  ) => void;
  updateScore: (
    matchId: string,
    score: string,
    field: "probability" | "odds",
    value: number,
  ) => void;
  updateTotalGoal: (
    matchId: string,
    goals: number,
    field: "probability" | "odds",
    value: number,
  ) => void;
  toggleSingle: (id: string) => void;
  toggleParlay: (id: string) => void;
  clearSelection: () => void;
}

function recalc(state: BettingState) {
  return {
    betOptions: buildBetOptions(state.matches, state.bankroll, state.kellyMode),
    parlays: buildParlays(state.matches, state.bankroll, state.kellyMode),
  };
}

export const useBettingStore = create<BettingState>((set, get) => ({
  matches: [],
  bankroll: 1000,
  kellyMode: "half",
  betOptions: [],
  parlays: [],
  selectedSingle: new Set(),
  selectedParlay: new Set(),
  error: null,

  setBankroll: (v) => {
    const bankroll = isNaN(v) || v < 0 ? 0 : v;
    set((state) => ({ bankroll, ...recalc({ ...state, bankroll }) }));
  },

  setKellyMode: (mode) => {
    set((state) => ({ kellyMode: mode, ...recalc({ ...state, kellyMode: mode }) }));
  },

  loadFromText: (text) => {
    try {
      const matches = parseOddFile(text);
      set((state) => ({
        matches,
        selectedSingle: new Set(),
        selectedParlay: new Set(),
        error: null,
        ...recalc({ ...state, matches }),
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  loadSample: () => {
    get().loadFromText(SAMPLE_ODD_TXT);
  },

  updateOutcome: (matchId, key, field, value) => {
    set((state) => {
      const matches = state.matches.map((m) => {
        if (m.id !== matchId) return m;
        return {
          ...m,
          outcomes: m.outcomes.map((o) =>
            o.key === key ? { ...o, [field]: value } : o,
          ),
        };
      });
      return { matches, ...recalc({ ...state, matches }) };
    });
  },

  updateScore: (matchId, score, field, value) => {
    set((state) => {
      const matches = state.matches.map((m) => {
        if (m.id !== matchId) return m;
        return {
          ...m,
          scores: m.scores.map((s) =>
            s.score === score ? { ...s, [field]: value } : s,
          ),
        };
      });
      return { matches, ...recalc({ ...state, matches }) };
    });
  },

  updateTotalGoal: (matchId, goals, field, value) => {
    set((state) => {
      const matches = state.matches.map((m) => {
        if (m.id !== matchId) return m;
        return {
          ...m,
          totalGoals: m.totalGoals.map((g) =>
            g.goals === goals ? { ...g, [field]: value } : g,
          ),
        };
      });
      return { matches, ...recalc({ ...state, matches }) };
    });
  },

  toggleSingle: (id) => {
    const next = new Set(get().selectedSingle);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ selectedSingle: next });
  },

  toggleParlay: (id) => {
    const next = new Set(get().selectedParlay);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ selectedParlay: next });
  },

  clearSelection: () =>
    set({ selectedSingle: new Set(), selectedParlay: new Set() }),
}));
