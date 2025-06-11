import { useEffect } from "react";

export default function Login() {
    const clientId = "25eea8a6e3bc40b4b0690602a17108a0";
    const redirectUri = "https://jurson.onrender.com/callback";
    const scope = "streaming user-read-email user-read-private user-modify-playback-state";

    const loginUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

    useEffect(() => {
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        document.body.style.overflow = "hidden";
        document.documentElement.style.height = "100%";
    }, []);

    return (
        <div style={{
            height: "100vh",
            width: "100vw",
            backgroundColor: "#121212",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "'Inter', sans-serif",
        }}>
            <a
                href={loginUrl}
                style={{
                    padding: "16px 32px",
                    backgroundColor: "#1DB954",
                    color: "#121212",
                    textDecoration: "none",
                    borderRadius: "9999px",
                    fontWeight: "600",
                    fontSize: "18px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1ed760")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1DB954")}
            >
                oj cweliczku dawaj passy do spoti faja 💅
            </a>
        </div>
    );
}
