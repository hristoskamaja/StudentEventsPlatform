import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import client from "../../axios/client";

export default function TicketPage() {
    const { registrationId } = useParams();
    const [ticket, setTicket] = useState(null);

    useEffect(() => {
        client.get(`/api/tickets/${registrationId}`)
            .then(res => setTicket(res.data))
            .catch(() => alert("Не може да се вчита билет"));
    }, [registrationId]);

    if (!ticket) return <p>Вчитувам билет…</p>;

    return (
        <div style={{ maxWidth: 420, margin: "40px auto", textAlign: "center" }}>
            <h2>Билет</h2>

            <p><b>Настан:</b> {ticket.eventTitle}</p>
            <p><b>Корисник:</b> {ticket.username}</p>

            <div style={{ background: "white", padding: 16, marginTop: 20 }}>
                <QRCode value={ticket.qrValue} size={220} />
            </div>
        </div>
    );
}
