import { View, Text, StyleSheet } from 'react-native'
import { C } from '../../lib/theme'

export default function Screen() {
  const labels: Record<string, string> = { vybe:'✨ Social Vybe', orders:'📦 My Orders', menu:'☰ Menu' }
  const name = 'vybe'
  return (
    <View style={s.wrap}>
      <View style={s.header}>
        <Text style={s.title}>{labels[name] || name}</Text>
      </View>
      <View style={s.body}>
        <Text style={s.soon}>Coming soon...</Text>
        <Text style={s.sub}>This screen is being built</Text>
      </View>
    </View>
  )
}
const s = StyleSheet.create({
  wrap:   { flex:1, backgroundColor:'#F8FAFF' },
  header: { backgroundColor:'#0D1B3E', padding:20, paddingTop:56 },
  title:  { fontSize:22, fontWeight:'900', color:'#fff' },
  body:   { flex:1, alignItems:'center', justifyContent:'center' },
  soon:   { fontSize:40, marginBottom:8 },
  sub:    { color:'#94A3B8', fontSize:14 },
})
