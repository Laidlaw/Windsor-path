import type { VerdictNode } from "../flow/types";
import { useSession } from "../state/useSession";

type Props = {
  node: VerdictNode;
};

export function VerdictCard({ node }: Props) {
  const assessment = useSession((s) => s.evaluateVerdict(node.id));
  const advance = useSession((s) => s.advanceFromVerdict);

  if (!assessment) return null;

  return (
    <div className="wp-card">
      <h2 className="wp-question">{assessment.message}</h2>
      <p className="wp-help">{assessment.explanation}</p>
      <div className="wp-actions">
        <button
          type="button"
          className="wp-go"
          onClick={() => advance(assessment)}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
