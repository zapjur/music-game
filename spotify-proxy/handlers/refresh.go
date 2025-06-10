package handlers

import (
	"encoding/json"
	"net/http"
	"spotify-proxy/utils"
)

func HandleRefresh(w http.ResponseWriter, r *http.Request) {
	refresh := r.URL.Query().Get("refresh_token")
	tokenResp, err := utils.RefreshAccessToken(refresh)
	if err != nil {
		http.Error(w, "Refresh failed", 500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tokenResp)
}
