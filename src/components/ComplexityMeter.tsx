import { MAX_COMPLEXITY } from "../flow/FlowEngine";

type Props = {
  complexity: number;
  scenarioChosen: boolean;
};

export function ComplexityMeter({ complexity, scenarioChosen }: Props) {
  const percentage = Math.min((complexity / MAX_COMPLEXITY) * 100, 100);

  let status = "Not enough information yet";
  let tone = "pending";
  let explanation =
    "Answer a few questions and we’ll gauge whether this is straightforward or more complex.";

  if (scenarioChosen) {
    if (complexity <= 5) {
      status = "Simple scenario";
      tone = "simple";
      explanation = "Looks straightforward with clear requirements.";
    } else if (complexity <= 10) {
      status = "Moderate complexity";
      tone = "moderate";
      explanation = "Some complexity is likely—consider double-checking with a broker.";
    } else {
      status = "Complex scenario";
      tone = "complex";
      explanation = "Edge cases or specialized rules detected. A professional review is wise.";
    }
  }

  return (
    <div className="wp-meter">
      <div className="wp-meter__label">
        <div>Scenario Complexity</div>
        <div className={`wp-meter__status ${tone}`}>{status}</div>
      </div>
      <div className="wp-meter__bar">
        <div className="wp-meter__fill" style={{ width: `${percentage}%` }} />
      </div>
      <div className="wp-meter__explanation">{explanation}</div>
    </div>
  );
}
