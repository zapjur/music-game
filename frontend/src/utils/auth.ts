export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
        const res = await fetch(`https://jurson-server.onrender.com/refresh?refresh_token=${refreshToken}`);
        if (!res.ok) throw new Error("Failed to refresh");

        const data = await res.json();
        if (data.access_token) {
            localStorage.setItem("access_token", data.access_token);
            return data.access_token;
        }
        return null;
    } catch (err) {
        console.error("Token refresh error:", err);
        return null;
    }
}
