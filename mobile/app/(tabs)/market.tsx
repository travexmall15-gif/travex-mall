import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native'
import { sb } from '../../lib/supabase'
import { C, R } from '../../lib/theme'

const TABS = ['All','Business','Campus','Flash Deals','Group Buy']

export default function MarketScreen() {
  const [tab, setTab]         = useState('All')
  const [search, setSearch]   = useState('')
  const [shops, setShops]     = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      let q = sb.from('shops').select('id,shop_name,shop_category,shop_city,plan,is_verified,rating')
      if (tab === 'Business') q = q.eq('source','business')
      if (tab === 'Campus')   q = q.eq('source','campus')
      if (search) q = q.ilike('shop_name',`%${search}%`)
      const { data } = await q.limit(30)
      setShops(data || [])
      setLoading(false)
    }
    load()
  }, [tab, search])

  return (
    <View style={s.wrap}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Market</Text>
        <TextInput
          style={s.search}
          placeholder="🔍 Search shops..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={C.light}
        />
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab===t && s.tabOn]} onPress={() => setTab(t)}>
            <Text style={[s.tabT, tab===t && s.tabTOn]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator color={C.navy} style={{marginTop:40}} />
      ) : (
        <FlatList
          data={shops}
          keyExtractor={i => i.id}
          contentContainerStyle={s.list}
          ListEmptyComponent={<Text style={s.empty}>No shops found</Text>}
          renderItem={({item: shop}) => (
            <TouchableOpacity style={s.card}>
              <View style={s.cardIcon}><Text style={{fontSize:26}}>🏪</Text></View>
              <View style={s.cardInfo}>
                <View style={{flexDirection:'row', alignItems:'center', gap:6}}>
                  <Text style={s.cardName}>{shop.shop_name}</Text>
                  {shop.is_verified && <Text style={s.verified}>✓</Text>}
                </View>
                <Text style={s.cardCat}>{shop.shop_category} · {shop.shop_city || 'Online'}</Text>
                {shop.rating && <Text style={s.rating}>⭐ {shop.rating}</Text>}
              </View>
              <View style={[s.plan, shop.plan==='premium'&&s.planPrem]}>
                <Text style={[s.planT, shop.plan==='premium'&&s.planTPrem]}>
                  {shop.plan==='premium'?'⭐ Pro':'Free'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  wrap:     { flex:1, backgroundColor:C.bg },
  header:   { backgroundColor:C.navy, padding:20, paddingTop:56 },
  title:    { fontSize:22, fontWeight:'900', color:'#fff', marginBottom:12 },
  search:   { backgroundColor:'rgba(255,255,255,0.1)', borderRadius:R.md, padding:12, color:'#fff', fontSize:14 },
  tabs:     { flexDirection:'row', padding:12, gap:8, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor:C.border },
  tab:      { paddingHorizontal:14, paddingVertical:6, borderRadius:R.pill, backgroundColor:C.bg },
  tabOn:    { backgroundColor:C.navy },
  tabT:     { fontSize:12, fontWeight:'600', color:C.muted },
  tabTOn:   { color:'#fff' },
  list:     { padding:14, gap:10 },
  empty:    { textAlign:'center', color:C.light, padding:40 },
  card:     { flexDirection:'row', alignItems:'center', backgroundColor:'#fff', borderRadius:R.lg, padding:14, borderWidth:1.5, borderColor:C.border },
  cardIcon: { width:50, height:50, borderRadius:14, backgroundColor:C.bg, alignItems:'center', justifyContent:'center', marginRight:12 },
  cardInfo: { flex:1 },
  cardName: { fontSize:14, fontWeight:'700', color:C.navy },
  cardCat:  { fontSize:12, color:C.muted, marginTop:2 },
  rating:   { fontSize:11, color:C.gold, marginTop:2 },
  verified: { color:C.green, fontWeight:'800', fontSize:13 },
  plan:     { backgroundColor:C.bg, borderRadius:R.pill, paddingHorizontal:10, paddingVertical:4 },
  planPrem: { backgroundColor:'#FFF7ED' },
  planT:    { fontSize:11, fontWeight:'700', color:C.muted },
  planTPrem:{ color:C.gold },
})
