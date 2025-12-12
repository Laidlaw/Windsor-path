import { useMemo } from "react";
import {
  getScenarioLabel,
  getShortLabel,
  summarizeAnswer,
} from "../flow/FlowEngine";
import { MAX_COMPLEXITY } from "../flow/FlowEngine";
import { useSession } from "../state/useSession";

export function SummaryPanel() {
  const history = useSession((s) => s.history);
  const answers = useSession((s) => s.answers);
  const scenario = useSession((s) => s.scenario);
  const complexity = useSession((s) => s.complexity);

  const items = useMemo(() => {
    const seen = new Set<string>();
    return history
      .filter((id) => answers[id] !== undefined)
      .map((id) => ({
        id,
        label: getShortLabel(id),
        value: summarizeAnswer(id, answers[id]),
      }))
      .filter((item) => {
        const key = `${item.label}-${item.value}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [answers, history]);

  const scenarioLabel = scenario ? getScenarioLabel(scenario) : "";
  const scenarioChosen = Boolean(scenario);
  const percentage = Math.min((complexity / MAX_COMPLEXITY) * 100, 100);

  let status = "Not enough information yet";
  let tone = "pending";

  if (scenarioChosen) {
    if (complexity <= 5) {
      status = "Simple scenario";
      tone = "simple";
    } else if (complexity <= 10) {
      status = "Moderate complexity";
      tone = "moderate";
    } else {
      status = "Complex scenario";
      tone = "complex";
    }
  }

  const sentence = useMemo(() => {
    const parts: string[] = [];
    if (scenarioLabel) parts.push(`Movement: ${scenarioLabel}`);

    items.forEach((item) => {
      if (item.id === "movement_type" && scenarioLabel) return;
      parts.push(`${item.label}: ${item.value}`);
    });

    if (parts.length === 0) return "";
    return parts.join(". ") + ".";
  }, [items, scenarioLabel]);

  return (
    <aside className="wp-summary">
      <div className="wp-summary__bar">
        <div
          className={`wp-summary__bar-fill ${tone}`}
          style={{ width: `${percentage}%` }}
          aria-hidden
        />
      </div>
      <div className="wp-summary__header">
        <div>
          <div className="wp-summary__title">Your report</div>
          <p className="wp-summary__hint">
            We’ll stitch your answers into a quick readout. Revise any detail at any time.
          </p>
        </div>
        <div className={`wp-summary__status ${tone}`}>{status}</div>
      </div>

      {sentence ? (
        <div className="wp-summary__sentence">{sentence}</div>
      ) : (
        <div className="wp-summary__empty">
          We’ll summarize your answers here as you go.
        </div>
      )}

    </aside>
  );
}
