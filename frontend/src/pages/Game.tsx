import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Game() {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    useEffect(() => {
        if (!accessToken || !refreshToken) {
            navigate("/login");
        }
    }, [accessToken, refreshToken]);

    return (
        <div style={{ textAlign: "center", marginTop: 50 }}>
            <h1>🎵 Sterowanie Spotify</h1>
            <button onClick={() => handleAction("play")}>▶️ Play</button>
            <button onClick={() => handleAction("pause")}>⏸️ Pause</button>
            <button onClick={() => handleAction("resume")}>⏵ Resume</button>
        </div>
    );

    async function handleAction(action: "play" | "pause" | "resume") {
        try {
            const res = await fetch(`https://jurson-server.onrender.com/${action}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    access_token: accessToken,
                    ...(action === "play" ? { track_id: "7G4wYMAA1C4sgjfUqDiPLf" } : {}),
                }),
            });

            const text = await res.text();
            console.log(`${action.toUpperCase()} ➜`, text);
        } catch (err) {
            console.error(err);
        }
    }
}
