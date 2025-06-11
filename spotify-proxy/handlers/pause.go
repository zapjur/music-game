package handlers

import (
	"encoding/json"
	"io"
	"net/http"
)

type PauseRequest struct {
	AccessToken string `json:"access_token"`
}

func HandlePause(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
		return
	}

	var body PauseRequest
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil || body.AccessToken == "" {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	req, err := http.NewRequest("PUT", "https://api.spotify.com/v1/me/player/pause", nil)
	if err != nil {
		http.Error(w, "Failed to create request", 500)
		return
	}

	req.Header.Set("Authorization", "Bearer "+body.AccessToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode >= 400 {
		http.Error(w, "Spotify pause failed", resp.StatusCode)
		return
	}
	defer resp.Body.Close()

	w.WriteHeader(http.StatusOK)
	io.Copy(w, resp.Body)
}
