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
        if (scannerActive) {
            startScanner();
        }

        return () => {
            scannerRef.current?.clear().catch((err) => console.error("Błąd przy czyszczeniu skanera:", err));
        };
    }, [scannerActive]);

    return (
        <div style={{ textAlign: "center", marginTop: 50 }}>
            <h1>📱 Pilot Spotify</h1>
            <p>Sesja: <strong>{sessionId || "brak"}</strong></p>

            <button onClick={() => {
                if (lastTrackIdRef.current) {
                    handleAction("play", lastTrackIdRef.current ?? undefined);
                } else {
                    setStatus("Nie zeskanowano jeszcze żadnego tracka");
                }
            }}>
                ▶️ Play (ostatni)
            </button>
            <button onClick={() => handleAction("pause")}>⏸️ Pause</button>
            <button onClick={() => handleAction("resume")}>⏵ Resume</button>

            {scannerActive && <div id="qr-reader" style={{ width: 300, margin: "40px auto" }} />}

            {!scannerActive && (
                <button style={{ marginTop: 20 }} onClick={() => setScannerActive(true)}>
                    🔄 Zeskanuj ponownie
                </button>
            )}

            {status && (
                <div style={{ marginTop: 20 }}>
                    <strong>Status:</strong> {status}
                </div>
            )}
        </div>
    );
}
