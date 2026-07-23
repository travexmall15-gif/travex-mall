import { useEffect, useRef, useState } from 'react'
import {
  View, Text, StyleSheet, BackHandler,
  ActivityIndicator, Platform, StatusBar, TouchableOpacity,
} from 'react-native'
import { WebView } from 'react-native-webview'
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync()

const BASE_URL = 'https://shopnekt.vercel.app'

const INJECT_JS = [
  'window.__SHOPNEKT_APP__ = true;',
  'window.__SHOPNEKT_PLATFORM__ = "' + Platform.OS + '";',
  'window.__SHOPNEKT_VERSION__ = "1.0.0";',
  'true;',
].join('\n')

export default function App() {
  const webRef = useRef<InstanceType<typeof WebView>>(null)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
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

  function retry() {
    setOffline(false)
    setLoading(true)
    webRef.current?.reload()
  }

  if (offline) {
    return (
      <View style={s.offline}>
        <StatusBar barStyle="light-content" backgroundColor="#080F37" />
        <Text style={s.offlineIcon}>📵</Text>
        <Text style={s.offlineTitle}>Hakuna Mtandao</Text>
        <Text style={s.offlineSub}>Angalia connection yako na ujaribu tena</Text>
        <TouchableOpacity style={s.retryBtn} onPress={retry}>
          <Text style={s.retryText}>🔄 Jaribu Tena</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B3E" translucent={false} />

      {loading && (
        <View style={s.splash}>
          <Text style={s.brand}>
            shop<Text style={s.orange}>nekt</Text>
          </Text>
          <ActivityIndicator color="#C9A84C" size="large" style={{ marginTop: 28 }} />
          <Text style={s.tag}>powered by 360 AI</Text>
        </View>
      )}

      <WebView
        ref={webRef}
        source={{ uri: BASE_URL }}
        style={loading ? s.hidden : s.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        geolocationEnabled={true}
        injectedJavaScript={INJECT_JS}
        applicationNameForUserAgent="ShopNektApp/1.0"
        cacheEnabled={true}
        allowFileAccess={true}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
        bounces={false}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => { setLoading(false); setOffline(true) }}
        onHttpError={() => { setLoading(false); setOffline(true) }}
        onNavigationStateChange={state => setCanBack(state.canGoBack)}
      />
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B3E' },
  webview:   { flex: 1 },
  hidden:    { width: 0, height: 0, opacity: 0 },

  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#080F37',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  brand:  { fontSize: 38, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
  orange: { color: '#C9A84C' },
  tag:    { color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', marginTop: 28 },

  offline: { flex: 1, backgroundColor: '#080F37', alignItems: 'center', justifyContent: 'center', padding: 32 },
  offlineIcon:  { fontSize: 56, marginBottom: 16 },
  offlineTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  offlineSub:   { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  retryBtn:  { backgroundColor: '#C9A84C', borderRadius: 999, paddingHorizontal: 32, paddingVertical: 14 },
  retryText: { color: '#0D1B3E', fontWeight: '700', fontSize: 15 },
})
