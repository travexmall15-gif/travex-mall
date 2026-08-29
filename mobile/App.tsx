import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  ActivityIndicator,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native'
import { WebView } from 'react-native-webview'
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync()

const BASE_URL = 'https://shopnekt.vercel.app'

const INJECT_JS =
  'window.__SHOPNEKT_APP__=true;' +
  'window.__SHOPNEKT_NATIVE__=true;' +
  'true;'

export default function App() {
  const webRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const [canBack, setCanBack] = useState(false)

  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  useEffect(() => {
    if (Platform.OS !== 'android') {return}
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canBack && webRef.current) {
        webRef.current.goBack()
        return true
      }
      return false
    })
    return () => sub.remove()
  }, [canBack])

  if (error) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Text style={styles.brandErr}>
          <Text style={styles.brandBlack}>Shop</Text>
          <Text style={styles.brandBlue}>Nekt</Text>
        </Text>
        <Text style={styles.title}>No Internet Connection</Text>
        <Text style={styles.sub}>Check your connection and try again</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => {
            setError(false)
            setReady(false)
            if (webRef.current) {webRef.current.reload()}
          }}
        >
          <Text style={styles.btnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />

      {/* ONE splash — white, minimal, no artificial delay */}
      {!ready && (
        <View style={styles.splash}>
          <Text style={styles.brand}>
            <Text style={styles.brandBlack}>Shop</Text>
            <Text style={styles.brandBlue}>Nekt</Text>
          </Text>
          <ActivityIndicator color="#1D4ED8" size="small" style={styles.spinner} />
          <Text style={styles.tag}>from QNEX360</Text>
        </View>
      )}

      <WebView
        ref={webRef}
        source={{ uri: BASE_URL }}
        style={ready ? styles.web : styles.hide}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        geolocationEnabled
        injectedJavaScript={INJECT_JS}
        applicationNameForUserAgent="ShopNektApp/1.0"
        cacheEnabled
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onLoadEnd={() => setReady(true)}
        onError={() => { setReady(true); setError(true) }}
        onHttpError={() => { setReady(true); setError(true) }}
        onNavigationStateChange={(s: any) => setCanBack(s.canGoBack)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#ffffff' },
  web:        { flex: 1 },
  hide:       { flex: 0, width: 0, height: 0 },

  // ONE white splash
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  brand:      { fontSize: 38, fontWeight: '900', letterSpacing: -1 },
  brandBlack: { color: '#111827' },
  brandBlue:  { color: '#1D4ED8' },
  spinner:    { marginTop: 24 },
  tag:        { color: '#9CA3AF', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', marginTop: 20 },

  // Error screen
  center:     { flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', padding: 32 },
  brandErr:   { fontSize: 32, fontWeight: '900', letterSpacing: -1, marginBottom: 24 },
  title:      { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  sub:        { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  btn:        { backgroundColor: '#1D4ED8', borderRadius: 999, paddingHorizontal: 32, paddingVertical: 14 },
  btnText:    { color: '#ffffff', fontWeight: '700', fontSize: 15 },
})
