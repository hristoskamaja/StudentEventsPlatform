import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import RegistrationsRepo from "../../repository/registrationsRepository";
import { EventsRepo } from "../../repository/eventsRepository";
import { useAuth } from "../../contexts/AuthContext";

function toYMD(dt) {
    const d = new Date(dt);
    if (isNaN(d)) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export default function EventsCalendar() {
    const { hasRole, username, authenticated } = useAuth();

    const isOrganizer = authenticated && (hasRole?.("ORGANIZER") || hasRole?.("ADMIN"));

    const [allEvents, setAllEvents] = useState([]);
    const [markedDates, setMarkedDates] = useState(new Map());
    const [loading, setLoading] = useState(true);

    const [selectedDate, setSelectedDate] = useState(null);
    const [dayEvents, setDayEvents] = useState([]);

    useEffect(() => {
        let alive = true;
        setLoading(true);

        (async () => {
            try {
                let events = [];

                if (!authenticated) {
                    // ако не е најавен, нема “мои” датуми
                    events = [];
                } else if (isOrganizer) {
                    const all = await EventsRepo.list();
                    const u = (username ?? "").toLowerCase();
                    events = (all || []).filter(
                        (e) => (e?.createdBy ?? "").toLowerCase() === u
                    );
                } else {
                    const regs = await RegistrationsRepo.mine();
                    events = (regs || []).map((r) => r?.event).filter(Boolean);
                }

                // mark days by startTime date
                const map = new Map();
                for (const e of events) {
                    const key = toYMD(e?.startTime);
                    if (!key) continue;

                    const prev = map.get(key);
                    map.set(key, {
                        type: isOrganizer ? "created" : "registered",
                        count: prev ? prev.count + 1 : 1,
                    });
                }

                if (alive) {
                    setAllEvents(events);
                    setMarkedDates(map);
                }
            } catch (e) {
                if (alive) {
                    setAllEvents([]);
                    setMarkedDates(new Map());
                }
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [authenticated, isOrganizer, username]);

    const tileClassName = useMemo(() => {
        return ({ date, view }) => {
            if (view !== "month") return "";
            const key = toYMD(date);
            const info = key ? markedDates.get(key) : null;
            if (!info) return "";
            return info.type === "created" ? "cal-mark cal-created" : "cal-mark cal-registered";
        };
    }, [markedDates]);

    const tileContent = useMemo(() => {
        return ({ date, view }) => {
            if (view !== "month") return null;
            const key = toYMD(date);
            const info = key ? markedDates.get(key) : null;
            if (!info) return null;
            return <span className="cal-dot" title={`${info.count} настан(и)`} />;
        };
    }, [markedDates]);

    function openDay(date) {
        const key = toYMD(date);
        const list = (allEvents || []).filter((e) => toYMD(e?.startTime) === key);
        setSelectedDate(date);
        setDayEvents(list);
    }

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <h3 style={{ margin: 0 }}>Календар</h3>
                <span style={{ fontSize: 12, opacity: 0.75 }}>
          {loading ? "Вчитувам…" : !authenticated ? "Најави се" : isOrganizer ? "Мои настани" : "Мои пријави"}
        </span>
            </div>

            <Calendar
                tileClassName={tileClassName}
                tileContent={tileContent}
                onClickDay={openDay}
            />

            <div style={{ display: "flex", gap: 12, marginTop: 12, fontSize: 12, opacity: 0.85 }}>
                <span><b className="legend legend-reg" /> Пријавен</span>
                <span><b className="legend legend-cre" /> Креиран</span>
            </div>

            {/* POPUP / MODAL */}
            {selectedDate && (
                <div className="day-modal" onClick={() => setSelectedDate(null)}>
                    <div className="day-modal__content" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                            <h4 style={{ margin: 0 }}>
                                {selectedDate.toLocaleDateString("mk-MK", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </h4>
                            <button className="btn" onClick={() => setSelectedDate(null)}>Затвори</button>
                        </div>

                        <div style={{ marginTop: 12 }}>
                            {dayEvents.length === 0 ? (
                                <p className="muted" style={{ margin: 0 }}>Нема настани за овој датум.</p>
                            ) : (
                                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
                                    {dayEvents.map((e) => (
                                        <li key={e.id} className="day-item">
                                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                                                <div>
                                                    <div style={{ fontWeight: 800, lineHeight: 1.2 }}>{e.title}</div>
                                                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                                                        {(e.location || "")}
                                                        {e.startTime ? (
                                                            <> • {new Date(e.startTime).toLocaleTimeString("mk-MK", { hour: "2-digit", minute: "2-digit" })}</>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                <Link className="btn primary" to={`/events/${e.id}`} onClick={() => setSelectedDate(null)}>
                                                    Детали
                                                </Link>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
