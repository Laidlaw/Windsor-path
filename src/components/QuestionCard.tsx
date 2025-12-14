import { useEffect, useMemo, useState } from "react";
import { getPreview } from "../flow/FlowEngine";
import type { QuestionNode } from "../flow/types";
import { useSession } from "../state/useSession";

type Props = {
  node: QuestionNode;
  showEditWarning: boolean;
};

export function QuestionCard({ node, showEditWarning }: Props) {
  const answer = useSession((s) => s.answerSingle);
  const startFlow = useSession((s) => s.start);
  const currentMovement = useSession((s) => s.answers["movement_type"]) as
    | string
    | undefined;
  const preview = getPreview(node.id);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [showExpectation, setShowExpectation] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showFromMenu, setShowFromMenu] = useState(false);
  const [showToMenu, setShowToMenu] = useState(false);

  useEffect(() => {
    if (node.id !== "movement_type") return;
    const preset = currentMovement;
    if (preset === "gb_to_ni") {
      setFrom("GB");
      setTo("NI");
    } else if (preset === "ni_to_gb") {
      setFrom("NI");
      setTo("GB");
    } else if (preset === "ni_to_eu") {
      setFrom("NI");
      setTo("EU");
    } else if (preset === "eu_to_ni") {
      setFrom("EU");
      setTo("NI");
    } else if (preset === "row_to_ni") {
      setFrom("ROW");
      setTo("NI");
    } else {
      setFrom("GB");
      setTo("NI");
    }
  }, [node.id, currentMovement]);

  const mappedValue = useMemo(() => {
    if (from === "GB" && to === "NI") return "gb_to_ni";
    if (from === "NI" && to === "GB") return "ni_to_gb";
    if (from === "NI" && to === "EU") return "ni_to_eu";
    if (from === "EU" && to === "NI") return "eu_to_ni";
    if (from === "ROW" && to === "NI") return "row_to_ni";
    return "";
  }, [from, to]);

  const mappedOption = useMemo(
    () => node.options.find((opt) => opt.value === mappedValue),
    [mappedValue, node.options]
  );
  const unsupported = from !== "" && to !== "" && mappedValue === "";
  const supportedRoutes = [
    "Great Britain → Northern Ireland",
    "Northern Ireland → Great Britain",
    "Northern Ireland → European Union",
    "European Union → Northern Ireland",
    "Rest of World → Northern Ireland",
  ];

  const startMovement = () => {
    if (!mappedOption?.next || !mappedValue) return;
    const { start, answerSingle } = useSession.getState();
    // Reset to movement card with the selection captured, then advance.
    start(undefined, {
      scenario: mappedValue,
      movementPreset: mappedValue,
    });
    setTimeout(() => {
      answerSingle("movement_type", mappedValue);
    }, 0);
  };

  const fromOptions = useMemo(
    () => [
      { code: "GB", label: "Great Britain" },
      { code: "NI", label: "Northern Ireland" },
      { code: "EU", label: "European Union" },
      { code: "ROW", label: "Rest of World" },
    ],
    []
  );

  const toOptions = useMemo(
    () => [
      { code: "NI", label: "Northern Ireland" },
      { code: "GB", label: "Great Britain" },
      { code: "EU", label: "European Union" },
      { code: "ROW", label: "Rest of World" },
    ],
    []
  );

  const handleSelectFrom = (code: string) => {
    setFrom((prevFrom) => {
      if (code === to) {
        setTo(prevFrom);
      }
      return code;
    });
    setShowFromMenu(false);
    setShowToMenu(false);
  };

  const handleSelectTo = (code: string) => {
    setTo((prevTo) => {
      if (code === from) {
        setFrom(prevTo);
      }
      return code;
    });
    setShowFromMenu(false);
    setShowToMenu(false);
  };

  return (
    <div className="wp-card">
      {showEditWarning && (
        <div className="wp-edit-banner">
          You’re revisiting an earlier detail. Later answers may change.
        </div>
      )}
      <h2 className="wp-question">{node.question}</h2>
      {node.id === "movement_type" ? (
        <>
          {/* <p className="wp-help">
            Tell us where the goods start and where they land. We’ll shape the shortest path
            for that journey.
          </p> */}
          <div className="wp-flight">
            <div className="wp-flight__madlib">
              <span className="wp-flight__text">I'm shipping goods from</span>
              <div className="wp-flight__inline" aria-label="Select where goods are coming from">
                <button
                  type="button"
                  className="wp-flight__select"
                  aria-expanded={showFromMenu}
                  onClick={() => {
                    setShowFromMenu((open) => !open);
                    setShowToMenu(false);
                  }}
                >
                  {fromOptions.find((opt) => opt.code === from)?.label ?? "Choose origin"}
                  <span className="wp-flight__caret">▾</span>
                </button>
                {showFromMenu && (
                  <div className="wp-flight__menu">
                    {fromOptions.map((opt) => (
                      <button
                        key={opt.code}
                        type="button"
                        className={`wp-flight__pill ${from === opt.code ? "active" : ""}`}
                        aria-pressed={from === opt.code}
                        onClick={() => handleSelectFrom(opt.code)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="wp-flight__text">to</span>
              <div className="wp-flight__inline" aria-label="Select where goods are going to">
                <button
                  type="button"
                  className="wp-flight__select"
                  aria-expanded={showToMenu}
                  onClick={() => {
                    setShowToMenu((open) => !open);
                    setShowFromMenu(false);
                  }}
                >
                  {toOptions.find((opt) => opt.code === to)?.label ?? "Choose destination"}
                  <span className="wp-flight__caret">▾</span>
                </button>
                {showToMenu && (
                  <div className="wp-flight__menu">
                    {toOptions.map((opt) => (
                      <button
                        key={opt.code}
                        type="button"
                        className={`wp-flight__pill ${to === opt.code ? "active" : ""}`}
                        aria-pressed={to === opt.code}
                        onClick={() => handleSelectTo(opt.code)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="wp-flight__actions">
              <div className="wp-flight__hint">
                Routes must involve Northern Ireland — we’ll swap the ends automatically if
                you pick the same place twice.
              </div>
              <button
                type="button"
                className="wp-primary"
                disabled={!mappedOption?.next}
                onClick={startMovement}
              >
                {unsupported
                  ? "Route not covered"
                  : currentMovement
                  ? "Restart with this route"
                  : "Start"}
              </button>
            </div>
          </div>
          {unsupported && (
            <>
              <div className="wp-help">
                This tool only covers movements involving Northern Ireland. Try adjusting your
                route to or from NI.
              </div>
              <div className="wp-chip-row">
                {supportedRoutes.map((route) => (
                  <span key={route} className="wp-chip">
                    {route}
                  </span>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        node.help && <p className="wp-help">{node.help}</p>
      )}

      {node.id !== "movement_type" && (
        <div className="wp-options">
          {node.options.map((option) => (
            <button
              type="button"
              key={option.value}
              className="wp-option"
              onClick={() => answer(node.id, option.value)}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}

      {node.learn_more && (
        <details className="wp-learn-more">
          <summary>{node.learn_more.title}</summary>
          <div>{node.learn_more.content}</div>
        </details>
      )}

      {(node.expectation || preview) && (
        <div className="wp-card__footer">
          {node.expectation && (
            <div className="wp-hint">
              <button
                type="button"
                className="wp-hint__toggle"
                aria-expanded={showExpectation}
                onClick={() => setShowExpectation((v) => !v)}
              >
                What this usually involves <span className="wp-info">i</span>
              </button>
              <div className={`wp-hint__body ${showExpectation ? "open" : ""}`}>
                <ul className="wp-preview__list">
                  <li>{node.expectation.typical_steps}</li>
                  <li>Common complexity triggers:</li>
                  {node.expectation.common_triggers.map((trigger) => (
                    <li key={trigger} className="wp-preview__chip">
                      {trigger}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {preview && (
            <div className="wp-hint">
              <button
                type="button"
                className="wp-hint__toggle"
                aria-expanded={showPreview}
                onClick={() => setShowPreview((v) => !v)}
              >
                Coming up next <span className="wp-info">i</span>
              </button>
              <div className={`wp-hint__body ${showPreview ? "open" : ""}`}>
                <div className="wp-preview__text">{preview}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
