import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import ReviewsRepo from "../../../repository/reviewsRepository";
import StarRating from "./StarRating";

export default function ReviewForm({ eventId, onSubmitted }) {
    const { token, authenticated, login } = useAuth();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [busy, setBusy] = useState(false);

    async function submit(e) {
        e.preventDefault();

        if (!authenticated) {
            login();
            return;
        }

        if (!rating) {
            alert("Ве молам избери оцена (1-5).");
            return;
        }

        try {
            setBusy(true);
            await ReviewsRepo.add(eventId, { rating, comment }, token);

            setRating(0);
            setComment("");

            onSubmitted?.();
        } catch (err) {
            alert(err?.message || "Неуспешно поднесување на оценка");
        } finally {
            setBusy(false);
        }
    }

    return (
        <form onSubmit={submit}>
            <div style={{ margin: "8px 0" }}>
                <StarRating value={rating} onChange={setRating} disabled={busy} />
            </div>

            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Напиши коментар"
                rows={3}
                style={{ width: "100%", resize: "vertical" }}
                disabled={busy}
            />

            <button
                className="btn"
                type="submit"
                disabled={busy}
                style={{
                    marginTop: 8,
                    backgroundColor: "#e26d2d",
                    border: "1px solid #e26d2d",
                    color: "#fff",
                }}
            >

            {busy ? "Се праќа" : "Поднеси"}
            </button>
        </form>
    );
}
