export default function Login() {
    const clientId = "25eea8a6e3bc40b4b0690602a17108a0"
    const redirectUri = "https://music-game-frontend.onrender.com/callback"
    const scope = "streaming user-read-email user-read-private user-modify-playback-state"

    const loginUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`

    return <a href={loginUrl}>🔐 Zaloguj się przez Spotify</a>
}
