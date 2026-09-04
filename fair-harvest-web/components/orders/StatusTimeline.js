function formatStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export default function StatusTimeline({ events }) {
  if (!events?.length) return <p className="muted">No status updates yet.</p>;

  return (
    <ol className="supplyTimeline">
      {events.map((event, index) => (
        <li key={`${event.status}-${index}`}>
          <span>{index + 1}</span>
          <div>
            <strong>{formatStatus(event.status)}</strong>
            <p>{formatDate(event.created_at)}{event.note ? ` · ${event.note}` : ""}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
