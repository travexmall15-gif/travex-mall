import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { sb, fmtTZS, timeAgo, NAVY, GOLD, GREEN, RED, OFF, GRAY } from '../lib/supabase'

export default function HomeScreen({ navigation }: any) {
  const [shop, setShop]      = useState<any>(null)
  const [orders, setOrders]  = useState<any[]>([])
  const [sales, setSales]    = useState<any[]>([])
  const [prodCount, setPC]   = useState(0)
  const [refreshing, setRef] = useState(false)

  const load = useCallback(async () => {
    const raw = await AsyncStorage.getItem('seller_session')
    if (!raw) return
    const sess = JSON.parse(raw)
    const { data: shopData } = await sb.from('pending_payments').select('*').eq('id', sess.id).maybeSingle()
    if (shopData) setShop(shopData)
    const { data: o } = await sb.from('orders').select('*').eq('shop_id', sess.id).order('created_at', { ascending: false })
    setOrders(o || [])
    const { data: s } = await sb.from('seller_sales').select('*').eq('store_id', sess.id)
    setSales(s || [])
    const { count } = await sb.from('products').select('*', { count: 'exact', head: true }).eq('shop_id', sess.id)
    setPC(count || 0)
  }, [])

  useEffect(() => { load() }, [load])

  const onRefresh = async () => { setRef(true); await load(); setRef(false) }

  const today = new Date().toISOString().split('T')[0]
  const month = today.slice(0, 7)
  const todayOrders = orders.filter(o => (o.created_at || '').startsWith(today))
  const monthOrders = orders.filter(o => (o.created_at || '').startsWith(month))
  const todayRev    = todayOrders.reduce((a, o) => a + (Number(o.amount) || 0), 0)
  const monthRev    = monthOrders.reduce((a, o) => a + (Number(o.amount) || 0), 0)
  const pending     = orders.filter(o => o.status === 'pending').length
  const hour        = new Date().getHours()
  const greeting    = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const labels = ['Mo','Tu','We','Th','Fr','Sa','Su']
    return { date: d.toISOString().split('T')[0], label: labels[d.getDay() === 0 ? 6 : d.getDay() - 1], isToday: i === 6 }
  })
  const weekVals = weekDays.map(d => orders.filter(o => (o.created_at || '').startsWith(d.date)).reduce((a, o) => a + (Number(o.amount) || 0), 0))
  const maxVal = Math.max(...weekVals, 1)

  return (
    <ScrollView style={{ flex: 1, backgroundColor: OFF }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
      <View style={s.topBar}>
        <View>
          <Text style={s.greeting}>{greeting}, {shop?.owner_name?.split(' ')[0] || 'Seller'}</Text>
          <Text style={s.shopName}>{shop?.shop_name || 'Loading...'}</Text>
        </View>
        <View style={[s.planBadge, { backgroundColor: shop?.plan === 'premium' ? 'rgba(201,168,76,0.2)' : 'rgba(100,116,139,0.15)' }]}>
          <Text style={[s.planText, { color: shop?.plan === 'premium' ? '#8B6914' : GRAY }]}>
            {shop?.plan === 'premium' ? 'Premium' : 'Basic'}
          </Text>
        </View>
      </View>

      <View style={s.pad}>
        <View style={s.statsGrid}>
          {[
            { label: 'Revenue Today', val: fmtTZS(todayRev),    sub: todayOrders.length + ' orders', color: GREEN },
            { label: 'This Month',    val: fmtTZS(monthRev),    sub: monthOrders.length + ' orders', color: NAVY  },
            { label: 'Products',      val: String(prodCount),    sub: 'in your shop',                 color: NAVY  },
            { label: 'Pending',       val: String(pending),      sub: 'need confirm',                 color: pending > 0 ? RED : GREEN },
          ].map(c => (
            <View key={c.label} style={s.statCard}>
              <Text style={s.statLabel}>{c.label}</Text>
              <Text style={[s.statVal, { color: c.color }]}>{c.val}</Text>
              <Text style={s.statSub}>{c.sub}</Text>
            </View>
          ))}
        </View>

        <View style={s.card}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <Text style={s.cardTitle}>Revenue This Week</Text>
            <Text style={{ fontSize:11, color:GRAY }}>{fmtTZS(weekVals.reduce((a,b)=>a+b,0))}</Text>
          </View>
          <View style={{ flexDirection:'row', alignItems:'flex-end', height:72, gap:6 }}>
            {weekDays.map((d, i) => (
              <View key={d.label} style={{ flex:1, alignItems:'center', gap:4 }}>
                <View style={{ flex:1, width:'100%', justifyContent:'flex-end' }}>
                  <View style={{ height: Math.max((weekVals[i]/maxVal)*64, 3), borderRadius:4, backgroundColor: d.isToday ? GOLD : '#CBD5E1' }}/>
                </View>
                <Text style={{ fontSize:9, color:GRAY, fontWeight:'600' }}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={[s.cardTitle, { marginBottom:10 }]}>Quick Actions</Text>
        <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:16 }}>
          {[
            { label:'Add Product', bg:'rgba(13,27,62,0.08)',   onPress: () => navigation.navigate('Products') },
            { label:'Record Sale', bg:'rgba(5,150,105,0.10)',  onPress: () => navigation.navigate('Finance') },
            { label:'Messages',    bg:'rgba(37,211,102,0.10)', onPress: () => navigation.navigate('Messages') },
            { label:'View Orders', bg:'rgba(59,130,246,0.10)', onPress: () => navigation.navigate('Orders') },
          ].map(a => (
            <TouchableOpacity key={a.label} onPress={a.onPress} style={[s.qaBtn, { backgroundColor: a.bg }]} activeOpacity={0.8}>
              <Text style={{ fontSize:13, fontWeight:'700', color:NAVY }}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <Text style={s.cardTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
            <Text style={{ fontSize:12, color:'#3B82F6', fontWeight:'600' }}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={s.card}>
          {orders.length === 0
            ? <Text style={{ color:GRAY, textAlign:'center', padding:16, fontSize:13 }}>No orders yet</Text>
            : orders.slice(0, 4).map(o => (
              <TouchableOpacity key={o.id} style={s.orderItem} onPress={() => navigation.navigate('Orders')} activeOpacity={0.8}>
                <View style={s.orderAv}>
                  <Text style={{ fontWeight:'800', color:NAVY, fontSize:13 }}>{(o.customer_name || '?').slice(0,2).toUpperCase()}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={{ fontSize:13, fontWeight:'700', color:NAVY }}>{o.customer_name || 'Customer'}</Text>
                  <Text style={{ fontSize:11, color:GRAY }}>{o.product_name || ''} · {timeAgo(o.created_at)}</Text>
                </View>
                <View style={{ alignItems:'flex-end' }}>
                  <Text style={{ fontSize:13, fontWeight:'800', color:GREEN }}>{fmtTZS(o.amount || 0)}</Text>
                  <View style={[s.chip, { backgroundColor: o.status === 'pending' ? '#FEF3C7' : '#D1FAE5' }]}>
                    <Text style={{ fontSize:9, fontWeight:'700', color: o.status === 'pending' ? '#92400E' : '#065F46' }}>{o.status || 'pending'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          }
        </View>
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  topBar:   { backgroundColor:NAVY, padding:20, paddingTop:52, flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start' },
  greeting: { fontSize:22, fontWeight:'900', color:'#fff', letterSpacing:-0.5 },
  shopName: { fontSize:13, color:'rgba(255,255,255,0.6)', marginTop:2 },
  planBadge:{ paddingHorizontal:10, paddingVertical:4, borderRadius:999 },
  planText: { fontSize:11, fontWeight:'700' },
  pad:      { padding:16 },
  statsGrid:{ flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:14 },
  statCard: { width:'47%', backgroundColor:'#fff', borderRadius:14, padding:14, borderWidth:1.5, borderColor:'#E2E8F0' },
  statLabel:{ fontSize:10, fontWeight:'600', color:GRAY, textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 },
  statVal:  { fontSize:20, fontWeight:'900', lineHeight:22 },
  statSub:  { fontSize:10, color:GRAY, marginTop:2 },
  card:     { backgroundColor:'#fff', borderRadius:14, padding:14, borderWidth:1.5, borderColor:'#E2E8F0', marginBottom:14 },
  cardTitle:{ fontSize:14, fontWeight:'800', color:NAVY },
  qaBtn:    { width:'47%', borderRadius:12, padding:14, alignItems:'center' },
  orderItem:{ flexDirection:'row', alignItems:'center', gap:10, paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#F8FAFF' },
  orderAv:  { width:36, height:36, borderRadius:10, backgroundColor:OFF, alignItems:'center', justifyContent:'center' },
  chip:     { paddingHorizontal:8, paddingVertical:2, borderRadius:999, marginTop:3 },
})
