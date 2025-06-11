import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Game() {
    const navigate = useNavigate();

    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

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
