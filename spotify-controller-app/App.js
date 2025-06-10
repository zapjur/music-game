import React from 'react';
import { SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  return (
      <SafeAreaView style={{ flex: 1 }}>
        <WebView
            source={{ uri: 'https://jurson.onrender.com' }}
            originWhitelist={['*']}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsFullscreenVideo={true}
        />
      </SafeAreaView>
  );
}
