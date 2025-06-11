import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";

export default function Pilot() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id");

    const [status, setStatus] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
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

    const startScan = async () => {
        setStatus(null);
        setScanning(true);
        const qrRegionId = "qr-reader";

        const scanner = new Html5Qrcode(qrRegionId);
        scannerRef.current = scanner;

        try {
            await scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: 250 },
                (decodedText) => {
                    console.log("Zeskanowano:", decodedText);
                    scanner.stop().then(() => {
                        document.getElementById(qrRegionId)?.innerHTML = "";
                        setScanning(false);
                    });

                    const trackId = decodedText.trim();
                    if (/^[a-zA-Z0-9]{22}$/.test(trackId)) {
                        lastTrackIdRef.current = trackId;
                        handleAction("play", trackId);
                    } else {
                        setStatus("Nieprawidłowy track ID");
                    }
                },
                (errorMessage) => {
                    console.log("Skanowanie:", errorMessage);
                }
            );
        } catch (err) {
            console.error("Błąd uruchamiania skanera:", err);
            setStatus("Nie udało się uruchomić skanera.");
            setScanning(false);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: 50 }}>
            <h1>📱 Pilot Spotify</h1>
            <p>Sesja: <strong>{sessionId || "brak"}</strong></p>

            <button onClick={() => handleAction("play", lastTrackIdRef.current ?? undefined)}>
                ▶️ Play (ostatni)
            </button>
            <button onClick={() => handleAction("pause")}>⏸️ Pause</button>
            <button onClick={() => handleAction("resume")}>⏵ Resume</button>

            <div style={{ marginTop: 30 }}>
                {!scanning && (
                    <button onClick={startScan}>📷 Zeskanuj kod utworu</button>
                )}
                <div id="qr-reader" style={{ width: 300, margin: "20px auto" }} />
            </div>

            {status && (
                <div style={{ marginTop: 20 }}>
                    <strong>Status:</strong> {status}
                </div>
            )}
        </div>
    );
}
