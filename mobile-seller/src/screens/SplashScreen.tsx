import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NAVY, GOLD } from '../lib/supabase'

export default function SplashScreen({ navigation }: any) {
  const logoScale = useRef(new Animated.Value(0.78)).current
  const brandOp   = useRef(new Animated.Value(0)).current
  const subOp     = useRef(new Animated.Value(0)).current
  const btnOp     = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, { toValue:1, tension:60, friction:7, useNativeDriver:true }),
      Animated.timing(brandOp,   { toValue:1, duration:400, delay:100, useNativeDriver:true }),
      Animated.timing(subOp,     { toValue:1, duration:300, delay:100, useNativeDriver:true }),
      Animated.timing(btnOp,     { toValue:1, duration:400, delay:100, useNativeDriver:true }),
    ]).start()

    const timer = setTimeout(async () => {
      const sess = await AsyncStorage.getItem('seller_session')
      if (sess) {
        try {
          const s = JSON.parse(sess)
          if (s?.id) { navigation.replace('Main'); return }
        } catch {}
      }
      navigation.replace('Login')
    }, 2200)
    return () => clearTimeout(timer)
  }, [])

  const handleTap = async () => {
    const sess = await AsyncStorage.getItem('seller_session')
    if (sess) {
      try { const s = JSON.parse(sess); if (s?.id) { navigation.replace('Main'); return } } catch {}
    }
    navigation.replace('Login')
  }

  return (
    <View style={s.wrap}>
      <Animated.View style={{ transform:[{scale:logoScale}] }}>
        <View style={s.logoBox}>
          <Text style={s.logoLetter}>S</Text>
        </View>
      </Animated.View>
      <Animated.View style={[s.brand, {opacity:brandOp}]}>
        <Text style={s.brandText}>Shop<Text style={{color:'#F97316'}}>Nekt</Text></Text>
        <Text style={s.seller}> Seller</Text>
      </Animated.View>
      <Animated.Text style={[s.sub, {opacity:subOp}]}>THE GLOBAL DIGITAL MARKETPLACE</Animated.Text>
      <Animated.View style={[s.btnWrap, {opacity:btnOp}]}>
        <TouchableOpacity onPress={handleTap} activeOpacity={0.7}>
          <Text style={s.btnText}>QNEX360</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}
const s = StyleSheet.create({
  wrap:    { flex:1, backgroundColor:'#080F37', alignItems:'center', justifyContent:'center' },
  logoBox: { width:96, height:96, borderRadius:22, backgroundColor:'#fff', alignItems:'center', justifyContent:'center', shadowColor:'#000', shadowOpacity:0.25, shadowRadius:16, elevation:8 },
  logoLetter: { fontSize:48, fontWeight:'900', color:NAVY },
  brand:   { flexDirection:'row', alignItems:'baseline', marginTop:22 },
  brandText: { fontSize:34, fontWeight:'900', color:'#fff', letterSpacing:-1 },
  seller:  { fontSize:18, fontWeight:'700', color:GOLD, letterSpacing:-0.5 },
  sub:     { fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:3, marginTop:10, textTransform:'uppercase' },
  btnWrap: { position:'absolute', bottom:40 },
  btnText: { fontSize:14, fontWeight:'700', color:'rgba(255,255,255,0.8)', letterSpacing:4 },
})
