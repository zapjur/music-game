package handlers

import (
	"io"
	"net/http"
)

func HandleResume(w http.ResponseWriter, r *http.Request) {
	req, err := http.NewRequest("PUT", "https://api.spotify.com/v1/me/player/play", nil)
	if err != nil {
		http.Error(w, "Failed to create request", 500)
		return
	}

	token := r.Header.Get("Authorization")
	if token == "" {
		http.Error(w, "No token", 400)
		return
	}

	req.Header.Set("Authorization", token)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Spotify resume failed", 500)
		return
	}
	defer resp.Body.Close()

	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}
