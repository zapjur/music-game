package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
)

type PlayRequest struct {
	AccessToken string `json:"access_token"`
	TrackID     string `json:"track_id"`
}

func HandlePlay(w http.ResponseWriter, r *http.Request) {
	var body PlayRequest
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	requestBody := map[string]interface{}{
		"uris": []string{"spotify:track:" + body.TrackID},
	}
	jsonData, _ := json.Marshal(requestBody)

	req, _ := http.NewRequest("PUT", "https://api.spotify.com/v1/me/player/play", bytes.NewBuffer(jsonData))
	req.Header.Set("Authorization", "Bearer "+body.AccessToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode >= 400 {
		http.Error(w, "Spotify playback failed", resp.StatusCode)
		return
	}

	w.WriteHeader(http.StatusOK)
}
