import type { ResultNode } from "../flow/types";
import { useSession } from "../state/useSession";

type Props = {
  node: ResultNode;
  entryTone?: string;
};

const typeCopy: Record<string, string> = {
  not_at_risk: "Classified as NOT AT RISK",
  at_risk: "Classified as AT RISK",
  edge_case: "Edge case — needs professional review",
  simple: "Straightforward path",
  moderate: "Moderate path",
};

const priorityCopy: Record<string, string> = {
  immediate: "Do now",
  before_first_shipment: "Before first shipment",
  ongoing: "Ongoing",
};

export function ResultView({ node, entryTone }: Props) {
  const goBack = useSession((s) => s.goBackFromResult);

  return (
    <div className="wp-card">
      {entryTone && <div className="wp-note success">{entryTone}</div>}

      <div className={`wp-result wp-result--${node.result_type}`}>
        <div className="wp-pill">{typeCopy[node.result_type] ?? "Result"}</div>
        <h2 className="wp-question">{node.title}</h2>
        <p className="wp-lede">{node.summary}</p>
        <p className="wp-help">{node.explanation}</p>
      </div>

      {node.result_type === "not_at_risk" && (
        <div className="wp-note subtle">
          “Not at risk” is a classification. It still requires simplified
          declarations and keeping evidence that goods stay in the UK.
        </div>
      )}

      {node.requirements && node.requirements.length > 0 && (
        <section className="wp-section">
          <div className="wp-section__title">Requirements</div>
          <div className="wp-grid">
            {node.requirements.map((req) => (
              <div key={req.category} className="wp-tile">
                <div className="wp-tile__title">{req.category}</div>
                <ul className="wp-list">
                  {req.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {node.actions && node.actions.length > 0 && (
        <section className="wp-section">
          <div className="wp-section__title">Next steps</div>
          <div className="wp-stack">
            {node.actions.map((action) => (
              <div key={action.title} className="wp-action">
                <div className={`wp-pill small ${action.priority}`}>
                  {priorityCopy[action.priority] ?? action.priority}
                </div>
                <div className="wp-action__title">{action.title}</div>
                <div className="wp-action__body">{action.description}</div>
                {action.link && (
                  <a
                    className="wp-link"
                    href={action.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Learn more →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {node.warnings && node.warnings.length > 0 && (
        <section className="wp-section">
          <div className="wp-section__title">Things to watch</div>
          <ul className="wp-list">
            {node.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      )}

      {node.recommendations && node.recommendations.length > 0 && (
        <section className="wp-section">
          <div className="wp-section__title">Recommended support</div>
          <div className="wp-stack">
            {node.recommendations.map((rec) => (
              <div key={rec.title} className="wp-tile">
                <div className="wp-tile__title">{rec.title}</div>
                <div className="wp-tile__body">{rec.description}</div>
                {rec.contact && (
                  <div className="wp-tile__contact">Phone: {rec.contact}</div>
                )}
                {rec.link && (
                  <a
                    className="wp-link"
                    href={rec.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visit site →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {node.why_complex && node.why_complex.length > 0 && (
        <section className="wp-section">
          <div className="wp-section__title">Why this is complex</div>
          <ul className="wp-list">
            {node.why_complex.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="wp-actions solo">
        <button type="button" className="wp-secondary" onClick={goBack}>
          Revise an earlier answer
        </button>
      </div>
    </div>
  );
}
