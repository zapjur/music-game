package handlers

import (
	"encoding/json"
	"net/http"
	"spotify-proxy/utils"
)

func HandleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	tokenResp, err := utils.ExchangeCodeForToken(code)
	if err != nil {
		http.Error(w, "Token exchange failed", 500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tokenResp)
}
