import { useEffect, useMemo, useState } from "react";
import {
  getScenarioLabel,
  getShortLabel,
  summarizeAnswer,
} from "../flow/FlowEngine";
import { MAX_COMPLEXITY } from "../flow/FlowEngine";
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
  const complexity = useSession((s) => s.complexity);
  const [showProvisional, setShowProvisional] = useState(false);

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
  const scenarioChosen = Boolean(scenario);
  const percentage = Math.min((complexity / MAX_COMPLEXITY) * 100, 100);
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

  let status = "Not enough information yet";
  let tone = "pending";

  if (scenarioChosen) {
    if (complexity <= 5) {
      status = "Simple scenario";
      tone = "simple";
    } else if (complexity <= 10) {
      status = "Moderate complexity";
      tone = "moderate";
    } else {
      status = "Complex scenario";
      tone = "complex";
    }
  }

  const reportItems = useMemo(() => {
    const rows: { id: string; label: string; value: string }[] = [];
    if (scenarioLabel) rows.push({ id: "movement_type", label: "Movement", value: scenarioLabel });

    items.forEach((item) => {
      if (item.id === "movement_type" && scenarioLabel) return;
      rows.push({ id: item.id, label: item.label, value: item.value });
    });

    return rows;
  }, [items, scenarioLabel]);

  return (
    <>
      <aside className={`wp-summary ${reportOpen ? "open" : ""}`}>
        <div className="wp-summary__bar">
          <div
            className={`wp-summary__bar-fill ${tone}`}
            style={{ width: `${percentage}%` }}
            aria-hidden
          />
        </div>
        <div className="wp-summary__header">
          <div>
            <div className="wp-summary__title">
              Your report
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
          </div>
          <div className={`wp-summary__status ${tone}`}>{status}</div>
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
              Based on {items.length} answered fields and current complexity.
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
    </>
  );
}
