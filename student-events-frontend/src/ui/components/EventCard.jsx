import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./EventCard.css";

function fmt(dt) {
    if (!dt) return "";
    const d = new Date(dt);
    return isNaN(d)
        ? dt
        : d.toLocaleString("mk-MK", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
}

export default function EventCard({ e, onEdit, onDelete }) {
    const { authenticated, hasRole, username } = useAuth();

    const isOwner =
        (e?.createdBy ?? "").toLowerCase() === (username ?? "").toLowerCase();

    const canEdit =
        authenticated && (hasRole("ADMIN") || (hasRole("ORGANIZER") && isOwner));

    const start = e?.startTime ? new Date(e.startTime) : null;
    const day = start ? String(start.getDate()).padStart(2, "0") : "--";
    const month = start
        ? start.toLocaleString("en-US", { month: "short" })
        : "---";
    const year = start ? start.getFullYear() : "----";

    return (
        <li className="event-ticket">
            {/* IMAGE */}
            <div className="ticket-image">
                <img
                    src={e?.imageUrl || "/placeholder.jpg"}
                    alt={e?.title || "Event"}
                    loading="lazy"
                />
            </div>

            {/* CONTENT */}
            <div className="ticket-content">
                <div className="ticket-time">{fmt(e?.startTime)}</div>

                <h3 className="ticket-title">{e?.title}</h3>

                {e?.description && <p className="ticket-desc">{e.description}</p>}

                <div className="ticket-footer">
                    <Link to={`/events/${e?.id}`} className="details-link">
                        Детали
                    </Link>

                    {canEdit && (
                        <div className="ticket-actions">
                            <button type="button" onClick={() => onEdit?.(e)}>
                                Уреди
                            </button>

                            <button type="button" onClick={() => onDelete?.(e?.id)}>
                                Избриши
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* DATE STRIP */}
            <div className="ticket-date">
                <span className="month">{month}</span>
                <span className="day">{day}</span>
                <span className="year">{year}</span>
            </div>
        </li>
    );
}
