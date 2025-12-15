import type { ResultNode } from "../flow/types";
import { useSession } from "../state/useSession";
import { calculateRiskProfile } from "../state/riskProfile";

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
  const answers = useSession((s) => s.answers);
  const viewMode = useSession((s) => s.viewMode);
  const riskProfile = calculateRiskProfile(answers);

  const cascade = {
    baseline: "Assuming everything goes to plan: £0–£300 per consignment (admin + broker)",
    reroute: "If 10% of goods are rerouted to EU: £8k–15k duties + £500–2.5k penalties",
    audit: "If during audit year: extrapolated x5–8 + £15k–40k representation",
    docs: "If evidence incomplete: treat year as at-risk: £40k–80k; worst case £150k–280k",
  };

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

      <section className="wp-section wp-section--cascade">
        <div className="wp-section__title">
          {viewMode === "reality" ? "What could go wrong" : "Reality check (tap to expand)"}
        </div>
        <div className={`wp-cascade ${viewMode === "reality" ? "open" : ""}`}>
          <div className="wp-cascade__row">
            <div className="wp-cascade__label">Baseline</div>
            <div className="wp-cascade__value">{cascade.baseline}</div>
          </div>
          <div className="wp-cascade__row">
            <div className="wp-cascade__label">Reroute scenario</div>
            <div className="wp-cascade__value">{cascade.reroute}</div>
          </div>
          <div className="wp-cascade__row">
            <div className="wp-cascade__label">Audit year</div>
            <div className="wp-cascade__value">{cascade.audit}</div>
          </div>
          <div className="wp-cascade__row">
            <div className="wp-cascade__label">Evidence gap</div>
            <div className="wp-cascade__value">{cascade.docs}</div>
          </div>
          <div className="wp-cascade__meta">
            <div className="wp-risk__label-row">
              <span>Exposure drivers</span>
              <span className="wp-risk__value">{Math.round(riskProfile.overall)}%</span>
            </div>
            <div className="wp-cascade__chips">
              <span>Audit {Math.round(riskProfile.audit)}%</span>
              <span>Docs {Math.round(riskProfile.documentary)}%</span>
              <span>Temporal {Math.round(riskProfile.temporal)}%</span>
              <span>Judgment {Math.round(riskProfile.judgment)}%</span>
            </div>
          </div>
        </div>
      </section>

      <div className="wp-actions solo">
        <button type="button" className="wp-secondary" onClick={goBack}>
          Revise an earlier answer
        </button>
      </div>
    </div>
  );
}
