import { useEffect, useState } from "react";

export default function Game() {
    const [accessToken, setAccessToken] = useState("");
    const [trackId, setTrackId] = useState("7G4wYMAA1C4sgjfUqDiPLf");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("access_token");
        const track = params.get("track_id");

        if (token) setAccessToken(token);
        if (track) setTrackId(track);
    }, []);

    const callAction = async (action: "play" | "pause" | "resume") => {
        try {
            const res = await fetch(`https://jurson-server.onrender.com/${action}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    ...(action === "play" ? { track_id: trackId } : {}),
                }),
            });

            const text = await res.text();
            console.log(`${action.toUpperCase()} ➜`, text);
            if (!res.ok) throw new Error(text);
        } catch (err: any) {
            alert(`Błąd: ${err.message}`);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: 50 }}>
            <h2>Sterowanie Spotify</h2>
            <button style={{ background: "#4CAF50", margin: 10 }} onClick={() => callAction("play")}>
                ▶️ Play
            </button>
            <button style={{ background: "#F44336", margin: 10 }} onClick={() => callAction("pause")}>
                ⏸️ Pause
            </button>
            <button style={{ background: "#2196F3", margin: 10 }} onClick={() => callAction("resume")}>
                ⏵ Resume
            </button>
        </div>
    );
}
