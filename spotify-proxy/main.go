package main

import (
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"spotify-proxy/handlers"
)

func main() {
	_ = godotenv.Load()

	http.HandleFunc("/callback", handlers.HandleCallback)
	http.HandleFunc("/refresh", handlers.HandleRefresh)
	http.HandleFunc("/play", handlers.HandlePlay)
	http.HandleFunc("/devices", handlers.HandleDevices)
	http.HandleFunc("/resume", handlers.HandleResume)
	http.HandleFunc("/pause", handlers.HandlePause)
	http.HandleFunc("/create-session", handlers.HandleCreateSession)
	http.HandleFunc("/session-command", handlers.HandleSessionCommand)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("Server running on port", port)
	log.Fatal(http.ListenAndServe(":"+port, withCORS(http.DefaultServeMux)))
}
func withCORS(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "https://jurson.onrender.com")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		h.ServeHTTP(w, r)
	})
}
