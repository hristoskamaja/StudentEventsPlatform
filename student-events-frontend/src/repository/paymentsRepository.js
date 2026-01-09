import client from "../axios/client";

const PaymentsRepo = {
    checkout: (eventId) =>
        client.post(`/api/payments/checkout/${eventId}`).then((r) => r.data),

    confirm: (sessionId) =>
        client.post(`/api/payments/confirm`, null, {
            params: { session_id: sessionId },
        }).then((r) => r.data),
};

export default PaymentsRepo;
export { PaymentsRepo };
