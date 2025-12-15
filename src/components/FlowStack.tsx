import { Fragment, useEffect, useMemo, useRef } from "react";
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
              <div className="wp-gutter__label">Hidden layers shifting</div>
              <div className="wp-gutter__mini">
                <span>Audit {Math.round(riskProfile.audit)}%</span>
                <span>Docs {Math.round(riskProfile.documentary)}%</span>
                <span>Temporal {Math.round(riskProfile.temporal)}%</span>
                <span>Judgment {Math.round(riskProfile.judgment)}%</span>
              </div>
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
