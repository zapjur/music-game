import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function Game() {
    const [track, setTrack] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [scannerReady, setScannerReady] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const trackFromUrl = params.get("track");
        if (trackFromUrl) setTrack(trackFromUrl);
    }, []);

    useEffect(() => {
        const refresh = localStorage.getItem("refresh_token");
        if (!refresh) {
            window.location.href = "/login";
            return;
        }

        const setup = async () => {
            const res = await fetch(`https://jurson-server.onrender.com/refresh?refresh_token=${refresh}`);
            const data = await res.json();
            setAccessToken(data.access_token);
        };

        setup();
    }, []);

    useEffect(() => {
        if (!scannerReady) return;

        const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
        scanner.render(
            (decodedText: string) => {
                scanner.clear().then(() => {
                    const url = new URL(decodedText);
                    const scannedTrack = new URLSearchParams(url.search).get("track");
                    if (scannedTrack) {
                        setTrack(scannedTrack);
                        setScanning(false);
                        history.replaceState(null, "", `?track=${scannedTrack}`);
                    }
                });
            },
            () => {}
        );

        return () => {
            scanner.clear().catch(() => {});
        };
    }, [scannerReady]);

    const startScan = () => {
        setScanning(true);
        setTimeout(() => setScannerReady(true), 100);
    };

    const handlePlay = async () => {
        if (!accessToken || !track) return;

        await fetch(`https://jurson-server.onrender.com/play`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                access_token: accessToken,
                track_id: track.replace("spotify:track:", ""),
            }),
        });

    };

    const handlePause = async () => {
        if (!accessToken) return;

        await fetch(`https://api.spotify.com/v1/me/player/pause`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

    };

    const handleResume = async () => {
        if (!accessToken) return;

        await fetch(`https://api.spotify.com/v1/me/player/play`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

    };

    const buttonStyle = {
        padding: "1rem 2rem",
        fontSize: "1rem",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
    };

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h1>🎧 DJ Bobson Zapałka</h1>

            {scanning && <div id="qr-reader" style={{ width: "100%" }}></div>}

            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
                <button
                    onClick={handlePlay}
                    style={{ ...buttonStyle, backgroundColor: "#22c55e", color: "white" }}
                >
                    ▶️ Play
                </button>

                <button
                    onClick={handlePause}
                    style={{ ...buttonStyle, backgroundColor: "#f97316", color: "white" }}
                >
                    ⏸️ Pause
                </button>

                <button
                    onClick={handleResume}
                    style={{ ...buttonStyle, backgroundColor: "#4f46e5", color: "white" }}
                >
                    ⏯️ Resume
                </button>

                <button
                    onClick={startScan}
                    style={{ ...buttonStyle, backgroundColor: "#3b82f6", color: "white" }}
                >
                    🔄 Scan QR
                </button>
            </div>

            {track && (
                <p style={{ marginTop: "1rem" }}>
                    📡 Wczytano utwór. Gotowy do odtwarzania.
                </p>
            )}
        </div>
    );
}
