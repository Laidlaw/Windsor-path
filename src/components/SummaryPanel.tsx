import { useEffect, useMemo, useState } from "react";
import { getScenarioLabel, getShortLabel, summarizeAnswer } from "../flow/FlowEngine";
import { calculateRiskProfile } from "../state/riskProfile";
import { useSession } from "../state/useSession";

type Props = {
  reportOpen?: boolean;
  onCloseReport?: () => void;
  onRestart?: () => void;
};

export function SummaryPanel({
  reportOpen,
  onCloseReport,
  onRestart,
}: Props) {
  const history = useSession((s) => s.history);
  const answers = useSession((s) => s.answers);
  const scenario = useSession((s) => s.scenario);
  const viewMode = useSession((s) => s.viewMode);
  const setViewMode = useSession((s) => s.setViewMode);
  const [showProvisional, setShowProvisional] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  const items = useMemo(() => {
    const seen = new Set<string>();
    return history
      .filter((id) => answers[id] !== undefined)
      .map((id) => ({
        id,
        label: getShortLabel(id),
        value: summarizeAnswer(id, answers[id]),
      }))
      .filter((item) => {
        const key = `${item.label}-${item.value}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [answers, history]);

  const scenarioLabel = scenario ? getScenarioLabel(scenario) : "";
  const riskProfile = useMemo(() => calculateRiskProfile(answers), [answers]);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    // no-op placeholder for potential triggers
  }, []);

  const highlightTerms = (text: string) => {
    const matcher = /(UKIMS|Category 1)/gi;
    const parts = text.split(matcher);
    return parts.map((part, idx) =>
      matcher.test(part)
        ? (
            <span key={`${part}-${idx}`} className="wp-term">
              {part}
            </span>
          )
        : <span key={`${part}-${idx}`}>{part}</span>
    );
  };

  const status =
    riskProfile.tone === "high"
      ? "High exposure"
      : riskProfile.tone === "moderate"
      ? "Moderate exposure"
      : "Lower exposure";
  const tone = riskProfile.tone;

  const reportItems = useMemo(() => {
    const rows: { id: string; label: string; value: string }[] = [];
    if (scenarioLabel) rows.push({ id: "movement_type", label: "Movement", value: scenarioLabel });

    items.forEach((item) => {
      if (item.id === "movement_type" && scenarioLabel) return;
      rows.push({ id: item.id, label: item.label, value: item.value });
    });

    return rows;
  }, [items, scenarioLabel]);

  const riskBars = [
    { key: "audit", label: "Audit likelihood", value: riskProfile.audit },
    { key: "documentary", label: "Documentary burden", value: riskProfile.documentary },
    { key: "temporal", label: "Temporal uncertainty", value: riskProfile.temporal },
    { key: "judgment", label: "Judgment calls", value: riskProfile.judgment },
  ];

  return (
    <>
      <aside className={`wp-summary ${reportOpen ? "open" : ""}`}>
        <div className="wp-summary__header">
          <div>
            <div className="wp-summary__title">Your report</div>
            <div className="wp-summary__hint">
              Live risk view updates as you answer. The log below tracks your decisions.
            </div>
          </div>
          <div className="wp-summary__top-actions">
            <div className="wp-view-toggle" role="group" aria-label="Report view mode">
              <button
                type="button"
                className={viewMode === "procedural" ? "active" : ""}
                onClick={() => setViewMode("procedural")}
              >
                Procedural
              </button>
              <button
                type="button"
                className={viewMode === "reality" ? "active" : ""}
                onClick={() => setViewMode("reality")}
              >
                Reality
              </button>
            </div>
            <div className={`wp-summary__status ${tone}`}>{status}</div>
          </div>
        </div>

        <div className="wp-summary__body">
          <div className="wp-risk-widget">
            <div className="wp-risk__top">
              <div className="wp-risk__label">Risk profile</div>
              <div className={`wp-risk__pill ${tone}`}>
                {tone === "high" ? "High" : tone === "moderate" ? "Moderate" : "Lower"} exposure
              </div>
              <button
                type="button"
                className="wp-link ghost small"
                onClick={() => setShowHidden(true)}
              >
                Hidden layers
              </button>
              <div className="wp-summary__actions">
                <button
                  type="button"
                  className="wp-link ghost small"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Report actions"
                >
                  ▾
                </button>
                {menuOpen && (
                  <div className="wp-summary__menu">
                    <button
                      type="button"
                      onClick={() => {
                        const text = reportItems
                          .map((row) => `${row.label}: ${row.value}`)
                          .join("\n");
                        navigator.clipboard?.writeText(text);
                        setMenuOpen(false);
                      }}
                    >
                      Copy report
                    </button>
                    <button type="button" onClick={() => setMenuOpen(false)}>
                      Download (soon)
                    </button>
                    <button type="button" onClick={() => setMenuOpen(false)}>
                      Email (soon)
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="wp-risk__bars">
              {riskBars.map((bar) => (
                <div key={bar.key} className="wp-risk__row">
                  <div className="wp-risk__label-row">
                    <span>{bar.label}</span>
                    <span className="wp-risk__value">{Math.round(bar.value)}%</span>
                  </div>
                  <div className="wp-risk__meter">
                    <div
                      className={`wp-risk__fill ${tone}`}
                      style={{ width: `${Math.round(bar.value)}%` }}
                      aria-hidden
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="wp-risk__viewcopy">
              {viewMode === "procedural"
                ? "Procedural view: focus on obligations and next steps for this path."
                : "Reality view: highlights uncertainty, cascading costs, and audit exposure."}
            </div>
          </div>

          {reportOpen && (
            <div className="wp-summary__mobile-actions">
              {onRestart && (
                <button className="wp-link small" type="button" onClick={onRestart}>
                  Restart
                </button>
              )}
              <button
                className="wp-link small"
                type="button"
                onClick={() => setShowProvisional(true)}
              >
                End (quick guess)
              </button>
              {onCloseReport && (
                <button className="wp-link ghost small" type="button" onClick={onCloseReport}>
                  Close
                </button>
              )}
            </div>
          )}

          {reportItems.length > 0 ? (
            <div className="wp-report">
              {reportItems.map((row) => (
                <button
                  key={`${row.label}-${row.value}`}
                  className="wp-report__row"
                  type="button"
                  onClick={() => {
                    const id = `node-${row.id}`;
                    const el = document.getElementById(id);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <div className="wp-summary__label">{row.label}</div>
                  <div className="wp-summary__value">{highlightTerms(row.value)}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="wp-summary__empty">
              We’ll summarize your answers here as you go.
            </div>
          )}
        </div>
      </aside>

      <div className={`wp-provisional ${reportOpen ? "open" : ""}`}>
        <div>
          <div className="wp-summary__label">Too long?</div>
          <div className="wp-summary__value">
            Get a quick risk guess based on what you’ve answered so far. You can come
            back and finish any time.
          </div>
        </div>
        {!showProvisional ? (
          <button
            className="wp-link"
            type="button"
            onClick={() => setShowProvisional(true)}
          >
            Get a quick guess
          </button>
        ) : (
          <div className="wp-provisional__card">
            <div className={`wp-summary__status ${tone}`}>{status}</div>
            <div className="wp-provisional__hint">
              Based on {items.length} answered fields and current exposure drivers.
            </div>
            <div className="wp-provisional__actions">
              <button
                className="wp-link ghost"
                type="button"
                onClick={() => setShowProvisional(false)}
              >
                Hide guess
              </button>
              {onCloseReport && (
                <button className="wp-link" type="button" onClick={onCloseReport}>
                  Close report
                </button>
              )}
            </div>
          </div>
        )}
      </div>

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
                  How audit risk, time, and judgment stack beneath your selections.
                </div>
              </div>
              <button className="wp-link ghost small" type="button" onClick={() => setShowHidden(false)}>
                Close
              </button>
            </div>
            <div className="wp-hidden__grid">
              {riskBars.map((bar) => (
                <div key={bar.key} className="wp-hidden__card">
                  <div className="wp-risk__label-row">
                    <span>{bar.label}</span>
                    <span className="wp-risk__value">{Math.round(bar.value)}%</span>
                  </div>
                  <div className="wp-risk__meter">
                    <div
                      className={`wp-risk__fill ${tone}`}
                      style={{ width: `${Math.round(bar.value)}%` }}
                      aria-hidden
                    />
                  </div>
                </div>
              ))}
            </div>
            {riskProfile.notes.length > 0 && (
              <div className="wp-hidden__notes">
                <div className="wp-summary__label">Why these moved</div>
                <ul>
                  {riskProfile.notes.map((note, idx) => (
                    <li key={`${note}-${idx}`}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
