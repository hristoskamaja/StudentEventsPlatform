const API = "http://localhost:8080/api/reviews";

async function readError(r) {
    const text = await r.text().catch(() => "");
    try {
        const j = JSON.parse(text);
        return j?.error || j?.message || text || `HTTP ${r.status}`;
    } catch {
        return text || `HTTP ${r.status}`;
    }
}

const ReviewsRepo = {
    forEvent: async (eventId) => {
        const r = await fetch(`${API}/${eventId}`);
        if (!r.ok) throw new Error(await readError(r));
        return r.json();
    },

    averageForEvent: async (eventId) => {
        const r = await fetch(`${API}/${eventId}/average`);
        if (!r.ok) throw new Error(await readError(r));
        return r.json();
    },

    mineForEvent: async (eventId, token) => {
        const r = await fetch(`${API}/${eventId}/mine`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (r.status === 204) return null;
        if (!r.ok) throw new Error(await readError(r));
        return r.json();
    },

    add: async (eventId, { rating, comment }, token) => {
        const url =
            `${API}/${eventId}?rating=${encodeURIComponent(rating)}` +
            `&comment=${encodeURIComponent(comment || "")}`;

        const r = await fetch(url, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (r.status === 409) throw new Error(await readError(r));
        if (!r.ok) throw new Error(await readError(r));
        return r.json();
    },
};

export default ReviewsRepo;
