import {useEffect, useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {EventsRepo} from "../../repository/eventsRepository.js";
import EventCard from "../components/EventCard.jsx";
import EventsCalendar from "../components/EventsCalendar.jsx";

export default function HomePage() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        EventsRepo.list().then(setEvents).catch(() => {
        });
    }, []);

    const featured = useMemo(() => {
        const now = new Date();

        const activeEvents = (events || [])
            .filter((e) => {
                const end = e?.endTime ? new Date(e.endTime) : null;
                return !end || end >= now;
            })
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        return activeEvents.slice(0, 8);
    }, [events]);

    return (
        <div>
            {/* HERO */}
            <div className="hero-wrap">
                <section className="hero">
                    <div className="container">
                        <div className="home-row">
                            <div className="hero__copy card">
                                <h1>
                                    Биди дел од <span className="grad">студентските настани</span>
                                </h1>
                                <p className="muted">
                                    Работилници, хакатони, конференции, забава и друго — придружи се на твојот следен
                                    настан.
                                </p>
                                <div className="hero__cta">
                                    <Link to="/events" className="btn primary">Види ги сите</Link>
                                    <Link to="/me/registrations" className="btn">Мои Пријави</Link>
                                </div>
                            </div>

                            <div className="calendar-card">
                                <EventsCalendar/>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* FEATURED EVENTS */}
            <section className="container">
                <h2 className="section__title">Активни Настани</h2>

                {featured.length === 0 ? (
                    <p className="muted">Нема активни настани</p>
                ) : (
                    <ul className="grid">
                        {featured.map((e) => (
                            <EventCard key={e.id} e={e}/>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
