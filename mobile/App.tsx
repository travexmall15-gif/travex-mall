import { useEffect, useRef, useState } from 'react'
import {
  View, Text, StyleSheet, BackHandler,
  ActivityIndicator, Platform, StatusBar
} from 'react-native'
import { WebView } from 'react-native-webview'
import * as SplashScreen from 'expo-splash-screen'
import Constants from 'expo-constants'

SplashScreen.preventAutoHideAsync()

const BASE_URL = 'https://shopnekt.vercel.app'

export default function App() {
  const webRef    = useRef<WebView>(null)
  const [loading, setLoading]   = useState(true)
  const [offline, setOffline]   = useState(false)
  const [canBack, setCanBack]   = useState(false)

  // Hide splash once mounted
  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  // Android back button → navigate back in WebView
  useEffect(() => {
    if (Platform.OS !== 'android') return
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canBack && webRef.current) {
        webRef.current.goBack()
        return true
      }
      return false
    })
    return () => handler.remove()
  }, [canBack])

  const INJECT = `
    // Tell the website it's running inside a native app
    window.__SHOPNEKT_APP__ = true;
    window.__SHOPNEKT_PLATFORM__ = '${Platform.OS}';
    window.__SHOPNEKT_VERSION__ = '1.0.0';

    // Prevent zoom on double tap
    var meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.getElementsByTagName('head')[0].appendChild(meta);

    true;
  `

  if (offline) return (
    <View style={s.offline}>
      <Text style={s.offlineIcon}>📵</Text>
      <Text style={s.offlineTitle}>Hakuna Mtandao</Text>
      <Text style={s.offlineSub}>Angalia connection yako na ujaribu tena</Text>
      <Text style={s.retryBtn} onPress={() => { setOffline(false); webRef.current?.reload() }}>
        🔄 Jaribu Tena
      </Text>
    </View>
  )

  return (
    <View style={s.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0D1B3E"
        translucent={false}
      />

      {/* Loading indicator */}
      {loading && (
        <View style={s.splash}>
          <Text style={s.splashBrand}>
            shop<Text style={s.splashOrange}>nekt</Text>
          </Text>
          <ActivityIndicator color="#F97316" size="large" style={{ marginTop: 24 }} />
          <Text style={s.splashTag}>from qnex360</Text>
        </View>
      )}

      <WebView
        ref={webRef}
        source={{ uri: BASE_URL }}
        style={[s.webview, loading && s.hidden]}

        // Behavior
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={true}
        geolocationEnabled={true}

        // Inject JS to tell site it's in app
        injectedJavaScript={INJECT}
        injectedJavaScriptBeforeContentLoaded={INJECT}

        // User agent — keeps web working
        applicationNameForUserAgent="ShopNektApp/1.0"

        // Cache
        cacheEnabled={true}
        cacheMode="LOAD_DEFAULT"

        // File/camera upload
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}

        // Events
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => { setLoading(false); setOffline(true) }}
        onHttpError={() => { setLoading(false); setOffline(true) }}
        onNavigationStateChange={state => setCanBack(state.canGoBack)}

        // Scroll
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
        bounces={false}
      />
    </View>
  )
}

const s = StyleSheet.create({
  container:    { flex:1, backgroundColor:'#0D1B3E' },
  webview:      { flex:1 },
  hidden:       { opacity:0, position:'absolute' },

  // Splash
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#080F37',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  splashBrand:  { fontSize:40, fontWeight:'900', color:'#fff', letterSpacing:-1 },
  splashOrange: { color:'#F97316' },
  splashTag:    { color:'rgba(255,255,255,0.3)', fontSize:11, letterSpacing:3, textTransform:'uppercase', marginTop:32 },

  // Offline
  offline:      { flex:1, backgroundColor:'#080F37', alignItems:'center', justifyContent:'center', padding:32 },
  offlineIcon:  { fontSize:64, marginBottom:16 },
  offlineTitle: { fontSize:22, fontWeight:'800', color:'#fff', marginBottom:8 },
  offlineSub:   { fontSize:14, color:'rgba(255,255,255,0.5)', textAlign:'center', lineHeight:22, marginBottom:32 },
  retryBtn:     { backgroundColor:'#F97316', color:'#fff', fontWeight:'700', fontSize:15, paddingHorizontal:32, paddingVertical:14, borderRadius:999, overflow:'hidden' },
})
