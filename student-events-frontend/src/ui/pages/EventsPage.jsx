import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEvents } from "../../hooks/useEvents";
import EventsRepo from "../../repository/eventsRepository";
import EventCard from "../components/EventCard.jsx";
import { useAuth } from "../../contexts/AuthContext";

const CATS = ["ALL","ACADEMIC","COMMUNITY","HACKATHON","WORKSHOP","OTHER"];

export default function EventsPage() {
    const navigate = useNavigate();
    const { events, loading, error, refresh } = useEvents();

    const [q, setQ] = useState("");
    const [cat, setCat] = useState("ALL");

    const [when, setWhen] = useState("future");

    const { authenticated, hasRole } = useAuth();
    const canManage = authenticated && (hasRole("ADMIN") || hasRole("ORGANIZER"));

    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        const now = new Date();

        return (events || [])
            .filter((e) => cat === "ALL" || e.category === cat)
            .filter((e) => {
                const end = e?.endTime ? new Date(e.endTime) : null;
                const isPast = end ? end < now : false;

                if (when === "all") return true;
                if (when === "future") return !isPast;
                if (when === "past") return isPast;
                return true;
            })
            .filter((e) => !qq || ((e.title || "") + " " + (e.description || "")).toLowerCase().includes(qq))
            .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
    }, [events, q, cat, when]);

    async function onDelete(id) {
        if (!confirm("Избриши го настанот?")) return;
        try {
            await EventsRepo.remove(id);
            await refresh();
        } catch (e) {
            alert(e?.response?.data?.error || e.message);
        }
    }

    if (loading) return <div className="container"><p>Вчитување</p></div>;
    if (error)   return <div className="container"><p style={{color:'crimson'}}>{error}</p></div>;

    return (
        <div className="container">
            <div className="toolbar">
                <div>
                    <h1 className="title">Настани</h1>
                    <div className="subtitle">{filtered.length} резултати</div>
                </div>

                <div className="tools">
                    <input
                        className="input"
                        placeholder="Пребарај"
                        value={q}
                        onChange={(e)=>setQ(e.target.value)}
                    />

                    <select className="select" value={cat} onChange={(e)=>setCat(e.target.value)}>
                        {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    {canManage && (
                        <button className="btn primary" onClick={()=>navigate("/events/create")}>
                            + Нов настан
                        </button>
                    )}
                </div>
            </div>

            <div style={{ marginBottom: 14 }}>
                <div className="tabs">
                    <button className={`tab ${when==="all" ? "active" : ""}`} onClick={()=>setWhen("all")}>Сите</button>
                    <button className={`tab ${when==="future" ? "active" : ""}`} onClick={()=>setWhen("future")}>Идни</button>
                    <button className={`tab ${when==="past" ? "active" : ""}`} onClick={()=>setWhen("past")}>Завршени</button>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="card pad">
                    <h3 style={{marginTop:0}}>Нема совпаѓања</h3>
                </div>
            ) : (
                <ul className="grid">
                    {filtered.map(e => (
                        <EventCard
                            key={e.id}
                            e={e}
                            onEdit={(ev)=>navigate(`/events/${ev.id}/edit`)}
                            onDelete={onDelete}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}
