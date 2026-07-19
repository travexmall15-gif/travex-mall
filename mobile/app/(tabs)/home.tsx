import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { sb } from '../../lib/supabase'
import { C, R } from '../../lib/theme'

const FEATURES = [
  { emoji:'⚡', label:'Flash Deals', route:'/(tabs)/market', bg:'#FFF1F2' },
  { emoji:'👥', label:'Group Buy',   route:'/(tabs)/market', bg:'#F0FDF4' },
  { emoji:'🎓', label:'Campus',      route:'/(tabs)/market', bg:'#EFF6FF' },
  { emoji:'🚛', label:'Move',        route:'/(tabs)/market', bg:'#FFFBEB' },
]

export default function HomeScreen() {
  const router = useRouter()
  const [user, setUser]         = useState<{name:string}|null>(null)
  const [shops, setShops]       = useState<any[]>([])
  const [refreshing, setRef]    = useState(false)

  const load = async () => {
    const { data: { session } } = await sb.auth.getSession()
    if (session?.user) {
      const m = session.user.user_metadata
      setUser({ name: m?.display_name || m?.username || session.user.email?.split('@')[0] || 'there' })
    }
    const { data } = await sb.from('shops').select('id,shop_name,shop_category,shop_city,rating').eq('is_verified',true).limit(10)
    setShops(data || [])
  }

  useEffect(() => { load() }, [])

  const refresh = async () => { setRef(true); await load(); setRef(false) }

  return (
    <ScrollView style={s.wrap} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greet}>Habari{user ? `, ${user.name}` : ''}! 👋</Text>
          <Text style={s.sub}>What are you shopping for today?</Text>
        </View>
        <TouchableOpacity style={s.notif}><Text>🔔</Text></TouchableOpacity>
      </View>

      {/* Search bar */}
      <TouchableOpacity style={s.search} onPress={() => router.push('/(tabs)/market')}>
        <Text style={s.searchT}>🔍 Search products, shops...</Text>
      </TouchableOpacity>

      {/* Feature chips */}
      <View style={s.features}>
        {FEATURES.map((f,i) => (
          <TouchableOpacity key={i} style={[s.chip, {backgroundColor:f.bg}]} onPress={() => router.push(f.route as any)}>
            <Text style={s.chipE}>{f.emoji}</Text>
            <Text style={s.chipL}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Market section */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Business Market</Text>
        {shops.length === 0 ? (
          <Text style={s.empty}>No shops yet</Text>
        ) : (
          shops.map(shop => (
            <TouchableOpacity key={shop.id} style={s.shopCard}>
              <View style={s.shopIcon}>
                <Text style={{fontSize:22}}>🏪</Text>
              </View>
              <View style={s.shopInfo}>
                <Text style={s.shopName}>{shop.shop_name}</Text>
                <Text style={s.shopCat}>{shop.shop_category} · {shop.shop_city || 'Online'}</Text>
              </View>
              {shop.rating && <Text style={s.rating}>⭐ {shop.rating}</Text>}
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  wrap:        { flex:1, backgroundColor:C.bg },
  header:      { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:20, paddingTop:56, backgroundColor:C.navy },
  greet:       { fontSize:20, fontWeight:'800', color:'#fff' },
  sub:         { fontSize:13, color:'rgba(255,255,255,0.5)', marginTop:2 },
  notif:       { width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.1)', alignItems:'center', justifyContent:'center' },
  search:      { margin:16, backgroundColor:'#fff', borderRadius:R.lg, padding:14, borderWidth:1.5, borderColor:C.border },
  searchT:     { color:C.light, fontSize:14 },
  features:    { flexDirection:'row', paddingHorizontal:16, gap:10, marginBottom:8 },
  chip:        { flex:1, alignItems:'center', padding:12, borderRadius:R.md },
  chipE:       { fontSize:20, marginBottom:4 },
  chipL:       { fontSize:10, fontWeight:'700', color:C.navy },
  section:     { padding:16 },
  sectionTitle:{ fontSize:16, fontWeight:'800', color:C.navy, marginBottom:12 },
  empty:       { color:C.light, textAlign:'center', padding:20 },
  shopCard:    { flexDirection:'row', alignItems:'center', backgroundColor:'#fff', borderRadius:R.lg, padding:14, marginBottom:10, borderWidth:1.5, borderColor:C.border },
  shopIcon:    { width:46, height:46, borderRadius:12, backgroundColor:C.bg, alignItems:'center', justifyContent:'center', marginRight:12 },
  shopInfo:    { flex:1 },
  shopName:    { fontSize:14, fontWeight:'700', color:C.navy },
  shopCat:     { fontSize:12, color:C.muted, marginTop:2 },
  rating:      { fontSize:12, color:C.gold },
})
