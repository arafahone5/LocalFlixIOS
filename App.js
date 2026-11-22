import React, { useRef } from 'react';
import { StyleSheet, View, StatusBar, Linking, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { LOCALFLIX_HTML } from './webUi';

export default function App() {
  const webviewRef = useRef(null);

  function sendToWeb(payload) {
    if (!webviewRef.current) return;
    const js = `window.onNativeMessage(${JSON.stringify(payload)}); true;`;
    webviewRef.current.injectJavaScript(js);
  }

  async function handleWebMessage(event) {
    let msg;
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch (e) {
      return;
    }

    if (msg.type === 'REQUEST_INIT') {
      try {
        const [mRaw, tvRaw, wlRaw, histRaw, detRaw] = await Promise.all([
          AsyncStorage.getItem('movies_cache'),
          AsyncStorage.getItem('tv_cache'),
          AsyncStorage.getItem('watchlist_cache'),
          AsyncStorage.getItem('history_cache'),
          AsyncStorage.getItem('details_cache'),
        ]);
        sendToWeb({
          type: 'INIT_STORAGE',
          movies: mRaw ? JSON.parse(mRaw) : [],
          tv: tvRaw ? JSON.parse(tvRaw) : [],
          watchlist: wlRaw ? JSON.parse(wlRaw) : [],
          history: histRaw ? JSON.parse(histRaw) : [],
          details: detRaw ? JSON.parse(detRaw) : {},
        });
      } catch (e) {
        sendToWeb({
          type: 'INIT_STORAGE',
          movies: [],
          tv: [],
          watchlist: [],
          history: [],
          details: {},
        });
      }
    } else if (msg.type === 'SET_STORAGE') {
      try {
        await AsyncStorage.setItem(msg.key, msg.value);
      } catch (e) {}
    } else if (msg.type === 'FETCH') {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      try {
        const res = await fetch(msg.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
            ...(msg.options?.headers || {}),
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const text = await res.text();
        sendToWeb({ type: 'FETCH_RESULT', id: msg.id, ok: res.ok, status: res.status, text });
      } catch (err) {
        clearTimeout(timeout);
        sendToWeb({ type: 'FETCH_RESULT', id: msg.id, ok: false, error: err.message });
      }
    } else if (msg.type === 'OPEN_VLC') {
      const cleanUrl = msg.url;
      const callbackUri = `vlc-x-callback://x-callback-url/stream?url=${encodeURIComponent(cleanUrl)}`;
      const fallbackUri = `vlc://${cleanUrl}`;
      try {
        const canCallback = await Linking.canOpenURL(callbackUri);
        if (canCallback) {
          await Linking.openURL(callbackUri);
          return;
        }
        const canFallback = await Linking.canOpenURL(fallbackUri);
        if (canFallback) {
          await Linking.openURL(fallbackUri);
          return;
        }
        Alert.alert(
          'VLC Not Found',
          'Install "VLC media player" from the iOS App Store, or tap Copy Link to paste into VLC.'
        );
      } catch (e) {
        Alert.alert('VLC Launch Error', e.message);
      }
    } else if (msg.type === 'COPY_TEXT') {
      await Clipboard.setStringAsync(msg.text);
      Alert.alert('Copied', 'Direct video link copied to clipboard.');
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <WebView
        ref={webviewRef}
        source={{ html: LOCALFLIX_HTML, baseUrl: 'http://localhost/' }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        allowsInlineMediaPlayback
        onMessage={handleWebMessage}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  webview: { flex: 1, backgroundColor: '#141414' },
});