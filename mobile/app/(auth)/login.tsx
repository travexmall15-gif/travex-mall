import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native'
import { useRouter } from 'expo-router'
import { sb } from '../../lib/supabase'
import { C, R } from '../../lib/theme'

export default function LoginScreen() {
  const router = useRouter()
  const [step, setStep]       = useState<'main'|'otp'>('main')
  const [email, setEmail]     = useState('')
  const [otp, setOtp]         = useState('')
  const [loading, setLoading] = useState(false)

  const sendOTP = async () => {
    if (!email.includes('@')) return Alert.alert('Error', 'Enter a valid email')
    setLoading(true)
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    })
    setLoading(false)
    if (error) return Alert.alert('Error', error.message)
    setStep('otp')
  }

  const verifyOTP = async () => {
    if (otp.length !== 6) return Alert.alert('Error', 'Enter the 6-digit code')
    setLoading(true)
    const { error } = await sb.auth.verifyOtp({
      email, token: otp, type: 'email'
    })
    setLoading(false)
    if (error) return Alert.alert('Error', error.message)
    router.replace('/(tabs)/home')
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={s.wrap}>
      <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={s.header}>
          <Text style={s.brand}>shop<Text style={s.orange}>nekt</Text></Text>
          <Text style={s.sub}>The Global Digital Marketplace</Text>
        </View>

        {step === 'main' ? (
          <View style={s.card}>
            <Text style={s.title}>Welcome 👋</Text>
            <Text style={s.desc}>Sign in to your ShopNekt account</Text>

            <Text style={s.label}>Email Address</Text>
            <TextInput
              style={s.input}
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={C.light}
            />

            <TouchableOpacity
              style={[s.btn, loading && s.btnDis]}
              onPress={sendOTP}
              disabled={loading}>
              <Text style={s.btnT}>{loading ? 'Sending...' : 'Send Code →'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.card}>
            <Text style={s.title}>Check your email 📧</Text>
            <Text style={s.desc}>We sent a 6-digit code to {email}</Text>

            <Text style={s.label}>Verification Code</Text>
            <TextInput
              style={[s.input, s.inputCenter]}
              placeholder="000000"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              placeholderTextColor={C.light}
            />

            <TouchableOpacity
              style={[s.btn, loading && s.btnDis]}
              onPress={verifyOTP}
              disabled={loading}>
              <Text style={s.btnT}>{loading ? 'Verifying...' : '✓ Verify & Sign In'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep('main')} style={s.back}>
              <Text style={s.backT}>← Change email</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  wrap:        { flex:1, backgroundColor:C.navy },
  inner:       { flexGrow:1, padding:24, justifyContent:'center' },
  header:      { alignItems:'center', marginBottom:36 },
  brand:       { fontSize:36, fontWeight:'900', color:'#fff', letterSpacing:-1 },
  orange:      { color:C.orange },
  sub:         { color:'rgba(255,255,255,0.4)', fontSize:13, marginTop:6 },
  card:        { backgroundColor:'#fff', borderRadius:R.xl, padding:24 },
  title:       { fontSize:22, fontWeight:'800', color:C.navy, marginBottom:6 },
  desc:        { fontSize:13, color:C.muted, marginBottom:24, lineHeight:20 },
  label:       { fontSize:11, fontWeight:'700', color:C.muted, textTransform:'uppercase', letterSpacing:1, marginBottom:8 },
  input:       { borderWidth:1.5, borderColor:C.border, borderRadius:R.md, padding:14, fontSize:15, color:C.text, backgroundColor:C.bg, marginBottom:16 },
  inputCenter: { textAlign:'center', fontSize:22, fontWeight:'700', letterSpacing:8 },
  btn:         { backgroundColor:C.navy, borderRadius:R.pill, padding:15, alignItems:'center', marginTop:4 },
  btnDis:      { opacity:0.6 },
  btnT:        { color:'#fff', fontWeight:'700', fontSize:15 },
  back:        { alignItems:'center', marginTop:16 },
  backT:       { color:C.muted, fontSize:13 },
})
