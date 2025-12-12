import { getPreview } from "../flow/FlowEngine";
import type { QuestionNode } from "../flow/types";
import { useSession } from "../state/useSession";

type Props = {
  node: QuestionNode;
  showEditWarning: boolean;
};

export function QuestionCard({ node, showEditWarning }: Props) {
  const answer = useSession((s) => s.answerSingle);
  const preview = getPreview(node.id);

  return (
    <div className="wp-card">
      {showEditWarning && (
        <div className="wp-edit-banner">
          You’re revisiting an earlier detail. Later answers may change.
        </div>
      )}
      <h2 className="wp-question">{node.question}</h2>
      {node.help && <p className="wp-help">{node.help}</p>}

      <div className="wp-options">
        {node.options.map((option) => (
          <button
            type="button"
            key={option.value}
            className="wp-option"
            onClick={() => answer(node.id, option.value)}
          >
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {node.expectation && (
        <div className="wp-preview">
          <div className="wp-preview__title">What this usually involves</div>
          <ul className="wp-preview__list">
            <li>{node.expectation.typical_steps}</li>
            <li>Common complexity triggers:</li>
            {node.expectation.common_triggers.map((trigger) => (
              <li key={trigger} className="wp-preview__chip">
                {trigger}
              </li>
            ))}
          </ul>
        </div>
      )}

      {preview && (
        <div className="wp-preview subtle">
          <div className="wp-preview__title">Coming up next</div>
          <div className="wp-preview__text">{preview}</div>
        </div>
      )}

      {node.learn_more && (
        <details className="wp-learn-more">
          <summary>{node.learn_more.title}</summary>
          <div>{node.learn_more.content}</div>
        </details>
      )}
    </div>
  );
}
