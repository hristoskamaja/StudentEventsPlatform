import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PaymentsRepo from "../../repository/paymentsRepository";

export default function PaymentSuccessPage() {
    const [params] = useSearchParams();
    const sessionId = params.get("session_id");

    const [loading, setLoading] = useState(true);
    const [ok, setOk] = useState(false);
    const [err, setErr] = useState(null);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                if (!sessionId) throw new Error("Нема session_id во URL");
                await PaymentsRepo.confirm(sessionId);
                if (!alive) return;
                setOk(true);
            } catch (e) {
                if (!alive) return;
                setErr(e?.response?.data?.message || e.message || "Грешка");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        })();

        return () => { alive = false; };
    }, [sessionId]);

    if (loading) return <div className="container"><p>Потврдување</p></div>;

    return (
        <div className="container">
            <div className="card pad">
                {ok ? (
                    <>
                        <h2>Плаќањето е успешно</h2>
                    </>
                ) : (
                    <>
                        <h2 style={{ color: "crimson" }}>Неуспешно плаќање</h2>
                        <p>{err}</p>
                    </>
                )}
            </div>
        </div>
    );
}
