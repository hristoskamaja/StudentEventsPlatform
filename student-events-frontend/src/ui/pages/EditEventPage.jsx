import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import EventForm from "../components/EventForm";
import EventsRepo from "../../repository/eventsRepository";
import { useAuth } from "../../contexts/AuthContext";

export default function EditEventPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { ready, authenticated, hasRole, username } = useAuth();

    const [initial, setInitial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    useEffect(() => {
        (async () => {
            setLoading(true); setErr(null);
            try { setInitial(await EventsRepo.getById(id)); }
            catch (e) { setErr(e?.response?.data?.error || e.message); }
            finally { setLoading(false); }
        })();
    }, [id]);

    const canEdit = useMemo(() => {
        if (!authenticated || !initial) return false;
        const isOwner = (initial?.createdBy ?? "").toLowerCase() === (username ?? "").toLowerCase();
        return hasRole("ADMIN") || (hasRole("ORGANIZER") && isOwner);
    }, [authenticated, hasRole, initial, username]);

    async function onSubmit(payload) {
        try {
            await EventsRepo.update(id, payload);
            alert("Настанот е ажуриран ✔");
            navigate(`/events/${id}`, { replace: true });
        } catch (e) {
            alert(e?.response?.data?.error || e.message);
        }
    }

    if (!ready || loading) return <div className="container"><p>Вчитувам…</p></div>;
    if (err) return (
        <div className="container">
            <p style={{ color: "crimson" }}>{err}</p>
            <Link className="btn" to={`/events/${id}`}>Назад</Link>
        </div>
    );
    if (!canEdit) return <div className="container"><p>Немате дозвола за уредување.</p></div>;

    return (
        <div className="container">
            <div className="toolbar">
                <h1 className="title">Уреди: {initial?.title}</h1>
                <div className="tools">
                    <Link className="btn" to={`/events/${id}`}>Назад</Link>
                </div>
            </div>

            <div className="card" style={{ padding: 16 }}>
                <EventForm initial={initial} submitText="Зачувај" onSubmit={onSubmit} />
            </div>
        </div>
    );
}
