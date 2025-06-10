/// <reference types="spotify-web-playback-sdk" />
import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady: () => void;
        Spotify: typeof Spotify;
    }
}

export default function Game() {
    const [track, setTrack] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const trackFromUrl = params.get("track");
        if (trackFromUrl) {
            setTrack(trackFromUrl);
        }
    }, []);

    useEffect(() => {
        if (!track) return;

        const refresh = localStorage.getItem("refresh_token");
        if (!refresh) {
            window.location.href = "/login";
            return;
        }

        const loadPlayer = async () => {
            const res = await fetch(`https://your-backend.onrender.com/refresh?refresh_token=${refresh}`);
            const data = await res.json();
            const token = data.access_token;

            const script = document.createElement("script");
            script.src = "https://sdk.scdn.co/spotify-player.js";
            script.async = true;
            document.body.appendChild(script);

            window.onSpotifyWebPlaybackSDKReady = () => {
                const player = new window.Spotify.Player({
                    name: "HisterPlayer",
                    getOAuthToken: (cb: (token: string) => void) => cb(token),
                    volume: 0.5,
                });

                player.connect();

                player.addListener("ready", ({ device_id }: { device_id: string }) => {
                    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
                        method: "PUT",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ uris: [track] }),
                    });
                });
            };
        };

        loadPlayer();
    }, [track]);

    const startScan = () => {
        setScanning(true);

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
    };

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h1>🎧 Hister: Muzyczna runda</h1>

            {!track && !scanning && (
                <button onClick={startScan} style={{ padding: "1rem 2rem", fontSize: "1.2rem" }}>
                    📷 Zeskanuj kod QR
                </button>
            )}

            {scanning && <div id="qr-reader" style={{ width: "100%" }}></div>}

            {track && <p>🎵 Odtwarzanie w tle…</p>}
        </div>
    );
}
