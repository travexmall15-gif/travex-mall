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
    if (Platform.OS !== 'android') return
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
        <StatusBar barStyle="light-content" backgroundColor="#080F37" />
        <Text style={styles.emoji}>📵</Text>
        <Text style={styles.title}>Hakuna Mtandao</Text>
        <Text style={styles.sub}>Angalia connection yako na ujaribu tena</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => {
            setError(false)
            setReady(false)
            if (webRef.current) webRef.current.reload()
          }}
        >
          <Text style={styles.btnText}>🔄  Jaribu Tena</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B3E" translucent={false} />

      {!ready && (
        <View style={styles.splash}>
          <Text style={styles.brand}>
            <Text>shop</Text>
            <Text style={styles.gold}>nekt</Text>
          </Text>
          <ActivityIndicator color="#C9A84C" size="large" style={styles.spinner} />
          <Text style={styles.tag}>by QNEX360</Text>
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

const NAVY = '#080F37'
const GOLD = '#C9A84C'

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: NAVY },
  web:     { flex: 1 },
  hide:    { flex: 0, width: 0, height: 0 },

  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  brand:   { fontSize: 40, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  gold:    { color: GOLD },
  spinner: { marginTop: 28 },
  tag:     { color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', marginTop: 24 },

  center:  { flex: 1, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji:   { fontSize: 56, marginBottom: 16 },
  title:   { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8 },
  sub:     { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  btn:     { backgroundColor: GOLD, borderRadius: 999, paddingHorizontal: 32, paddingVertical: 14 },
  btnText: { color: NAVY, fontWeight: '700', fontSize: 15 },
})
