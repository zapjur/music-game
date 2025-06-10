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

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("Server running on port", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
