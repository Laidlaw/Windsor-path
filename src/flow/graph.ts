import { flowData } from "./flowData";
import type { FlowNode, FlowOption, RouterNode } from "./types";

export type Transition = {
  from: string;
  to: string;
  label?: string;
  via?: string;
  weight?: number;
  kind: "option" | "router" | "default";
};

const optionEdges = (nodeId: string, options: FlowOption[]): Transition[] =>
  options
    .filter((opt) => Boolean(opt.next))
    .map((opt) => ({
      from: nodeId,
      to: opt.next as string,
      label: opt.label,
      via: opt.value,
      weight: opt.weight,
      kind: "option" as const,
    }));

const routerEdges = (node: RouterNode): Transition[] => {
  // Routers resolve dynamically; treat them as a generic edge to keep the graph whole.
  return [
    {
      from: node.id,
      to: "dynamic",
      kind: "router",
    },
  ];
};

function buildTransitions(): Transition[] {
  const transitions: Transition[] = [];

  Object.values(flowData.nodes).forEach((node: FlowNode) => {
    if ("options" in node && node.options) {
      transitions.push(...optionEdges(node.id, node.options));
    } else if (node.type === "multi_choice") {
      transitions.push({
        from: node.id,
        to: node.next,
        kind: "default",
      });
    } else if (node.type === "router") {
      transitions.push(...routerEdges(node));
    }
  });

  return transitions;
}

const transitions = buildTransitions();

export function getOutgoing(nodeId: string): Transition[] {
  return transitions.filter((edge) => edge.from === nodeId);
}

export function predictNext(nodeId: string): Transition | null {
  const outgoing = getOutgoing(nodeId);
  if (outgoing.length === 0) return null;
  const weighted = outgoing.filter((edge) => edge.weight !== undefined);
  if (weighted.length === 0) return outgoing[0];
  return weighted.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))[0];
}
