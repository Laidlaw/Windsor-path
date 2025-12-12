import { useEffect } from "react";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { ComplexityMeter } from "./components/ComplexityMeter";
import { EntryTabs } from "./components/EntryTabs";
import { NodeRenderer } from "./components/NodeRenderer";
import { SummaryPanel } from "./components/SummaryPanel";
import { useSession } from "./state/useSession";
import "./styles.css";

export default function WindsorPathApp() {
  const start = useSession((s) => s.start);
  const currentNodeId = useSession((s) => s.currentNodeId);
  const getNode = useSession((s) => s.getNode);
  const complexity = useSession((s) => s.complexity);
  const scenario = useSession((s) => s.scenario);
  const answers = useSession((s) => s.answers);

  useEffect(() => {
    start();
  }, [start]);

  const node = getNode(currentNodeId);
  const scenarioChosen = Boolean(scenario || answers.scenario);

  return (
    <div className="wp-shell">
      <header className="wp-hero">
        <div>
          <div className="wp-kicker">Guidance without the PDF maze</div>
          <h1>Windsor Framework Pathfinder</h1>
          <p className="wp-subtitle">
            Figure out what applies to your goods in a short, answer-first conversation.
          </p>
        </div>
      </header>

      <ComplexityMeter complexity={complexity} scenarioChosen={scenarioChosen} />
      <EntryTabs />

      <div className="wp-layout">
        <div className="wp-main">
          <Breadcrumbs />
          <NodeRenderer node={node} />
        </div>
        <SummaryPanel />
      </div>

      <footer className="wp-disclaimer">
        <strong>Important:</strong> This tool provides general guidance based on HMRC
        Windsor Framework flowcharts. It is not legal or professional advice. Verify
        requirements with HMRC Trader Support Service (0800 161 5837) or a customs
        professional before making business decisions.
      </footer>
    </div>
  );
}
