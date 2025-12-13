import { useEffect, useMemo, useRef } from "react";
import { useSession } from "../state/useSession";
import { getNode } from "../flow/FlowEngine";
import { NodeRenderer } from "./NodeRenderer";

export function FlowStack() {
  const history = useSession((s) => s.history);
  const stackVersion = useSession((s) => s.stackVersion);
  const prevCount = useRef(0);

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
      {nodes.map(({ id, node }) => (
        <div key={id} id={`node-${id}`} className="wp-stack-item">
          <NodeRenderer node={node} />
        </div>
      ))}
    </div>
  );
}
