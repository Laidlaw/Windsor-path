import { useEffect, useState } from "react";
import type { HelperNode } from "../flow/types";
import { useSession } from "../state/useSession";

type Props = {
  node: HelperNode;
  showEditWarning: boolean;
};

export function HelperCard({ node, showEditWarning }: Props) {
  const answerHelperOption = useSession((s) => s.answerHelperOption);
  const submitText = useSession((s) => s.submitText);
  const existingAnswer = useSession((s) => s.answers[node.id]) as string | undefined;
  const [text, setText] = useState(existingAnswer ?? "");

  useEffect(() => {
    setText(existingAnswer ?? "");
  }, [existingAnswer]);

  const followup = node.followup;

  return (
    <div className="wp-card">
      {showEditWarning && (
        <div className="wp-edit-banner">
          You’re revisiting an earlier detail. Later answers may change.
        </div>
      )}
      <h2 className="wp-question">{node.question}</h2>
      {node.explanation && <p className="wp-help">{node.explanation}</p>}

      {followup.type === "text_input" ? (
        <>
          <label className="wp-label" htmlFor={`${node.id}-input`}>
            {followup.question}
          </label>
          <input
            id={`${node.id}-input`}
            type="text"
            className="wp-input"
            placeholder={followup.placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && text.trim()) {
                submitText(node.id, text.trim());
              }
            }}
          />
          {followup.hint && <div className="wp-hint">{followup.hint}</div>}
          <div className="wp-actions">
            <button
              type="button"
              className="wp-go"
              onClick={() => text.trim() && submitText(node.id, text.trim())}
            >
              Continue
            </button>
          </div>
        </>
      ) : (
        <div className="wp-options">
          {followup.options?.map((option) => (
            <button
              key={option.value}
              type="button"
              className="wp-option"
              onClick={() => answerHelperOption(node.id, option.value)}
            >
              <span>{option.label}</span>
              {option.explanation && (
                <span className="wp-option__hint">{option.explanation}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
