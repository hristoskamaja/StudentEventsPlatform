import { useEffect, useState } from "react";

const CATEGORIES = ["ACADEMIC", "COMMUNITY", "HACKATHON", "WORKSHOP", "OTHER"];

function toLocalInput(value) {
    if (!value) return "";
    if (typeof value === "number") {
        const d = new Date(value);
        return d.toISOString().slice(0, 16);
    }
    if (typeof value === "string") {
        let s = value.trim();
        if (s.includes(" ") && !s.includes("T")) s = s.replace(" ", "T");
        if (s.includes("T")) return s.slice(0, 16);
        const d = new Date(s);
        if (!isNaN(d)) return d.toISOString().slice(0, 16);
    }
    return "";
}

export default function EventForm({ initial, onSubmit, submitText = "Save" }) {
    const [form, setForm] = useState({
        title: "",
        category: "OTHER",
        location: "",
        startTime: "",
        endTime: "",
        description: "",
        maxCapacity: 50,
        imageUrl: "",
        paid: false,
        price: "",
    });

    useEffect(() => {
        if (!initial) return;

        const priceVal = initial.price ?? null;
        setForm({
            title: initial.title ?? "",
            category: initial.category ?? "OTHER",
            location: initial.location ?? "",
            startTime: toLocalInput(initial.startTime),
            endTime: toLocalInput(initial.endTime),
            description: initial.description ?? "",
            maxCapacity:
                typeof initial.maxCapacity === "number"
                    ? initial.maxCapacity
                    : parseInt(initial.maxCapacity || "50", 10),
            imageUrl: initial.imageUrl ?? "",
            paid: priceVal != null && Number(priceVal) > 0,
            price: priceVal != null ? String(priceVal) : "",
        });
    }, [initial]);

    function change(e) {
        const { name, value, type, checked } = e.target;

        setForm((f) => {
            if (type === "checkbox") return { ...f, [name]: checked };

            if (name === "maxCapacity") {
                return { ...f, maxCapacity: value === "" ? "" : parseInt(value || "0", 10) };
            }

            if (name === "price") return { ...f, price: value };

            return { ...f, [name]: value };
        });
    }

    function submit(e) {
        e.preventDefault();

        if (!form.title?.trim()) return alert("Title is required");
        if (!form.category) return alert("Category is required");
        if (!form.startTime) return alert("Start time is required");
        if (!form.endTime) return alert("End time is required");
        if (form.endTime < form.startTime) return alert("End time must be after start time");
        if (!form.location?.trim()) return alert("Location is required");
        if (!form.maxCapacity || form.maxCapacity < 1) return alert("Capacity must be >= 1");

        let price = null;
        if (form.paid) {
            const num = Number(form.price);
            if (!form.price || isNaN(num) || num <= 0) return alert("Внеси валидна цена (> 0)");
            price = num;
        }

        const payload = {
            title: form.title.trim(),
            category: form.category,
            location: form.location.trim(),
            startTime: form.startTime,
            endTime: form.endTime,
            description: form.description?.trim() ?? "",
            maxCapacity: Number(form.maxCapacity),
            imageUrl: form.imageUrl?.trim() || undefined,
            price: price,
        };

        onSubmit?.(payload);
    }

    return (
        <form onSubmit={submit} className="card" style={{ padding: 16, display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                    <label>Title</label>
                    <input className="input" name="title" value={form.title} onChange={change} required />
                </div>

                <div>
                    <label>Location</label>
                    <input className="input" name="location" value={form.location} onChange={change} required />
                </div>

                <div>
                    <label>Category</label>
                    <select className="select" name="category" value={form.category} onChange={change} required>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Max capacity</label>
                    <input className="input" type="number" min={1} name="maxCapacity" value={form.maxCapacity} onChange={change} required />
                </div>

                <div>
                    <label>Start time</label>
                    <input className="input" type="datetime-local" name="startTime" value={form.startTime} onChange={change} required />
                </div>

                <div>
                    <label>End time</label>
                    <input className="input" type="datetime-local" name="endTime" value={form.endTime} onChange={change} required />
                </div>
            </div>

            <div className="card" style={{ padding: 12, display: "grid", gap: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input type="checkbox" name="paid" checked={form.paid} onChange={change} />
                    Настанот е со плаќање
                </label>

                {form.paid && (
                    <div style={{ maxWidth: 260 }}>
                        <label>Цена (денари)</label>
                        <input
                            className="input"
                            type="number"
                            min="0.01"
                            step="0.01"
                            name="price"
                            value={form.price}
                            onChange={change}
                            placeholder="пример: 100"
                        />
                    </div>
                )}
            </div>

            <div>
                <label>Description</label>
                <textarea className="input" rows={5} name="description" value={form.description} onChange={change} />
            </div>

            <div>
                <label>Image URL (optional)</label>
                <input className="input" name="imageUrl" value={form.imageUrl} onChange={change} />
            </div>

            <div>
                <button className="btn" type="submit">{submitText}</button>
            </div>
        </form>
    );
}
