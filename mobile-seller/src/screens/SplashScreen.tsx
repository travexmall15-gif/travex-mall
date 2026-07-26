import React, { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { C } from '../lib/supabase'

export default function SplashScreen({ navigation }: any) {
  useEffect(() => {
    const t = setTimeout(checkSession, 2000)
    return () => clearTimeout(t)
  }, [])

  const checkSession = async () => {
    const raw = await AsyncStorage.getItem('seller_session')
    if (raw) {
      try { if (JSON.parse(raw)?.id) { navigation.replace('Main'); return } } catch {}
    }
    navigation.replace('Login')
  }

  return (
    <View style={s.wrap}>
      <View style={s.logo}><Text style={s.logoText}>SN</Text></View>
      <View style={s.brand}>
        <Text style={s.shopText}>Shop</Text>
        <Text style={s.nektText}>Nekt</Text>
        <Text style={s.sellerText}> Seller</Text>
      </View>
      <Text style={s.sub}>THE GLOBAL DIGITAL MARKETPLACE</Text>
      <TouchableOpacity style={s.btnWrap} onPress={checkSession}>
        <Text style={s.btn}>QNEX360</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  wrap:       { flex:1, backgroundColor:'#080F37', alignItems:'center', justifyContent:'center' },
  logo:       { width:96, height:96, borderRadius:24, backgroundColor:C.WHITE, alignItems:'center', justifyContent:'center', marginBottom:20 },
  logoText:   { fontSize:36, fontWeight:'900', color:C.NAVY },
  brand:      { flexDirection:'row', alignItems:'baseline', marginBottom:10 },
  shopText:   { fontSize:32, fontWeight:'900', color:C.WHITE, letterSpacing:-1 },
  nektText:   { fontSize:32, fontWeight:'900', color:'#F97316', letterSpacing:-1 },
  sellerText: { fontSize:16, fontWeight:'700', color:C.GOLD },
  sub:        { fontSize:9, color:'rgba(255,255,255,0.3)', letterSpacing:3, textTransform:'uppercase' },
  btnWrap:    { position:'absolute', bottom:40 },
  btn:        { fontSize:13, fontWeight:'700', color:'rgba(255,255,255,0.7)', letterSpacing:4 },
})
