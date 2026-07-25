import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, Linking } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { sb, fmtTZS, timeAgo, NAVY, GREEN, RED, OFF, GRAY, GOLD } from '../lib/supabase'

type Filter = 'all'|'pending'|'confirmed'|'completed'
const FILTERS: Filter[] = ['all','pending','confirmed','completed']

export default function OrdersScreen() {
  const [orders, setOrders]     = useState<any[]>([])
  const [filter, setFilter]     = useState<Filter>('all')
  const [shopId, setShopId]     = useState('')
  const [refreshing, setRef]    = useState(false)
  const [selected, setSelected] = useState<any>(null)

  const load = useCallback(async () => {
    const raw = await AsyncStorage.getItem('seller_session')
    if (!raw) return
    const { id } = JSON.parse(raw)
    setShopId(id)
    const { data } = await sb.from('orders').select('*').eq('shop_id',id).order('created_at',{ascending:false})
    setOrders(data||[])
  },[])

  useEffect(() => { load() }, [])

  const onRefresh = async () => { setRef(true); await load(); setRef(false) }

  const filtered = filter==='all' ? orders : orders.filter(o=>o.status===filter)

  const confirmOrder = async (id: string) => {
    const {error} = await sb.from('orders').update({status:'confirmed'}).eq('id',id)
    if (!error) { await load(); setSelected(null) }
  }

  const renderItem = ({item: o}: any) => (
    <TouchableOpacity style={s.item} onPress={() => setSelected(o)} activeOpacity={0.85}>
      <View style={s.av}><Text style={{fontWeight:'800',color:NAVY}}>{(o.customer_name||'?').slice(0,2).toUpperCase()}</Text></View>
      <View style={{flex:1}}>
        <Text style={s.name}>{o.customer_name||'Customer'}</Text>
        <Text style={{fontSize:11,color:GRAY}}>{o.product_name||''} · {timeAgo(o.created_at)}</Text>
      </View>
      <View style={{alignItems:'flex-end'}}>
        <Text style={{fontWeight:'800',color:GREEN,fontSize:13}}>{fmtTZS(o.amount||0)}</Text>
        <View style={[s.chip,{backgroundColor:o.status==='pending'?'#FEF3C7':o.status==='confirmed'?'#D1FAE5':'#F1F5F9'}]}>
          <Text style={{fontSize:9,fontWeight:'700',color:o.status==='pending'?'#92400E':o.status==='confirmed'?'#065F46':NAVY}}>{o.status||'pending'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={{flex:1,backgroundColor:OFF}}>
      {/* Filter tabs */}
      <View style={s.filters}>
        {FILTERS.map(f=>(
          <TouchableOpacity key={f} onPress={()=>setFilter(f)} style={[s.tab, filter===f&&s.tabActive]}>
            <Text style={[s.tabText, filter===f&&s.tabTextActive]}>{f.charAt(0).toUpperCase()+f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList data={filtered} keyExtractor={o=>o.id}
        renderItem={renderItem} contentContainerStyle={{padding:16,gap:2}}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
        ListEmptyComponent={<View style={s.empty}><Text style={{fontSize:16,fontWeight:'700',color:NAVY}}>No {filter} orders</Text></View>}
      />

      {/* Order detail modal */}
      {selected && (
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Order Details</Text>
            <View style={s.detailRow}><Text style={s.detailKey}>Customer</Text><Text style={s.detailVal}>{selected.customer_name||'-'}</Text></View>
            <View style={s.detailRow}><Text style={s.detailKey}>Product</Text><Text style={s.detailVal}>{selected.product_name||'-'}</Text></View>
            <View style={s.detailRow}><Text style={s.detailKey}>Amount</Text><Text style={[s.detailVal,{color:GREEN}]}>{fmtTZS(selected.amount||0)}</Text></View>
            <View style={s.detailRow}><Text style={s.detailKey}>Status</Text><Text style={s.detailVal}>{selected.status||'pending'}</Text></View>
            <View style={s.detailRow}><Text style={s.detailKey}>Time</Text><Text style={s.detailVal}>{timeAgo(selected.created_at)}</Text></View>
            <View style={{flexDirection:'row',gap:8,marginTop:16}}>
              {selected.status==='pending' && (
                <TouchableOpacity style={[s.btn,{backgroundColor:NAVY,flex:1}]} onPress={()=>confirmOrder(selected.id)}>
                  <Text style={{color:'#fff',fontWeight:'700',textAlign:'center'}}>Confirm Order</Text>
                </TouchableOpacity>
              )}
              {selected.customer_phone && (
                <TouchableOpacity style={[s.btn,{backgroundColor:'#25D366',flex:1}]}
                  onPress={()=>Linking.openURL('https://wa.me/'+selected.customer_phone.replace(/[^0-9]/g,''))}>
                  <Text style={{color:'#fff',fontWeight:'700',textAlign:'center'}}>WhatsApp</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[s.btn,{backgroundColor:'#F1F5F9',flex:0.6}]} onPress={()=>setSelected(null)}>
                <Text style={{color:NAVY,fontWeight:'700',textAlign:'center'}}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  filters:  { flexDirection:'row', backgroundColor:'#fff', paddingHorizontal:16, paddingVertical:10, gap:8, borderBottomWidth:1, borderBottomColor:'#E2E8F0' },
  tab:      { paddingHorizontal:14, paddingVertical:6, borderRadius:999, backgroundColor:'#F1F5F9' },
  tabActive:{ backgroundColor:NAVY },
  tabText:  { fontSize:12, fontWeight:'600', color:GRAY },
  tabTextActive:{ color:'#fff' },
  item:     { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#fff', borderRadius:14, padding:12, marginBottom:8, borderWidth:1.5, borderColor:'#E2E8F0' },
  av:       { width:40,height:40,borderRadius:12,backgroundColor:OFF,alignItems:'center',justifyContent:'center' },
  name:     { fontSize:14, fontWeight:'700', color:NAVY },
  chip:     { paddingHorizontal:8,paddingVertical:2,borderRadius:999,marginTop:3 },
  empty:    { padding:40, alignItems:'center' },
  overlay:  { position:'absolute', inset:0, backgroundColor:'rgba(0,0,0,0.45)', justifyContent:'flex-end' },
  modal:    { backgroundColor:'#fff', borderRadius:22, padding:24, margin:12 },
  modalTitle:{ fontSize:18, fontWeight:'800', color:NAVY, marginBottom:16 },
  detailRow:{ flexDirection:'row', justifyContent:'space-between', paddingVertical:8, borderBottomWidth:1, borderBottomColor:'#F1F5F9' },
  detailKey:{ fontSize:13, color:GRAY },
  detailVal:{ fontSize:13, fontWeight:'700', color:NAVY },
  btn:      { padding:13, borderRadius:12 },
})
