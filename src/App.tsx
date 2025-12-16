import { useEffect, useState } from "react";
import { FlowStack } from "./components/FlowStack";
import { SummaryPanel } from "./components/SummaryPanel";
import { useSession } from "./state/useSession";
import "./styles.css";

export default function WindsorPathApp() {
  const start = useSession((s) => s.start);
  const reset = useSession((s) => s.reset);
  const history = useSession((s) => s.history);
  const goBackTo = useSession((s) => s.goBackTo);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    start();
  }, [start]);

  const canStepBack = history.length > 1;
  const handleStepBack = () => {
    const prevId = history[history.length - 2];
    if (prevId) goBackTo(prevId);
  };

  return (
    <div className="wp-shell">
      <div className="wp-layout">
        <div className="wp-survey">
          <header className="wp-topbar">
            <button className="wp-brand" type="button" onClick={() => reset()}>
              Windsor Path
            </button>
            <div className="wp-topbar__actions">
              <button className="wp-restart hide-mobile" type="button" onClick={() => reset()}>
                Restart
              </button>
              {canStepBack && (
                <button className="wp-restart hide-mobile" type="button" onClick={handleStepBack}>
                  &lt; Step Back
                </button>
              )}
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
          <div className="wp-main">
            <FlowStack />
          </div>
        </div>
        <div className="wp-summary-col">
          <SummaryPanel
            reportOpen={reportOpen}
            onCloseReport={() => setReportOpen(false)}
            onRestart={() => reset()}
          />
        </div>
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
