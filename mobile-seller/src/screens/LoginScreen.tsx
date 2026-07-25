import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { sb, NAVY, GOLD, GRAY } from '../lib/supabase'

type Step = 'email' | 'pin'

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

export default function LoginScreen({ navigation }: any) {
  const [step,   setStep]   = useState<Step>('email')
  const [email,  setEmail]  = useState('')
  const [shopName, setShopName] = useState('')
  const [pin,    setPin]    = useState('')
  const [shopId, setShopId] = useState('')
  const [loading, setLoading] = useState(false)

  const goEmail = async () => {
    if (!email.trim()) { Alert.alert('Error', 'Please enter your email address'); return }
    setLoading(true)
    const enc = encodeURIComponent(email.trim().toLowerCase())
    const { data, error } = await sb.from('pending_payments')
      .select('id,shop_name,login_password,status')
      .or(`auth_email.eq.${email.trim().toLowerCase()},owner_email.eq.${email.trim().toLowerCase()}`)
      .eq('status','approved')
      .maybeSingle()
    setLoading(false)
    if (error || !data) { Alert.alert('Not found', 'No approved shop found for this email.'); return }
    setShopId(data.id)
    setShopName(data.shop_name || 'My Shop')
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
    setLoading(true)
    const { data } = await sb.from('pending_payments')
      .select('*').eq('id', shopId).eq('status','approved').maybeSingle()
    setLoading(false)
    if (!data) { Alert.alert('Error', 'Shop not found'); setPin(''); return }
    if (data.login_password !== p) { Alert.alert('Wrong PIN', 'Incorrect PIN. Please try again.'); setPin(''); return }
    const session = { id: data.id, shop_name: data.shop_name, plan: data.plan, email: email.trim().toLowerCase() }
    await AsyncStorage.setItem('seller_session', JSON.stringify(session))
    navigation.replace('Main')
  }

  if (step === 'pin') return (
    <View style={s.wrap}>
      <View style={s.card}>
        <View style={s.avatar}><Text style={s.avatarText}>{shopName.slice(0,2).toUpperCase()}</Text></View>
        <Text style={s.shopName}>{shopName}</Text>
        <Text style={s.pinSub}>Enter your 4-digit PIN</Text>
        <View style={s.dots}>
          {[0,1,2,3].map(i => <View key={i} style={[s.dot, pin.length > i && s.dotFill]}/>)}
        </View>
        <View style={s.keypad}>
          {KEYS.map((k,i) => (
            <TouchableOpacity key={i} onPress={() => tapKey(k)} activeOpacity={0.7}
              style={[s.key, k==='' && s.keyEmpty]}>
              <Text style={[s.keyText, k==='⌫' && {color:'#EF4444'}]}>{k}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {loading && <ActivityIndicator color={NAVY} style={{marginTop:8}}/>}
        <TouchableOpacity onPress={() => {setStep('email');setPin('')}} style={s.back}>
          <Text style={s.backText}>← Not you?</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <KeyboardAvoidingView style={s.wrap} behavior={Platform.OS==='ios'?'padding':'height'}>
      <ScrollView contentContainerStyle={{flexGrow:1,justifyContent:'center'}} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <Text style={s.title}>Welcome Back</Text>
          <Text style={s.sub}>Enter your email to access your seller dashboard</Text>
          <TextInput style={s.inp} placeholder="your@email.com" placeholderTextColor="#94A3B8"
            value={email} onChangeText={setEmail} keyboardType="email-address"
            autoCapitalize="none" autoCorrect={false} onSubmitEditing={goEmail}/>
          <TouchableOpacity style={s.btn} onPress={goEmail} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff"/> : <Text style={s.btnText}>Continue →</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  wrap:     { flex:1, backgroundColor:'#080F37', alignItems:'center', justifyContent:'center', padding:24 },
  card:     { backgroundColor:'#fff', borderRadius:22, padding:28, width:'100%', maxWidth:380, alignItems:'center', shadowColor:'#000', shadowOpacity:0.2, shadowRadius:20, elevation:10 },
  title:    { fontSize:22, fontWeight:'800', color:NAVY, marginBottom:6, letterSpacing:-0.5 },
  sub:      { fontSize:13, color:GRAY, textAlign:'center', marginBottom:22, lineHeight:20 },
  inp:      { width:'100%', backgroundColor:'#F8FAFF', borderWidth:1.5, borderColor:'#E2E8F0', borderRadius:12, padding:14, fontSize:15, color:NAVY, marginBottom:14 },
  btn:      { width:'100%', backgroundColor:NAVY, borderRadius:12, padding:15, alignItems:'center' },
  btnText:  { color:'#fff', fontSize:16, fontWeight:'700' },
  avatar:   { width:56, height:56, borderRadius:16, backgroundColor:NAVY, alignItems:'center', justifyContent:'center', marginBottom:12 },
  avatarText:{ fontSize:20, fontWeight:'800', color:GOLD },
  shopName: { fontSize:18, fontWeight:'800', color:NAVY, marginBottom:4 },
  pinSub:   { fontSize:13, color:GRAY, marginBottom:20 },
  dots:     { flexDirection:'row', gap:14, marginBottom:24 },
  dot:      { width:16, height:16, borderRadius:8, borderWidth:2, borderColor:'#CBD5E1' },
  dotFill:  { backgroundColor:NAVY, borderColor:NAVY },
  keypad:   { width:'100%', flexDirection:'row', flexWrap:'wrap', gap:10 },
  key:      { width:'30%', aspectRatio:1.6, backgroundColor:'#F8FAFC', borderRadius:12, alignItems:'center', justifyContent:'center', borderWidth:1.5, borderColor:'#E2E8F0' },
  keyEmpty: { backgroundColor:'transparent', borderColor:'transparent' },
  keyText:  { fontSize:22, fontWeight:'700', color:NAVY },
  back:     { marginTop:16 },
  backText: { fontSize:13, color:GRAY, fontWeight:'600' },
})
