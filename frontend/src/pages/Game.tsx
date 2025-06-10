import { useEffect } from "react"

export default function Game() {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const track = params.get("track")
        const refresh = localStorage.getItem("refresh_token")

        const getAccessToken = async () => {
            if (!refresh) {
                window.location.href = "/login"
                return
            }

            const res = await fetch(`https://your-backend.onrender.com/refresh?refresh_token=${refresh}`)
            const data = await res.json()
            const token = data.access_token

            window.onSpotifyWebPlaybackSDKReady = () => {
                const player = new Spotify.Player({
                    name: "HisterPlayer",
                    getOAuthToken: cb => cb(token),
                })

                player.connect()

                player.addListener("ready", ({ device_id }) => {
                    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
                        method: "PUT",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ uris: [track!] })
                    })
                })
            }
        }

        getAccessToken()
    }, [])

    return <div>🎵 Odtwarzanie w tle...</div>
}
