import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function Pilot() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id");

    const [status, setStatus] = useState<string | null>(null);
    const [scannerActive, setScannerActive] = useState(true);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const lastTrackIdRef = useRef<string | null>(null);

    const handleAction = async (action: "play" | "pause" | "resume", trackId?: string) => {
        if (!sessionId) {
            setStatus("Brak session_id w URL");
            return;
        }

        try {
            const res = await fetch("https://jurson-server.onrender.com/session-command", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    action,
                    ...(action === "play" && trackId ? { track_id: trackId } : {}),
                }),
            });

            const text = await res.text();
            setStatus(`${action.toUpperCase()}: ${res.status} - ${text}`);
        } catch (err) {
            console.error(err);
            setStatus("Wystąpił błąd przy wysyłaniu komendy.");
        }
    };

    const startScanner = () => {
        if (scannerRef.current) return;

        const scanner = new Html5QrcodeScanner("qr-reader", {
            fps: 10,
            qrbox: 250,
        }, false);

        scanner.render(
            async (decodedText) => {
                console.log("Zeskanowano:", decodedText);
                await scanner.clear();
                scannerRef.current = null;
                setScannerActive(false);

                const trackId = decodedText.trim();
                if (/^[a-zA-Z0-9]{22}$/.test(trackId)) {
                    lastTrackIdRef.current = trackId;
                    handleAction("play", trackId);
                } else {
                    setStatus("Nieprawidłowy track ID");
                }
            },
            (error) => {
                console.log("Błąd skanowania:", error);
            }
        );

        scannerRef.current = scanner;
    };

    useEffect(() => {
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        document.body.style.backgroundColor = "#121212";
        document.body.style.color = "#fff";
        document.body.style.fontFamily = "'Inter', sans-serif";

        if (scannerActive) {
            startScanner();
        }

        return () => {
            scannerRef.current?.clear().catch((err) => console.error("Błąd przy czyszczeniu skanera:", err));
        };
    }, [scannerActive]);

    return (
        <div style={{
            minHeight: "100vh",
            padding: "20px",
            backgroundColor: "#121212",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center"
        }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "16px" }}>📱 Zdalny cwel</h1>
            <p>Sesja: <strong>{sessionId || "brak"}</strong></p>

            <div style={{ display: "flex", gap: "16px", marginTop: "24px", flexWrap: "wrap", justifyContent: "center" }}>
                <button style={buttonStyle} onClick={() => {
                    if (lastTrackIdRef.current) {
                        handleAction("play", lastTrackIdRef.current ?? undefined);
                    } else {
                        setStatus("Nie zeskanowano jeszcze żadnego tracka");
                    }
                }}>
                    Play (ostatni)
                </button>
                <button style={buttonStyle} onClick={() => handleAction("pause")}>Pause</button>
                <button style={buttonStyle} onClick={() => handleAction("resume")}>Resume</button>
            </div>

            {scannerActive && (
                <div id="qr-reader" style={{ width: 300, marginTop: "40px" }} />
            )}

            {!scannerActive && (
                <button style={{ ...buttonStyle, marginTop: "24px" }} onClick={() => setScannerActive(true)}>
                    Zeskanuj ponownie
                </button>
            )}

            {status && (
                <div style={{ marginTop: "24px", maxWidth: "90%", wordBreak: "break-word" }}>
                    <strong>Status:</strong> {status}
                </div>
            )}
        </div>
    );
}

const buttonStyle: React.CSSProperties = {
    backgroundColor: "#1DB954",
    color: "#121212",
    border: "none",
    borderRadius: "9999px",
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
    transition: "background-color 0.3s ease",
};
