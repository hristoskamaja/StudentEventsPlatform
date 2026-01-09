import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import EventsRepo from "../../repository/eventsRepository";
import RegistrationsRepo from "../../repository/registrationsRepository";
import ReviewsRepo from "../../repository/reviewsRepository";
import PaymentsRepo from "../../repository/paymentsRepository";
import { useAuth } from "../../contexts/AuthContext";
import "./EventDetailsPage.css";

function fmtDateLong(dt) {
    if (!dt) return "";
    const d = new Date(dt);
    return isNaN(d)
        ? dt
        : d.toLocaleString("mk-MK", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
}

// (од стариот) ако ти треба нека остане — не смета
function fmtRange(a, b) {
    if (!a || !b) return "";
    const da = new Date(a);
    const db = new Date(b);
    if (isNaN(da) || isNaN(db)) return `${a} → ${b}`;

    const sameDay = da.toDateString() === db.toDateString();
    const dayA = da.toLocaleDateString("mk-MK", { day: "2-digit", month: "short", year: "numeric" });
    const dayB = db.toLocaleDateString("mk-MK", { day: "2-digit", month: "short", year: "numeric" });
    const tA = da.toLocaleTimeString("mk-MK", { hour: "2-digit", minute: "2-digit" });
    const tB = db.toLocaleTimeString("mk-MK", { hour: "2-digit", minute: "2-digit" });

    return sameDay ? `${dayA}, ${tA} – ${tB}` : `${dayA} ${tA} → ${dayB} ${tB}`;
}

export default function EventDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { authenticated, hasRole, username, login } = useAuth();

    const [event, setEvent] = useState(null);
    const [myReg, setMyReg] = useState({ registered: false });
    const [busy, setBusy] = useState(false);

    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);

    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setErr(null);

        (async () => {
            try {
                const [ev, st] = await Promise.all([
                    EventsRepo.getById(id),
                    authenticated
                        ? RegistrationsRepo.statusForEvent(id).catch(() => ({ registered: false }))
                        : Promise.resolve({ registered: false }),
                ]);

                if (!mounted) return;
                setEvent(ev);
                setMyReg(st || { registered: false });

                const [list, avg] = await Promise.all([
                    ReviewsRepo.forEvent(id),
                    ReviewsRepo.averageForEvent(id),
                ]);

                if (!mounted) return;
                setReviews(Array.isArray(list) ? list : []);
                setAvgRating(typeof avg === "number" ? avg : 0);
            } catch (e) {
                if (!mounted) return;
                setErr(e?.response?.data?.error || e.message || "Грешка");
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [id, authenticated]);

    const isOwner = useMemo(
        () => ((event?.createdBy ?? "").toLowerCase() === (username ?? "").toLowerCase()),
        [event, username]
    );
    const regPaid = !!myReg?.registration?.paid;
    const canEdit = authenticated && (hasRole("ADMIN") || (hasRole("ORGANIZER") && isOwner));
    const isStudent = authenticated && !(hasRole("ADMIN") || hasRole("ORGANIZER"));

    const cap = Number(event?.maxCapacity ?? 0);
    const left = typeof event?.availableSeats === "number" ? event.availableSeats : null;
    const used = left != null && cap > 0 ? cap - left : null;
    const pct =
        used != null && cap > 0 ? Math.min(100, Math.max(0, Math.round((used / cap) * 100))) : 0;

    // ====== ПЛАЌАЊЕ ======
    const isPaidEvent = useMemo(() => {
        const p = event?.price;
        if (p == null) return false;
        const n = Number(p);
        return !Number.isNaN(n) && n > 0;
    }, [event?.price]);

    const priceText = useMemo(() => {
        const n = Number(event?.price ?? 0);
        if (!n) return "";
        return Number.isInteger(n) ? `${n}` : n.toFixed(2);
    }, [event?.price]);

    async function pay() {
        if (!authenticated) {
            login?.();
            return;
        }

        try {
            setBusy(true);

            if (!myReg?.registered) {
                alert("Прво пријави се на настанот, па потоа плати.");
                return;
            }

            const data = await PaymentsRepo.checkout(id);
            const url = data?.url;

            if (!url) throw new Error("Stripe URL недостасува");
            window.location.href = url;
        } catch (e) {
            alert(
                e?.response?.data?.error ||
                e?.response?.data?.message ||
                e.message ||
                "Грешка при плаќање"
            );
        } finally {
            setBusy(false);
        }
    }

    async function register() {
        if (!authenticated) {
            login?.();
            return;
        }
        try {
            setBusy(true);
            const saved = await RegistrationsRepo.create(Number(id));
            setMyReg({ registered: true, registration: saved });

            if (typeof event?.availableSeats === "number") {
                setEvent((e) => ({
                    ...e,
                    availableSeats: Math.max(0, (e.availableSeats ?? 0) - 1),
                }));
            }

            alert("Успешна пријава");
        } catch (e) {
            alert(e?.response?.data?.error || e.message);
        } finally {
            setBusy(false);
        }
    }

    async function cancel() {
        try {
            setBusy(true);

            if (myReg?.registration?.id) {
                await RegistrationsRepo.cancel(myReg.registration.id);
            }

            setMyReg({ registered: false });

            if (typeof event?.availableSeats === "number") {
                setEvent((e) => ({
                    ...e,
                    availableSeats: (e.availableSeats ?? 0) + 1,
                }));
            }

            alert("Регистрацијата е откажана");
        } catch (e) {
            alert(e?.response?.data?.error || e.message);
        } finally {
            setBusy(false);
        }
    }

    if (loading) return <div className="container"><p>Вчитувам…</p></div>;
    if (err) return <div className="container"><p style={{ color: "crimson" }}>{err}</p></div>;
    if (!event) return <div className="container"><p>Настанот не е пронајден.</p></div>;

    return (
        <div className="container">
            <div className="eventd-hero card">
                <div className="eventd-hero__media">
                    <img src={event.imageUrl || "/placeholder.jpg"} alt={event.title} />
                    <div className="eventd-hero__badge">{event.category}</div>
                </div>

                <div className="eventd-hero__body">
                    <div className="eventd-titleRow">
                        <h1 className="eventd-title">{event.title}</h1>

                        <div className="eventd-actions">
                            <button className="btn outline" onClick={() => navigate(-1)}>Назад</button>

                            {isStudent && (
                                myReg.registered ? (
                                    <button className="btn danger" onClick={cancel} disabled={busy}>Откажи</button>
                                ) : (
                                    <button className="btn primary" onClick={register} disabled={busy}>
                                        Пријави се
                                    </button>
                                )
                            )}

                            {isStudent && isPaidEvent && myReg?.registered && !regPaid && (
                                <button className="btn primary" onClick={pay} disabled={busy}>
                                    Плати {priceText} ден.
                                </button>
                            )}

                            {isStudent && myReg?.registered && (!isPaidEvent || regPaid) && (
                                <Link className="btn outline" to={`/ticket/${myReg.registration.id}`}>
                                    Билет (QR)
                                </Link>
                            )}


                            {canEdit && (
                                <Link className="btn outline" to={`/events/${event.id}/edit`}>Измени</Link>
                            )}
                        </div>
                    </div>

                    {event.description && <p className="eventd-desc">{event.description}</p>}
                </div>
            </div>

            <div className="eventd-grid">
                <div className="card eventd-card">
                    <h3 className="eventd-card__title">Информации</h3>
                    <p><b>Почеток:</b> {fmtDateLong(event.startTime)}</p>
                    <p><b>Крај:</b> {fmtDateLong(event.endTime)}</p>
                    <p><b>Локација:</b> {event.location}</p>
                    <p><b>Цена:</b> {isPaidEvent ? `${priceText} денари` : "Бесплатно"}</p>
                </div>

                <div className="card eventd-card">
                    <h3 className="eventd-card__title">Капацитет</h3>
                    {cap > 0 && left != null ? (
                        <>
                            <p>{used}/{cap} пополнето — {left} слободни</p>
                            <div className="cap-bar">
                                <div className="cap-bar__fill" style={{ width: `${pct}%` }} />
                            </div>
                        </>
                    ) : (
                        <p>Нема ограничување</p>
                    )}

                    {/* ✅ ДОДАДЕНО (од стариот): Оценки */}
                    <div style={{ height: 14 }} />
                    <h3 className="eventd-card__title">Оценки</h3>
                    <div className="rating-row">
                        <div className="rating-big">{Number(avgRating || 0).toFixed(1)}</div>
                        <div className="rating-meta">
                            <div className="rating-stars">⭐</div>
                            <div className="muted">{reviews.length} коментари</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ ДОДАДЕНО (од стариот): Коментари */}
            <div className="card eventd-card" style={{ marginTop: 18 }}>
                <h3 className="eventd-card__title">Коментари</h3>

                {reviews.length === 0 ? (
                    <p className="muted">Нема оставени оценки</p>
                ) : (
                    <ul className="reviews-list">
                        {reviews.map((r) => (
                            <li key={r.id} className="card pad" style={{ marginBottom: "0.5rem" }}>
                                <div style={{ color: "#facc15", fontSize: "1.1rem" }}>
                                    {"★".repeat(r.rating)}
                                    <span style={{ color: "#d1d5db" }}>
                                        {"★".repeat(5 - r.rating)}
                                    </span>
                                </div>

                                {r.comment ? (
                                    <p style={{ margin: "0.35rem 0" }}>{r.comment}</p>
                                ) : (
                                    <p style={{ margin: "0.35rem 0", opacity: 0.7 }}>(без коментар)</p>
                                )}

                                <small>— {r.studentUsername || r.username || "корисник"}</small>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
