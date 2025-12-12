import { getShortLabel, summarizeAnswer } from "../flow/FlowEngine";
import { useSession } from "../state/useSession";

export function Breadcrumbs() {
  const history = useSession((s) => s.history);
  const answers = useSession((s) => s.answers);
  const goBackTo = useSession((s) => s.goBackTo);

  const crumbs = history
    .filter((id) => answers[id] !== undefined)
    .map((id) => ({
      id,
      label: getShortLabel(id),
      value: summarizeAnswer(id, answers[id]),
    }));

  if (crumbs.length === 0) return null;

  return (
    <div className="wp-crumbs">
      {crumbs.map((crumb) => (
        <button
          type="button"
          key={crumb.id}
          className="wp-crumb"
          onClick={() => goBackTo(crumb.id)}
        >
          <span className="wp-crumb__label">{crumb.label}</span>
          <span className="wp-crumb__value">{crumb.value}</span>
        </button>
      ))}
      <div className="wp-crumbs__hint">Revise any earlier detail</div>
    </div>
  );
}
