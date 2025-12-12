export type NodeType =
  | "single_choice"
  | "multi_choice"
  | "helper"
  | "verdict"
  | "result"
  | "redirect"
  | "router";

export type ScenarioId = "gb_to_ni" | "ni_to_gb" | "eu_to_ni" | "row_to_ni";

export type ResultKind = "not_at_risk" | "at_risk" | "edge_case" | "simple" | "moderate";

export interface FlowOption {
  label: string;
  value: string;
  next?: string;
  adds_complexity?: number;
  sets?: Record<string, string>;
  explanation?: string;
  weight?: number; // optional probability weight for future prediction/ranking
}

export interface LearnMore {
  title: string;
  content: string;
}

export interface Expectation {
  typical_steps: string;
  common_triggers: string[];
}

export interface BaseNode {
  id: string;
  type: NodeType;
  complexity?: number;
  tier?: string;
}

export interface QuestionNode extends BaseNode {
  type: "single_choice";
  question: string;
  help?: string;
  expectation?: Expectation;
  learn_more?: LearnMore;
  options: FlowOption[];
}

export interface MultiChoiceNode extends BaseNode {
  type: "multi_choice";
  question: string;
  help?: string;
  options: FlowOption[];
  next: string;
}

export interface HelperFollowup {
  question: string;
  type?: "text_input";
  options?: FlowOption[];
  placeholder?: string;
  hint?: string;
  analysis?: {
    likely_not_category1: string[];
    possibly_category1: string[];
    default_next: string;
  };
}

export interface HelperNode extends BaseNode {
  type: "helper";
  question: string;
  explanation?: string;
  followup: HelperFollowup;
}

export interface VerdictAssessment {
  message: string;
  explanation: string;
  adds_complexity?: number;
  sets?: Record<string, string>;
  next: string;
}

export interface VerdictNode extends BaseNode {
  type: "verdict";
  assessment: {
    if_not_category1: VerdictAssessment;
    if_possibly_category1: VerdictAssessment;
  };
}

export interface RequirementBlock {
  category: string;
  items: string[];
}

export interface ActionItem {
  priority: "immediate" | "before_first_shipment" | "ongoing";
  title: string;
  description: string;
  link?: string | null;
}

export interface RecommendationItem {
  title: string;
  description: string;
  contact?: string;
  link?: string | null;
}

export interface ResultNode extends BaseNode {
  type: "result";
  tier?: "result";
  result_type: ResultKind;
  title: string;
  summary: string;
  explanation: string;
  requirements?: RequirementBlock[];
  actions?: ActionItem[];
  warnings?: string[];
  recommendations?: RecommendationItem[];
  why_complex?: string[];
}

export interface RedirectNode extends BaseNode {
  type: "redirect";
  title?: string;
}

export interface RouterNode extends BaseNode {
  type: "router";
}

export type FlowNode =
  | QuestionNode
  | MultiChoiceNode
  | HelperNode
  | VerdictNode
  | ResultNode
  | RedirectNode
  | RouterNode;

export interface FlowMetadata {
  version: string;
  source: string;
  last_updated: string;
  disclaimer: string;
}

export interface FlowData {
  scenarios: Record<
    ScenarioId | string,
    {
      label: string;
      start: string;
    }
  >;
  nodes: Record<string, FlowNode>;
  tiers: Record<string, number>;
  metadata: FlowMetadata;
}
