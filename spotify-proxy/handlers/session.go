package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"math/rand"
	"net/http"
	"sync"
)

type Session struct {
	AccessToken string
	TrackID     string
}

var (
	sessions   = make(map[string]*Session)
	sessionMux sync.RWMutex
)

func generateSessionID() string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 6)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

func HandleCreateSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
		return
	}

	var payload struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	id := generateSessionID()

	sessionMux.Lock()
	sessions[id] = &Session{AccessToken: payload.AccessToken}
	sessionMux.Unlock()

	log.Println("New session created:", id)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"session_id": id})
}

func HandleSessionCommand(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
		return
	}

	var payload struct {
		SessionID string `json:"session_id"`
		Action    string `json:"action"`
		TrackID   string `json:"track_id,omitempty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	sessionMux.RLock()
	session, exists := sessions[payload.SessionID]
	sessionMux.RUnlock()

	if !exists {
		http.Error(w, "Session not found", http.StatusNotFound)
		return
	}

	var endpoint string
	var req *http.Request

	switch payload.Action {
	case "play":
		endpoint = "https://api.spotify.com/v1/me/player/play"
		body := map[string]interface{}{
			"uris": []string{"spotify:track:" + payload.TrackID},
		}
		jsonBody, _ := json.Marshal(body)
		req, _ = http.NewRequest("PUT", endpoint, bytes.NewReader(jsonBody))
		req.Header.Set("Content-Type", "application/json")

	case "pause":
		endpoint = "https://api.spotify.com/v1/me/player/pause"
		req, _ = http.NewRequest("PUT", endpoint, nil)

	case "resume":
		endpoint = "https://api.spotify.com/v1/me/player/play"
		req, _ = http.NewRequest("PUT", endpoint, nil)

	default:
		http.Error(w, "Invalid action", http.StatusBadRequest)
		return
	}

	req.Header.Set("Authorization", "Bearer "+session.AccessToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error forwarding to Spotify: %v", err)
		http.Error(w, "Failed to forward request to Spotify", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}
