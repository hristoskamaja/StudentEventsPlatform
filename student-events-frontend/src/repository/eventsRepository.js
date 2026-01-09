import client from "../axios/client";

const EventsRepo = {
    list:   () => client.get("/api/events").then(r => r.data),
    getAll: () => client.get("/api/events").then(r => r.data),
    getById: (id) => client.get(`/api/events/${id}`).then(r => r.data),
    create: (payload) => client.post("/api/events/create", payload).then(r => r.data),
    update: (id, payload) => client.put(`/api/events/update/${id}`, payload).then(r => r.data),
    remove: (id) => client.delete(`/api/events/delete/${id}`).then(r => r.data),
};

export default EventsRepo;
export { EventsRepo };
