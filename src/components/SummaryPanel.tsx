import { useMemo } from "react";
import {
  getScenarioLabel,
  getShortLabel,
  summarizeAnswer,
} from "../flow/FlowEngine";
import { useSession } from "../state/useSession";

export function SummaryPanel() {
  const history = useSession((s) => s.history);
  const answers = useSession((s) => s.answers);
  const scenario = useSession((s) => s.scenario);
  const goBackTo = useSession((s) => s.goBackTo);
  const reset = useSession((s) => s.reset);

  const items = useMemo(() => {
    return history
      .filter((id) => answers[id] !== undefined)
      .map((id) => ({
        id,
        label: getShortLabel(id),
        value: summarizeAnswer(id, answers[id]),
      }));
  }, [answers, history]);

  const scenarioLabel =
    scenario || typeof answers.scenario === "string"
      ? getScenarioLabel((scenario ?? answers.scenario) as string)
      : "";

  return (
    <aside className="wp-summary">
      <div className="wp-summary__header">
        <div>
          <div className="wp-summary__title">Your situation so far</div>
          <p className="wp-summary__hint">
            We keep track of what you’ve told us. Revise any detail at any time.
          </p>
        </div>
        <button className="wp-link" type="button" onClick={() => reset()}>
          Start over
        </button>
      </div>

      {scenarioLabel && (
        <div className="wp-summary__item">
          <div className="wp-summary__label">Movement</div>
          <div className="wp-summary__value">{scenarioLabel}</div>
        </div>
      )}

      {items.length === 0 && (
        <div className="wp-summary__empty">
          We’ll summarize your answers here as you go.
        </div>
      )}

      {items.map((item) => (
        <div key={item.id} className="wp-summary__item">
          <div>
            <div className="wp-summary__label">{item.label}</div>
            <div className="wp-summary__value">{item.value}</div>
          </div>
          <button
            className="wp-tag"
            type="button"
            onClick={() => goBackTo(item.id)}
            aria-label={`Revise ${item.label}`}
          >
            Revise
          </button>
        </div>
      ))}
    </aside>
  );
}
