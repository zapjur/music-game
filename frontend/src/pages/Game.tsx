import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Game() {
    const navigate = useNavigate();

    let accessToken = localStorage.getItem("access_token");
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

    async function refreshAccessToken(): Promise<string | null> {
        if (!refreshToken) return null;

        try {
            const res = await fetch(`https://jurson-server.onrender.com/refresh?refresh_token=${refreshToken}`);
            if (!res.ok) return null;

            const data = await res.json();
            if (data.access_token) {
                localStorage.setItem("access_token", data.access_token);
                return data.access_token;
            }

            return null;
        } catch (err) {
            console.error("Error refreshing token", err);
            return null;
        }
    }

    async function handleAction(action: "play" | "pause" | "resume") {
        try {
            let token = accessToken;

            const performRequest = async (tokenToUse: string) => {
                return fetch(`https://jurson-server.onrender.com/${action}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${tokenToUse}`, // poprawka
                    },
                    body: JSON.stringify(
                        action === "play" ? { track_id: "7G4wYMAA1C4sgjfUqDiPLf" } : {}
                    ),
                });
            };

            let res = await performRequest(token!);

            if (res.status === 401) {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    token = newToken;
                    res = await performRequest(newToken);
                } else {
                    console.warn("Brak możliwości odświeżenia tokena. Przekierowuję na login.");
                    navigate("/login");
                    return;
                }
            }

            const text = await res.text();
            console.log(`${action.toUpperCase()} ➜`, text);
        } catch (err) {
            console.error("Request failed:", err);
        }
    }
}
