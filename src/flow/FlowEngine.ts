import { flowData } from "./flowData";
import type {
  FlowNode,
  HelperNode,
  MultiChoiceNode,
  QuestionNode,
  ResultNode,
  VerdictAssessment,
  VerdictNode,
} from "./types";
import { getOutgoing, predictNext } from "./graph";

export const MAX_COMPLEXITY = 15;

export function getNode(id: string): FlowNode {
  const node = flowData.nodes[id];
  if (!node) {
    throw new Error(`Unknown node: ${id}`);
  }
  return node;
}

export function getScenarioLabel(scenario?: string | null) {
  if (!scenario) return "";
  return flowData.scenarios[scenario]?.label ?? scenario;
}

export function getPreview(nodeId: string): string | null {
  switch (nodeId) {
    case "origin_check":
    case "destination_check":
      return "We’ll ask about: authorization status, goods type, business turnover, and intended use.";
    case "ukims_auth":
      return "We’ll ask about: goods classification, business turnover, and end destination.";
    case "category1_check":
      return "We’ll ask about: business turnover and what you’ll do with the goods.";
    case "turnover_check":
      return "We’ll ask about: what you’ll do with the goods and proof of destination.";
    case "goods_purpose":
      return "Almost done! 1-2 more questions about documentation and evidence.";
    case "approved_purpose_check":
    case "evidence_check":
      return "Final question coming up, then we’ll show your results.";
    default:
      return null;
  }
}

export function getShortLabel(nodeId: string): string {
  const map: Record<string, string> = {
    movement_type: "Movement",
    sector_gate: "Goods type",
    ukims_auth: "UKIMS status",
    category1_check: "Category 1",
    turnover_check: "Turnover",
    goods_purpose: "Purpose",
    approved_purpose_check: "Approved purpose",
    evidence_check: "Evidence",
    ni_destination_check: "Destination",
  };
  return map[nodeId] ?? "Detail";
}

export function summarizeAnswer(nodeId: string, value: unknown): string {
  const node = flowData.nodes[nodeId];
  if (!node) return String(value ?? "");

  if (Array.isArray(value)) {
    const labels = value
      .map((v) => optionLabel(node, v))
      .filter(Boolean)
      .join(", ");
    return labels || value.join(", ");
  }

  const label = optionLabel(node, value);
  return label || String(value ?? "");
}

function optionLabel(node: FlowNode, value: unknown): string {
  if (!value) return "";
  if ("options" in node && node.options) {
    const found = node.options.find((opt) => opt.value === value);
    if (found) return found.label;
  }

  if ("followup" in node && node.followup?.options) {
    const found = node.followup.options.find((opt) => opt.value === value);
    if (found) return found.label;
  }

  return "";
}

export function evaluateVerdict(
  node: VerdictNode,
  history: string[],
  userInput: string
): VerdictAssessment {
  const helperNodeId = history[history.length - 2];
  const helperNode = helperNodeId
    ? (flowData.nodes[helperNodeId] as HelperNode | undefined)
    : undefined;
  const analysis = helperNode?.followup?.analysis;

  if (!analysis) {
    return node.assessment.if_not_category1;
  }

  const lower = userInput.toLowerCase();
  const triggers = analysis?.possibly_category1 ?? [];
  const isCategory1 = triggers.some((keyword) => lower.includes(keyword));

  return isCategory1
    ? node.assessment.if_possibly_category1
    : node.assessment.if_not_category1;
}

export function getResultNode(node: FlowNode): ResultNode | null {
  if (node.type === "result") return node;
  if (node.type === "redirect") {
    return {
      ...node,
      type: "result",
      tier: "result",
      result_type: "edge_case",
      title: node.title ?? "Redirect",
      summary: "",
      explanation: "",
    };
  }
  return null;
}

export function safeNextFromOption(
  node: QuestionNode,
  value: string
): string | null {
  const option = node.options.find((opt) => opt.value === value);
  return option?.next ?? null;
}

// Graph helpers expose edges without coupling callers to flowData.
export const getEdgesFromNode = getOutgoing;
export const predictNextEdge = predictNext;

export function mergeSets(
  base: Record<string, unknown>,
  sets?: Record<string, string>
) {
  if (!sets) return base;
  const next = { ...base };
  Object.entries(sets).forEach(([key, val]) => {
    next[key] = val;
  });
  return next;
}

export function totalAddedComplexity(
  node: MultiChoiceNode,
  selected: string[]
): number {
  return node.options
    .filter((opt) => selected.includes(opt.value))
    .reduce((sum, opt) => sum + (opt.adds_complexity ?? 0), 0);
}

export function recalcComplexity(history: string[]): number {
  return history.reduce((acc, nodeId) => {
    const node = flowData.nodes[nodeId];
    if (node?.complexity !== undefined) {
      return Math.max(acc, node.complexity);
    }
    return acc;
  }, 0);
}
