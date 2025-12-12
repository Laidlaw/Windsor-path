import { getResultNode } from "../flow/FlowEngine";
import type { FlowNode } from "../flow/types";
import { useSession } from "../state/useSession";
import { HelperCard } from "./HelperCard";
import { MultiChoiceCard } from "./MultiChoiceCard";
import { QuestionCard } from "./QuestionCard";
import { ResultView } from "./ResultView";
import { VerdictCard } from "./VerdictCard";

type Props = {
  node: FlowNode;
};

export function NodeRenderer({ node }: Props) {
  const justEdited = useSession((s) => s.justEdited);
  const entryTone = useSession((s) => s.entryTone);

  switch (node.type) {
    case "single_choice":
      return <QuestionCard node={node} showEditWarning={justEdited} />;
    case "multi_choice":
      return <MultiChoiceCard node={node} showEditWarning={justEdited} />;
    case "helper":
      return <HelperCard node={node} showEditWarning={justEdited} />;
    case "verdict":
      return <VerdictCard node={node} />;
    case "result":
    case "redirect": {
      const resultNode = getResultNode(node);
      if (!resultNode) return null;
      return <ResultView node={resultNode} entryTone={entryTone} />;
    }
    default:
      return null;
  }
}
