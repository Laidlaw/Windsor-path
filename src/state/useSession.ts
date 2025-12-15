import { create } from "zustand";
import { flowData } from "../flow/flowData";
import type {
  FlowNode,
  HelperNode,
  MultiChoiceNode,
  QuestionNode,
  VerdictAssessment,
} from "../flow/types";
import {
  MAX_COMPLEXITY,
  evaluateVerdict,
  getNode,
  recalcComplexity,
  totalAddedComplexity,
} from "../flow/FlowEngine";

const DEFAULT_START = "movement_type";

type SessionState = {
  currentNodeId: string;
  history: string[];
  answers: Record<string, unknown>;
  scenario: string | null;
  complexity: number;
  userInput: string;
  justEdited: boolean;
  entryTone: string;
  stackVersion: number;
  viewMode: "procedural" | "reality";
  start: (
    nodeId?: string,
    opts?: { scenario?: string; movementPreset?: string; entryTone?: string }
  ) => void;
  answerSingle: (nodeId: string, value: string) => void;
  answerMulti: (nodeId: string, values: string[]) => void;
  answerHelperOption: (nodeId: string, value: string) => void;
  submitText: (nodeId: string, text: string) => void;
  advanceFromVerdict: (assessment: VerdictAssessment) => void;
  goBackTo: (nodeId: string) => void;
  goBackFromResult: () => void;
  reset: () => void;
  getNode: (id: string) => FlowNode;
  evaluateVerdict: (nodeId: string) => VerdictAssessment | null;
  setViewMode: (mode: "procedural" | "reality") => void;
};

type MoveOpts = {
  resetHistory?: boolean;
  justEdited?: boolean;
};

const stripScenario = (sets?: Record<string, string>) => {
  if (!sets) return undefined;
  const entries = Object.entries(sets).filter(([key]) => key !== "scenario");
  return entries.length ? Object.fromEntries(entries) : undefined;
};

const navigateToNode = (
  targetId: string,
  set: (fn: (state: SessionState) => SessionState) => void,
  get: () => SessionState,
  opts?: MoveOpts
) => {
  const targetNode = flowData.nodes[targetId];
  if (!targetNode) return;

  if (targetNode.type === "router") {
    const origin = get().answers["origin_check"];
    const destination = get().answers["destination_check"];
    if (origin === "gb" && destination === "ni") {
      navigateToNode("ukims_auth", set, get, opts);
      return;
    }
    if (origin === "eu" && destination === "ni") {
      navigateToNode("eu_free_movement", set, get, opts);
      return;
    }
    if (origin === "row" && destination === "ni") {
      navigateToNode("redirect_row", set, get, opts);
      return;
    }
  }

  set((state) => {
    const history = opts?.resetHistory ? [] : [...state.history];
    if (history[history.length - 1] !== targetId) {
      history.push(targetId);
    }

    const nextComplexity =
      targetNode.complexity !== undefined
        ? Math.max(state.complexity, targetNode.complexity)
        : state.complexity;

    return {
      ...state,
      currentNodeId: targetId,
      history,
      complexity: Math.min(nextComplexity, MAX_COMPLEXITY),
      justEdited: opts?.justEdited ?? state.justEdited,
    };
  });
};

export const useSession = create<SessionState>((set, get) => ({
  currentNodeId: DEFAULT_START,
  history: [],
  answers: {},
  scenario: null,
  complexity: 0,
  userInput: "",
  justEdited: false,
  entryTone: "",
  viewMode: "procedural",
  stackVersion: 0,
  start: (nodeId = DEFAULT_START, opts) => {
    set((state) => ({
      ...state,
      currentNodeId: nodeId,
      history: [],
      answers: opts?.movementPreset
        ? { movement_type: opts.movementPreset }
        : {},
      scenario: opts?.scenario ?? null,
      complexity: 0,
      userInput: "",
      justEdited: false,
      entryTone: opts?.entryTone ?? "",
      viewMode: "procedural",
      stackVersion: state.stackVersion + 1,
    }));

    navigateToNode(nodeId, set, get, { resetHistory: true });
  },
  answerSingle: (nodeId, value) => {
    const node = getNode(nodeId) as QuestionNode;
    const option = node.options.find((opt) => opt.value === value);
    if (!option || !option.next) return;

    set((state) => {
      const cleanedSets = stripScenario(option.sets);
      const merged = cleanedSets
        ? { ...state.answers, [nodeId]: value, ...cleanedSets }
        : { ...state.answers, [nodeId]: value };

      return {
        ...state,
        answers: merged,
        scenario: option.sets?.scenario ?? state.scenario,
        complexity: state.complexity + (option.adds_complexity ?? 0),
        justEdited: false,
      };
    });

    navigateToNode(option.next, set, get);
  },
  answerMulti: (nodeId, values) => {
    const node = getNode(nodeId) as MultiChoiceNode;
    const adds = totalAddedComplexity(node, values);

    set((state) => ({
      ...state,
      answers: { ...state.answers, [nodeId]: values },
      complexity: state.complexity + adds,
      justEdited: false,
    }));

    navigateToNode(node.next, set, get);
  },
  answerHelperOption: (nodeId, value) => {
    const node = getNode(nodeId) as HelperNode;
    const option = node.followup.options?.find((opt) => opt.value === value);
    if (!option || !option.next) return;

    set((state) => {
      const cleanedSets = stripScenario(option.sets);
      const merged = cleanedSets
        ? { ...state.answers, [nodeId]: value, ...cleanedSets }
        : { ...state.answers, [nodeId]: value };
      return {
        ...state,
        answers: merged,
        complexity: state.complexity + (option.adds_complexity ?? 0),
        justEdited: false,
      };
    });

    navigateToNode(option.next, set, get);
  },
  submitText: (nodeId, text) => {
    const node = getNode(nodeId) as HelperNode;
    const next = node.followup.analysis?.default_next;
    if (!next) return;

    set((state) => ({
      ...state,
      answers: { ...state.answers, [nodeId]: text },
      userInput: text,
      justEdited: false,
    }));

    navigateToNode(next, set, get);
  },
  advanceFromVerdict: (assessment) => {
    set((state) => {
      const cleanedSets = stripScenario(assessment.sets);
      const merged = cleanedSets ? { ...state.answers, ...cleanedSets } : state.answers;
      return {
        ...state,
        answers: merged,
        complexity: state.complexity + (assessment.adds_complexity ?? 0),
        justEdited: false,
      };
    });

    navigateToNode(assessment.next, set, get);
  },
  goBackTo: (nodeId) => {
    const currentHistory = get().history;
    const targetIndex = currentHistory.indexOf(nodeId);
    if (targetIndex === -1) return;

    const trimmedHistory = currentHistory.slice(0, targetIndex + 1);
    const historyWithoutTarget = trimmedHistory.slice(0, -1);

    set((state) => {
      const answers = { ...state.answers };
      currentHistory.slice(targetIndex).forEach((id) => {
        delete answers[id];
      });

      const movementChoice = answers["movement_type"];
      const movementRemoved =
        "movement_type" in state.answers && movementChoice === undefined;

      const nextScenario =
        typeof movementChoice === "string"
          ? movementChoice
          : movementRemoved || nodeId === "movement_type"
          ? null
          : state.scenario;

      return {
        ...state,
        answers,
        scenario: nextScenario ?? null,
        history: historyWithoutTarget,
        complexity: recalcComplexity(historyWithoutTarget),
        justEdited: true,
      };
    });

    navigateToNode(nodeId, set, get, { justEdited: true });
  },
  goBackFromResult: () => {
    const historyWithoutResult = get().history.slice(0, -1);
    const previousNodeId = historyWithoutResult[historyWithoutResult.length - 1];

    if (!previousNodeId) {
      get().reset();
      return;
    }

    set((state) => {
      const answers = { ...state.answers };
      delete answers[state.currentNodeId];

      return {
        ...state,
        answers,
        history: historyWithoutResult,
        complexity: recalcComplexity(historyWithoutResult),
        justEdited: true,
      };
    });

    navigateToNode(previousNodeId, set, get, { justEdited: true });
  },
  reset: () => {
    set(() => ({
      currentNodeId: DEFAULT_START,
      history: [],
      answers: {},
      scenario: null,
      complexity: 0,
      userInput: "",
      justEdited: false,
      entryTone: "",
      viewMode: "procedural",
    }));
    navigateToNode(DEFAULT_START, set, get, { resetHistory: true });
  },
  getNode,
  evaluateVerdict: (nodeId) => {
    const node = flowData.nodes[nodeId];
    if (!node || node.type !== "verdict") return null;
    const userInput = get().userInput;
    return evaluateVerdict(node, get().history, userInput);
  },
  setViewMode: (mode) =>
    set((state) => ({
      ...state,
      viewMode: mode,
    })),
}));
