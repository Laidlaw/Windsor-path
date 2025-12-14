import { useEffect, useState } from "react";
import { FlowStack } from "./components/FlowStack";
import { SummaryPanel } from "./components/SummaryPanel";
import { useSession } from "./state/useSession";
import "./styles.css";

export default function WindsorPathApp() {
  const start = useSession((s) => s.start);
  const reset = useSession((s) => s.reset);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    start();
  }, [start]);

  return (
    <div className="wp-shell">
      <header className="wp-topbar">
        <button className="wp-brand" type="button" onClick={() => reset()}>
          Windsor Path
        </button>
        <div className="wp-topbar__actions">
          <button className="wp-restart hide-mobile" type="button" onClick={() => reset()}>
            Restart
          </button>
          <button
            className="wp-menu-toggle"
            type="button"
            onClick={() => setReportOpen((open) => !open)}
            aria-label="Open menu"
          >
            <span className="wp-menu-icon" aria-hidden />
          </button>
        </div>
      </header>

      <div className="wp-layout">
        <div className="wp-main">
          <FlowStack />
        </div>
        <SummaryPanel
          reportOpen={reportOpen}
          onCloseReport={() => setReportOpen(false)}
          onRestart={() => reset()}
        />
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
