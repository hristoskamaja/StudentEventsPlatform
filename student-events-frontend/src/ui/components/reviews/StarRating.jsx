import "./starRating.css";
import { useState } from "react";

export default function StarRating({ value = 0, onChange, disabled = false }) {
    const [hover, setHover] = useState(0);

    const shown = hover || value;

    return (
        <div
            className={`star-rating ${disabled ? "disabled" : ""}`}
            onMouseLeave={() => setHover(0)}
            role="radiogroup"
            aria-label="Rating"
        >
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    className={`star ${n <= shown ? "on" : "off"}`}
                    onMouseEnter={() => !disabled && setHover(n)}
                    onClick={() => !disabled && onChange?.(n)}
                    disabled={disabled}
                    aria-label={`${n} stars`}
                >
                    ★
                </button>
            ))}
        </div>
    );
}
