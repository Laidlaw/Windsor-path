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
  const [showHidden, setShowHidden] = useState(false);

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
                onClick={() => setShowHidden(true)}
              >
                Hidden layers
              </button>
              <div className="wp-gutter__controls">
                <button type="button" className="wp-link ghost small" onClick={() => setShowHidden(true)}>
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
      {showHidden && (
        <div className="wp-modal-backdrop" onClick={() => setShowHidden(false)}>
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
              <button className="wp-link ghost small" type="button" onClick={() => setShowHidden(false)}>
                Close
              </button>
            </div>
            <div className="wp-hidden__grid">
              <div className="wp-hidden__card">
                <div className="wp-risk__label-row">
                  <span>Audit</span>
                  <span className="wp-risk__value">{Math.round(riskProfile.audit)}%</span>
                </div>
                <div className="wp-risk__meter">
                  <div className="wp-risk__fill high" style={{ width: `${Math.round(riskProfile.audit)}%` }} />
                </div>
              </div>
              <div className="wp-hidden__card">
                <div className="wp-risk__label-row">
                  <span>Documentary burden</span>
                  <span className="wp-risk__value">{Math.round(riskProfile.documentary)}%</span>
                </div>
                <div className="wp-risk__meter">
                  <div
                    className="wp-risk__fill moderate"
                    style={{ width: `${Math.round(riskProfile.documentary)}%` }}
                  />
                </div>
              </div>
              <div className="wp-hidden__card">
                <div className="wp-risk__label-row">
                  <span>Temporal uncertainty</span>
                  <span className="wp-risk__value">{Math.round(riskProfile.temporal)}%</span>
                </div>
                <div className="wp-risk__meter">
                  <div
                    className="wp-risk__fill moderate"
                    style={{ width: `${Math.round(riskProfile.temporal)}%` }}
                  />
                </div>
              </div>
              <div className="wp-hidden__card">
                <div className="wp-risk__label-row">
                  <span>Judgment calls</span>
                  <span className="wp-risk__value">{Math.round(riskProfile.judgment)}%</span>
                </div>
                <div className="wp-risk__meter">
                  <div
                    className="wp-risk__fill high"
                    style={{ width: `${Math.round(riskProfile.judgment)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
