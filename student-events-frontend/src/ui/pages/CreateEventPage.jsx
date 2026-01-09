import { useNavigate, Link } from "react-router-dom";
import EventForm from "../components/EventForm";
import EventsRepo from "../../repository/eventsRepository";

export default function CreateEventPage() {
    const navigate = useNavigate();

    async function onSubmit(payload) {
        try {
            const created = await EventsRepo.create(payload);
            alert("Настанот е креиран ✔");
            navigate(`/events/${created.id}`, { replace: true });
        } catch (e) {
            alert(e?.response?.data?.error || e.message);
        }
    }

    return (
        <div className="container">
            <div className="toolbar">
                <h1 className="title">Нов настан</h1>
                <div className="tools"><Link className="btn" to="/events">Назад</Link></div>
            </div>
            <div className="card pad">
                <EventForm submitText="Креирај" onSubmit={onSubmit}/>
            </div>
        </div>
    );
}
