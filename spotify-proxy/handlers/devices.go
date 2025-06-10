package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
)

func HandleDevices(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
		return
	}

	type Req struct {
		AccessToken string `json:"access_token"`
	}

	var body Req
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	req, _ := http.NewRequest("GET", "https://api.spotify.com/v1/me/player/devices", nil)
	req.Header.Set("Authorization", "Bearer "+body.AccessToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Device fetch failed", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	data, _ := io.ReadAll(resp.Body)
	log.Println("Devices:", string(data))
	w.Write(data)
}
