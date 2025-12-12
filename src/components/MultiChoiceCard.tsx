import { useEffect, useState } from "react";
import type { MultiChoiceNode } from "../flow/types";
import { useSession } from "../state/useSession";

type Props = {
  node: MultiChoiceNode;
  showEditWarning: boolean;
};

export function MultiChoiceCard({ node, showEditWarning }: Props) {
  const existing = useSession((s) => s.answers[node.id]) as string[] | undefined;
  const submit = useSession((s) => s.answerMulti);
  const [selected, setSelected] = useState<string[]>(existing ?? []);

  useEffect(() => {
    setSelected(existing ?? []);
  }, [existing]);

  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <div className="wp-card">
      {showEditWarning && (
        <div className="wp-edit-banner">
          You’re revisiting an earlier detail. Later answers may change.
        </div>
      )}
      <h2 className="wp-question">{node.question}</h2>
      {node.help && <p className="wp-help">{node.help}</p>}

      <div className="wp-options column">
        {node.options.map((option) => (
          <label key={option.value} className="wp-option">
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => toggle(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>

      <div className="wp-actions">
        <button
          type="button"
          className="wp-primary"
          onClick={() => submit(node.id, selected)}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
