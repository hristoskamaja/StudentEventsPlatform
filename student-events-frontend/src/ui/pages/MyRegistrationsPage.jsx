import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import RegistrationsRepo from "../../repository/registrationsRepository";
import ReviewsRepo from "../../repository/reviewsRepository";
import ReviewForm from "../components/reviews/ReviewForm";
import { useAuth } from "../../contexts/AuthContext";
import "./MyRegistrationsPage.css";

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

export default function MyRegistrationsPage() {
    const [items, setItems] = useState([]);
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(true);

    const { token } = useAuth();
    const [myReviews, setMyReviews] = useState({}); // eventId -> review|null

    const [q, setQ] = useState("");
    const [when, setWhen] = useState("all"); // all | future | past

    useEffect(() => {
        let alive = true;
        setLoading(true);
        setErr(null);

        RegistrationsRepo.mine()
            .then((d) => alive && setItems(d))
            .catch((e) =>
                alive && setErr(e?.response?.data?.error || e.message || "Грешка при вчитување!")
            )
            .finally(() => alive && setLoading(false));

        return () => {
            alive = false;
        };
    }, []);

    // 2) дали веќе имам review за секој настан
    useEffect(() => {
        if (!items.length || !token) return;

        let alive = true;

        (async () => {
            const map = {};
            for (const r of items) {
                try {
                    const mine = await ReviewsRepo.mineForEvent(r.event.id, token);
                    map[r.event.id] = mine; // null ако нема
                } catch {
                    map[r.event.id] = null;
                }
            }
            if (alive) setMyReviews(map);
        })();

        return () => {
            alive = false;
        };
    }, [items, token]);

    const now = new Date();

    const filteredItems = useMemo(() => {
        const qq = q.trim().toLowerCase();

        return (items || [])
            .filter((r) => {
                const end = r?.event?.endTime ? new Date(r.event.endTime) : null;
                const isPast = end ? end < now : false;

                if (when === "all") return true;
                if (when === "future") return !isPast;
                if (when === "past") return isPast;
                return true;
            })
            .filter((r) => {
                if (!qq) return true;
                const t = (r?.event?.title || "").toLowerCase();
                const loc = (r?.event?.location || "").toLowerCase();
                return t.includes(qq) || loc.includes(qq);
            })
            .sort((a, b) => (a?.event?.startTime || "").localeCompare(b?.event?.startTime || ""));
    }, [items, q, when]);

    if (loading) return <div className="container"><p>Вчитувам…</p></div>;
    if (err) return <div className="container"><p style={{ color: "crimson" }}>{err}</p></div>;

    if (items.length === 0) {
        return (
            <div className="container">
                <div className="toolbar">
                    <h1 className="title">Мои пријави</h1>
                </div>
                <div className="card pad"><p>Немаш активни пријави.</p></div>
            </div>
        );
    }

    return (
        <div className="container">
            {/* header + filters */}
            <div className="toolbar">
                <div>
                    <h1 className="title">Мои пријави</h1>
                    <div className="subtitle">{filteredItems.length} прикажани (од {items.length})</div>
                </div>

                <div className="tools">
                    <input
                        className="input"
                        placeholder="Пребарај"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ marginBottom: 14 }}>
                <div className="tabs">
                    <button
                        className={`tab ${when === "all" ? "active" : ""}`}
                        onClick={() => setWhen("all")}
                    >
                        Сите
                    </button>
                    <button
                        className={`tab ${when === "future" ? "active" : ""}`}
                        onClick={() => setWhen("future")}
                    >
                        Идни
                    </button>
                    <button
                        className={`tab ${when === "past" ? "active" : ""}`}
                        onClick={() => setWhen("past")}
                    >
                        Завршени
                    </button>
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <div className="card pad">
                    <h3 style={{ marginTop: 0 }}>Нема резултати</h3>
                </div>
            ) : (
                <ul className="grid myreg-grid">
                    {filteredItems.map((r) => {
                        const ended = r.event?.endTime ? new Date(r.event.endTime) < now : false;
                        const mine = myReviews[r.event.id] ?? null;

                        const start = r.event?.startTime ? new Date(r.event.startTime) : null;
                        const day = start ? String(start.getDate()).padStart(2, "0") : "--";
                        const month = start ? start.toLocaleString("mk-MK", { month: "short" }) : "---";
                        const year = start ? start.getFullYear() : "----";

                        return (
                            <li key={r.id} className="reg-ticket">
                                {/* CONTENT */}
                                <div className="reg-content">
                                    <p className="reg-location">{r.event.location}</p>

                                    <div className="reg-time">
                                        {fmt(r.event.startTime)}
                                    </div>

                                    <h1 className="reg-title">{r.event.title}</h1>

                                    <div className="reg-footer">
                                        <Link className="reg-btn" to={`/events/${r.event.id}`}>Детали</Link>
                                    </div>

                                    {/* REVIEW SECTION */}
                                    {ended && (
                                        <div className="reg-review">
                                            {mine === null ? (
                                                <>
                                                    <h4 className="reg-review-title">Остави оцена</h4>
                                                    <ReviewForm
                                                        eventId={r.event.id}
                                                        onSubmitted={async () => {
                                                            alert("Оцената е успешно зачувана!");
                                                            try {
                                                                const refreshed = await ReviewsRepo.mineForEvent(r.event.id, token);
                                                                setMyReviews((prev) => ({ ...prev, [r.event.id]: refreshed }));
                                                            } catch {}
                                                        }}
                                                    />
                                                </>
                                            ) : (
                                                <div className="reg-review-existing">
                                                    <b>⭐ {mine.rating}/5</b>
                                                    {mine.comment ? <> — „{mine.comment}“</> : null}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* DATE STRIP */}
                                <div className="reg-date">
                                    <span className="month">{month}</span>
                                    <span className="day">{day}</span>
                                    <span className="year">{year}</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
