import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EventsRepo from "../../repository/eventsRepository";
import { useAuth } from "../../contexts/AuthContext";

export default function ManagePage() {
    const navigate = useNavigate();
    const { authenticated, hasRole, username } = useAuth();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    const canManage = authenticated && (hasRole("ADMIN") || hasRole("ORGANIZER"));

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setErr(null);
        EventsRepo.getAll()
            .then(data => { if (mounted) setEvents(data); })
            .catch(e => { if (mounted) setErr(e?.response?.data?.error || e.message); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, []);

    // ADMIN → сите; ORGANIZER → само свои
    const visible = useMemo(() => {
        if (!canManage) return [];
        if (hasRole("ADMIN")) return events;
        // ORGANIZER:
        const me = (username ?? "").toLowerCase();
        return events.filter(e => (e?.createdBy ?? "").toLowerCase() === me);
    }, [events, canManage, hasRole, username]);

    async function onDelete(id) {
        if (!confirm("Delete this event?")) return;
        try { await EventsRepo.remove(id); setEvents(prev => prev.filter(x => x.id !== id)); }
        catch (e) { alert(e?.response?.data?.error || e.message); }
    }

    if (!canManage) return <div className="container"><p>Unauthorized.</p></div>;
    if (loading)     return <div className="container"><p>Loading…</p></div>;
    if (err)         return <div className="container"><p style={{color:"crimson"}}>{err}</p></div>;

    return (
        <div className="container" style={{ display:"grid", gap:12 }}>
            {visible.length === 0 ? (
                <p style={{ opacity:0.7 }}>No events to manage.</p>
            ) : (
                <ul className="grid">
                    {visible.map(e => (
                        <li key={e.id} className="card" style={{ padding:12 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                <div>
                                    <b>{e.title}</b>
                                    <div style={{ fontSize:12, opacity:0.75 }}>
                                        {e.category} · {e.location} · by {e.createdBy}
                                    </div>
                                </div>
                                <div style={{ display:"flex", gap:8 }}>
                                    <button className="btn" onClick={() => navigate(`/events/${e.id}`)}>Open</button>
                                    <button className="btn" onClick={() => navigate(`/events/${e.id}/edit`)}>Edit</button>
                                    <button className="btn danger" onClick={() => onDelete(e.id)}>Delete</button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
