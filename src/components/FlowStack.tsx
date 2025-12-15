import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "../state/useSession";
import { getNode } from "../flow/FlowEngine";
import { NodeRenderer } from "./NodeRenderer";
import { calculateRiskProfile } from "../state/riskProfile";

export function FlowStack() {
  const history = useSession((s) => s.history);
  const stackVersion = useSession((s) => s.stackVersion);
  const answers = useSession((s) => s.answers);
  const prevCount = useRef(0);
  const riskProfile = useMemo(() => calculateRiskProfile(answers), [answers]);
  const [showMore, setShowMore] = useState(false);

  const nodes = useMemo(() => {
    return history.map((id) => ({
      id,
      node: getNode(id),
    }));
  }, [history]);

  useEffect(() => {
    if (history.length > prevCount.current) {
      const lastId = history[history.length - 1];
      const el = document.getElementById(`node-${lastId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    prevCount.current = history.length;
  }, [history]);

  return (
    <div className="wp-stack-questions" key={stackVersion}>
      {nodes.map(({ id, node }, idx) => (
        <Fragment key={id}>
          <div id={`node-${id}`} className="wp-stack-item">
            <NodeRenderer node={node} />
          </div>
          {idx < nodes.length - 1 && (
            <div className="wp-gutter">
              <button
                type="button"
                className="wp-gutter__label"
                onClick={() => setShowMore((open) => !open)}
              >
                Hidden layers
              </button>
              <div className="wp-gutter__controls">
                <button
                  type="button"
                  className="wp-link ghost small"
                  onClick={() => setShowMore((open) => !open)}
                >
                  Tell me more
                </button>
                <button
                  type="button"
                  className="wp-link ghost small"
                  onClick={() => {
                    const el = document.getElementById("wp-provisional");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  Just guess
                </button>
              </div>
            </div>
          )}
        </Fragment>
      ))}
      {showMore && (
        <div className="wp-modal-backdrop" onClick={() => setShowMore(false)}>
          <div
            className="wp-modal"
            role="dialog"
            aria-label="Hidden layers"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wp-modal__header">
              <div>
                <div className="wp-summary__label">Hidden layers</div>
                <div className="wp-summary__value">
                  How audit, documents, time, and judgment pressures stack beneath your choices.
                </div>
              </div>
              <button className="wp-link ghost small" type="button" onClick={() => setShowMore(false)}>
                Close
              </button>
            </div>
            <div className="wp-hidden__grid">
              <div className="wp-hidden__card">
                <div className="wp-risk__label-row">
                  <span>Temporal uncertainty</span>
                  <span className="wp-risk__value">{Math.round(riskProfile.temporal)}%</span>
                </div>
                <div className="wp-hidden__body">
                  Declarations hinge on future customer behavior. If goods move to EU/Ireland later, earlier
                  “not at risk” claims become wrong.
                </div>
              </div>
              <div className="wp-hidden__card">
                <div className="wp-risk__label-row">
                  <span>Documentary burden</span>
                  <span className="wp-risk__value">{Math.round(riskProfile.documentary)}%</span>
                </div>
                <div className="wp-hidden__body">
                  Evidence per shipment: customer declarations, delivery receipts, origin docs, monitoring that
                  goods stayed in NI/GB. Gaps can convert shipments to “at risk”.
                </div>
              </div>
              <div className="wp-hidden__card">
                <div className="wp-risk__label-row">
                  <span>Cost cascade</span>
                </div>
                <div className="wp-hidden__body">
                  Reroute 10% to EU: £8k–15k duties + £500–2.5k penalties.<br />
                  Audit year: extrapolated x5–8 + £15k–40k representation.<br />
                  Evidence gap: treat year as at-risk: £40k–80k (worst case £150k–280k).
                </div>
              </div>
              <div className="wp-hidden__card">
                <div className="wp-risk__label-row">
                  <span>Exclusions</span>
                </div>
                <div className="wp-hidden__body">
                  Green Lane often excluded: mixed loads, unsure destination, &gt;3% tariff differential, many SPS
                  or third-country goods. Consider Red Lane early.
                </div>
              </div>
              <div className="wp-hidden__card">
                <div className="wp-risk__label-row">
                  <span>Practitioner reality</span>
                </div>
                <div className="wp-hidden__body">
                  FSB survey: 34% stopped GB→NI trade; 58% face moderate-significant challenges. Customer
                  declarations often refused; long-term suppliers step back due to burden.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
