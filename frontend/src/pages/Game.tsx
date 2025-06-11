import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Button,
    StyleSheet,
    Alert,
} from "react-native";
import { useSearchParams } from "expo-router";

const BACKEND_URL = "https://jurson-server.onrender.com";

export default function GameScreen() {
    const params = useSearchParams();
    const [accessToken, setAccessToken] = useState(params.access_token || "");
    const [trackId, setTrackId] = useState(params.track_id || "7G4wYMAA1C4sgjfUqDiPLf");

    useEffect(() => {
        if (!accessToken) {
            Alert.alert("Brak tokenu", "Access token jest wymagany");
        }
    }, [accessToken]);

    const callAction = async (action: "play" | "pause" | "resume") => {
        try {
            const response = await fetch(`${BACKEND_URL}/${action}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(
                    action === "play" ? { track_id: trackId } : {}
                ),
            });

            const text = await response.text();
            console.log(`${action.toUpperCase()} ➜`, text);

            if (!response.ok) {
                throw new Error(text);
            }
        } catch (err: any) {
            Alert.alert("Błąd", err.message || "Nie udało się wykonać akcji.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sterowanie Spotify</Text>
            <View style={styles.button}>
                <Button title="▶️ Play" color="#4CAF50" onPress={() => callAction("play")} />
            </View>
            <View style={styles.button}>
                <Button title="⏸️ Pause" color="#F44336" onPress={() => callAction("pause")} />
            </View>
            <View style={styles.button}>
                <Button title="⏵ Resume" color="#2196F3" onPress={() => callAction("resume")} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    button: {
        marginVertical: 10,
        width: 200,
    },
});
