import { useSession } from "../state/useSession";

const quickPaths = [
  {
    id: "ni_to_gb",
    label: "NI → GB",
    hint: "Usually very simple",
    start: "ni_to_gb_flow",
    entryTone: "This path is short. Most people finish here.",
  },
  {
    id: "eu_to_ni",
    label: "EU → NI",
    hint: "Usually ends immediately",
    start: "eu_free_movement",
    entryTone: "This usually ends here.",
  },
  {
    id: "gb_to_ni",
    label: "GB → NI",
    hint: "More steps, but we’ll keep it light",
    start: "sector_gate",
  },
  {
    id: "unsure",
    label: "Not sure / complicated",
    hint: "Start from the beginning",
    start: "movement_type",
  },
];

export function EntryTabs() {
  const start = useSession((s) => s.start);
  const scenario = useSession((s) => s.scenario);

  return (
    <div className="wp-tabs">
      {quickPaths.map((path) => {
        const isActive = scenario === path.id || (!scenario && path.id === "unsure");
        return (
          <button
            type="button"
            key={path.id}
            className={`wp-tab ${isActive ? "active" : ""}`}
            onClick={() =>
              start(path.start, {
                scenario: path.id === "unsure" ? undefined : path.id,
                movementPreset: path.id === "unsure" ? undefined : path.id,
                entryTone: path.entryTone,
              })
            }
          >
            <div className="wp-tab__label">{path.label}</div>
            <div className="wp-tab__hint">{path.hint}</div>
          </button>
        );
      })}
    </div>
  );
}
