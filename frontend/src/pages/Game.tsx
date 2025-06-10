import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
/// <reference types="spotify-web-playback-sdk" />

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady: () => void;
        Spotify: typeof Spotify;
    }
}

export default function Game() {
    const [track, setTrack] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [scannerReady, setScannerReady] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [deviceId, setDeviceId] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const trackFromUrl = params.get("track");
        if (trackFromUrl) {
            setTrack(trackFromUrl);
        }
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
            const token = data.access_token;
            setAccessToken(token);

            const script = document.createElement("script");
            script.src = "https://sdk.scdn.co/spotify-player.js";
            script.async = true;
            document.body.appendChild(script);

            window.onSpotifyWebPlaybackSDKReady = () => {
                const player = new window.Spotify.Player({
                    name: "JursonPlayer",
                    getOAuthToken: (cb: (token: string) => void) => cb(token),
                    volume: 0.5,
                });

                player.addListener("ready", ({ device_id }: { device_id: string }) => {
                    setDeviceId(device_id);
                });

                player.connect();
            };
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
        if (!accessToken || !track || !deviceId) return;

        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ uris: [track] }),
        });
    };

    const handlePause = async () => {
        if (!accessToken || !deviceId) return;

        await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    };

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h1>🎧 DJ Bobson Zapałka</h1>

            {scanning && <div id="qr-reader" style={{ width: "100%" }}></div>}

            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
                <button onClick={handlePlay} style={{ padding: "1rem 2rem" }}>▶️ Play</button>
                <button onClick={handlePause} style={{ padding: "1rem 2rem" }}>⏸️ Pause</button>
                <button onClick={startScan} style={{ padding: "1rem 2rem" }}>🔄 Scan QR</button>
            </div>

            {track && (
                <p style={{ marginTop: "1rem" }}>
                    🎵 Wczytano utwór: <code>{track}</code>
                </p>
            )}
        </div>
    );
}
