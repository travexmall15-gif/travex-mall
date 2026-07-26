import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { sb, C } from '../lib/supabase'

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

export default function LoginScreen({ navigation }: any) {
  const [step, setStep]       = useState<'email'|'pin'>('email')
  const [email, setEmail]     = useState('')
  const [pin, setPin]         = useState('')
  const [shopId, setShopId]   = useState('')
  const [shopName, setShopName] = useState('')
  const [storedPin, setStoredPin] = useState('')
  const [loading, setLoading] = useState(false)

  const continueEmail = async () => {
    if (!email.trim()) { Alert.alert('Error', 'Enter your email'); return }
    setLoading(true)
    const { data } = await sb.from('pending_payments')
      .select('id,shop_name,login_password,plan')
      .or(`auth_email.eq.${email.toLowerCase().trim()},owner_email.eq.${email.toLowerCase().trim()}`)
      .eq('status','approved').maybeSingle()
    setLoading(false)
    if (!data) { Alert.alert('Not found', 'No approved shop found for this email.'); return }
    setShopId(data.id)
    setShopName(data.shop_name || 'My Shop')
    setStoredPin(data.login_password || '')
    setStep('pin')
  }

  const tapKey = (k: string) => {
    if (k === '⌫') { setPin(p => p.slice(0,-1)); return }
    if (k === '' || pin.length >= 4) return
    const next = pin + k
    setPin(next)
    if (next.length === 4) verifyPin(next)
  }

  const verifyPin = async (p: string) => {
    if (p !== storedPin) { Alert.alert('Wrong PIN', 'Incorrect PIN. Try again.'); setPin(''); return }
    const { data } = await sb.from('pending_payments').select('*').eq('id', shopId).maybeSingle()
    if (!data) { Alert.alert('Error', 'Shop not found'); return }
    await AsyncStorage.setItem('seller_session', JSON.stringify({ id: data.id, shop_name: data.shop_name, plan: data.plan, email: email.toLowerCase().trim() }))
    navigation.replace('Main')
  }

  if (step === 'pin') return (
    <View style={s.wrap}>
      <View style={s.card}>
        <View style={s.av}><Text style={s.avTx}>{shopName.slice(0,2).toUpperCase()}</Text></View>
        <Text style={s.shopNm}>{shopName}</Text>
        <Text style={s.pinSub}>Enter your 4-digit PIN</Text>
        <View style={s.dots}>
          {[0,1,2,3].map(i => <View key={i} style={[s.dot, pin.length > i && s.dotOn]}/>)}
        </View>
        <View style={s.keypad}>
          {KEYS.map((k,i) => (
            <TouchableOpacity key={i} onPress={() => tapKey(k)} activeOpacity={0.7}
              style={[s.key, k==='' && {opacity:0}]}>
              <Text style={[s.keyTx, k==='⌫' && {color:C.RED}]}>{k}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={() => {setStep('email');setPin('')}} style={{marginTop:12}}>
          <Text style={{color:C.GRAY,fontSize:13}}>← Not you?</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <KeyboardAvoidingView style={s.wrap} behavior={Platform.OS==='ios'?'padding':'height'}>
      <ScrollView contentContainerStyle={{flexGrow:1,justifyContent:'center'}} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <Text style={s.title}>Welcome Back</Text>
          <Text style={s.sub}>Enter your seller email to continue</Text>
          <TextInput style={s.inp} placeholder="your@email.com" placeholderTextColor="#94A3B8"
            value={email} onChangeText={setEmail} keyboardType="email-address"
            autoCapitalize="none" onSubmitEditing={continueEmail}/>
          <TouchableOpacity style={s.btn} onPress={continueEmail} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff"/> : <Text style={s.btnTx}>Continue →</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  wrap:   { flex:1, backgroundColor:'#080F37', alignItems:'center', justifyContent:'center', padding:20 },
  card:   { backgroundColor:C.WHITE, borderRadius:22, padding:26, width:'100%', maxWidth:380, alignItems:'center' },
  title:  { fontSize:22, fontWeight:'800', color:C.NAVY, marginBottom:6 },
  sub:    { fontSize:13, color:C.GRAY, textAlign:'center', marginBottom:20, lineHeight:20 },
  inp:    { width:'100%', backgroundColor:C.OFF, borderWidth:1.5, borderColor:C.LGRAY, borderRadius:12, padding:14, fontSize:15, color:C.NAVY, marginBottom:14 },
  btn:    { width:'100%', backgroundColor:C.NAVY, borderRadius:12, padding:15, alignItems:'center' },
  btnTx:  { color:'#fff', fontSize:16, fontWeight:'700' },
  av:     { width:56, height:56, borderRadius:16, backgroundColor:C.NAVY, alignItems:'center', justifyContent:'center', marginBottom:10 },
  avTx:   { fontSize:20, fontWeight:'800', color:C.GOLD },
  shopNm: { fontSize:18, fontWeight:'800', color:C.NAVY, marginBottom:4 },
  pinSub: { fontSize:13, color:C.GRAY, marginBottom:18 },
  dots:   { flexDirection:'row', gap:14, marginBottom:22 },
  dot:    { width:16, height:16, borderRadius:8, borderWidth:2, borderColor:'#CBD5E1' },
  dotOn:  { backgroundColor:C.NAVY, borderColor:C.NAVY },
  keypad: { width:'100%', flexDirection:'row', flexWrap:'wrap', gap:8 },
  key:    { width:'30%', aspectRatio:1.8, backgroundColor:C.OFF, borderRadius:12, alignItems:'center', justifyContent:'center', borderWidth:1.5, borderColor:C.LGRAY },
  keyTx:  { fontSize:22, fontWeight:'700', color:C.NAVY },
  LGRAY:  { borderColor: '#E2E8F0' }
})
