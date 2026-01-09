import client from "../axios/client";


const RegistrationsRepo = {
    mine: () => client.get("/api/registrations/mine").then(r => r.data),
    statusForEvent: (eventId) =>
        client.get(`/api/registrations/by-event/${eventId}/mine`).then(r => r.data),
    create: (eventId) =>
        client.post("/api/registrations", { eventId }).then(r => r.data),
    cancel: (registrationId) =>
        client.delete(`/api/registrations/${registrationId}`).then(r => r.data),
};

export default RegistrationsRepo;
export { RegistrationsRepo };
