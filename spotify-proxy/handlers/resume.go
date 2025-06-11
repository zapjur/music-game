package handlers

import (
	"encoding/json"
	"io"
	"net/http"
)

type ResumeRequest struct {
	AccessToken string `json:"access_token"`
}

func HandleResume(w http.ResponseWriter, r *http.Request) {
	var reqBody ResumeRequest
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if reqBody.AccessToken == "" {
		http.Error(w, "Missing access token", http.StatusBadRequest)
		return
	}

	req, err := http.NewRequest("PUT", "https://api.spotify.com/v1/me/player/play", nil)
	if err != nil {
		http.Error(w, "Failed to create request", http.StatusInternalServerError)
		return
	}

	req.Header.Set("Authorization", "Bearer "+reqBody.AccessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		http.Error(w, "Spotify resume failed", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}
