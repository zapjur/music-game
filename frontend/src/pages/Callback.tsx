import { useEffect } from "react"

export default function Callback() {
    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get("code")

        fetch(`https://your-backend.onrender.com/callback?code=${code}`)
            .then(res => res.json())
            .then(data => {
                localStorage.setItem("access_token", data.access_token)
                localStorage.setItem("refresh_token", data.refresh_token)
                window.location.href = "/"
            })
    }, [])

    return <div>Przekierowywanie...</div>
}
