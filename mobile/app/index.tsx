import { useEffect } from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { sb } from '../lib/supabase'

export default function Splash() {
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(async () => {
      const { data: { session } } = await sb.auth.getSession()
      router.replace(session ? '/(tabs)/home' : '/(auth)/login')
    }, 2200)
    return () => clearTimeout(t)
  }, [])

  return (
    <View style={s.container}>
      <Image source={require('../assets/icon.png')} style={s.logo} />
      <Text style={s.brand}>
        <Text style={s.white}>shop</Text>
        <Text style={s.orange}>nekt</Text>
      </Text>
      <Text style={s.tag}>shop more. save more. live better.</Text>
      <Text style={s.sub}>from qnex360</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#080F37', alignItems:'center', justifyContent:'center' },
  logo:      { width:100, height:100, borderRadius:22, marginBottom:20 },
  brand:     { fontSize:32, fontWeight:'900', letterSpacing:-1 },
  white:     { color:'#fff' },
  orange:    { color:'#F97316' },
  tag:       { color:'rgba(255,255,255,0.5)', fontSize:11, letterSpacing:2, marginTop:12, textTransform:'uppercase' },
  sub:       { color:'rgba(255,255,255,0.25)', fontSize:10, letterSpacing:2, marginTop:6, textTransform:'uppercase' },
})
