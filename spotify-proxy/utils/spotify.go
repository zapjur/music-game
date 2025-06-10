package utils

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"os"
	"strings"
)

type SpotifyTokenResponse struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token,omitempty"`
}

func ExchangeCodeForToken(code string) (*SpotifyTokenResponse, error) {
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("redirect_uri", os.Getenv("REDIRECT_URI"))
	data.Set("client_id", os.Getenv("CLIENT_ID"))
	data.Set("client_secret", os.Getenv("CLIENT_SECRET"))

	return postTokenRequest(data)
}

func RefreshAccessToken(refresh string) (*SpotifyTokenResponse, error) {
	data := url.Values{}
	data.Set("grant_type", "refresh_token")
	data.Set("refresh_token", refresh)
	data.Set("client_id", os.Getenv("CLIENT_ID"))
	data.Set("client_secret", os.Getenv("CLIENT_SECRET"))

	return postTokenRequest(data)
}

func postTokenRequest(data url.Values) (*SpotifyTokenResponse, error) {
	req, _ := http.NewRequest("POST", "https://accounts.spotify.com/api/token", strings.NewReader(data.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != 200 {
		return nil, errors.New("token request failed")
	}
	defer resp.Body.Close()

	var tokenResp SpotifyTokenResponse
	err = json.NewDecoder(resp.Body).Decode(&tokenResp)
	return &tokenResp, err
}
