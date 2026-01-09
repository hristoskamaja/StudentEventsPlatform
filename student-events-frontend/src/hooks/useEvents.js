import {useEffect, useState} from "react";
import {EventsRepo} from "../repository/eventsRepository";


export function useEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    async function refresh() {
        setLoading(true);
        try {
            const data = await EventsRepo.list();
            setEvents(data);
            setError(null);
        } catch (e) {
            setError(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        refresh();
    }, []);


    return {events, loading, error, refresh, setEvents};
}