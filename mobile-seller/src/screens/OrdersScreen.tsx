import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, Linking } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { sb, C, fmtTZS, ago } from '../lib/supabase'

const FILTERS = ['All','Pending','Confirmed','Completed']

export default function OrdersScreen() {
  const [orders, setOrders]   = useState<any[]>([])
  const [filter, setFilter]   = useState('All')
  const [shopId, setShopId]   = useState('')
  const [sel, setSel]         = useState<any>(null)
  const [ref, setRef]         = useState(false)

  const load = async () => {
    const raw = await AsyncStorage.getItem('seller_session')
    if (!raw) return
    const {id} = JSON.parse(raw); setShopId(id)
    const {data} = await sb.from('orders').select('*').eq('shop_id',id).order('created_at',{ascending:false})
    setOrders(data||[])
  }

  useEffect(() => { load() }, [])

  const filtered = filter==='All' ? orders : orders.filter(o=>o.status===filter.toLowerCase())

  const confirm = async () => {
    if (!sel) return
    await sb.from('orders').update({status:'confirmed'}).eq('id',sel.id)
    await load(); setSel(null)
  }

  return (
    <View style={{flex:1,backgroundColor:C.OFF}}>
      <View style={s.filters}>
        {FILTERS.map(f=>(
          <TouchableOpacity key={f} onPress={()=>setFilter(f)} style={[s.tab,filter===f&&s.tabOn]}>
            <Text style={[s.tabTx,filter===f&&{color:C.WHITE}]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList data={filtered} keyExtractor={o=>o.id}
        contentContainerStyle={{padding:16,gap:8}}
        refreshControl={<RefreshControl refreshing={ref} onRefresh={async()=>{setRef(true);await load();setRef(false)}}/>}
        ListEmptyComponent={<View style={s.empty}><Text style={{fontSize:15,fontWeight:'700',color:C.NAVY}}>No {filter} orders</Text></View>}
        renderItem={({item:o})=>(
          <TouchableOpacity style={s.item} onPress={()=>setSel(o)} activeOpacity={0.85}>
            <View style={s.av}><Text style={{fontWeight:'800',color:C.NAVY,fontSize:13}}>{(o.customer_name||'?').slice(0,2).toUpperCase()}</Text></View>
            <View style={{flex:1}}>
              <Text style={{fontSize:13,fontWeight:'700',color:C.NAVY}}>{o.customer_name||'Customer'}</Text>
              <Text style={{fontSize:11,color:C.GRAY}}>{o.product_name||''} · {ago(o.created_at)}</Text>
            </View>
            <View style={{alignItems:'flex-end'}}>
              <Text style={{fontSize:13,fontWeight:'800',color:C.GREEN}}>{fmtTZS(o.amount||0)}</Text>
              <View style={[s.chip,{backgroundColor:o.status==='pending'?'#FEF3C7':'#D1FAE5'}]}>
                <Text style={{fontSize:9,fontWeight:'700',color:o.status==='pending'?'#92400E':'#065F46'}}>{o.status||'pending'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      {sel&&(
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.mTitle}>Order Details</Text>
            {[['Customer',sel.customer_name||'-'],['Product',sel.product_name||'-'],['Amount',fmtTZS(sel.amount||0)],['Status',sel.status||'pending']].map(([k,v])=>(
              <View key={k} style={s.row}><Text style={{color:C.GRAY,fontSize:13}}>{k}</Text><Text style={{fontWeight:'700',color:C.NAVY,fontSize:13}}>{v}</Text></View>
            ))}
            <View style={{flexDirection:'row',gap:8,marginTop:14}}>
              {sel.status==='pending'&&<TouchableOpacity style={[s.btn,{backgroundColor:C.NAVY,flex:1}]} onPress={confirm}><Text style={{color:'#fff',fontWeight:'700',textAlign:'center'}}>Confirm</Text></TouchableOpacity>}
              {sel.customer_phone&&<TouchableOpacity style={[s.btn,{backgroundColor:'#25D366',flex:1}]} onPress={()=>Linking.openURL('https://wa.me/'+sel.customer_phone.replace(/\D/g,''))}><Text style={{color:'#fff',fontWeight:'700',textAlign:'center'}}>WhatsApp</Text></TouchableOpacity>}
              <TouchableOpacity style={[s.btn,{backgroundColor:C.OFF,flex:0.7}]} onPress={()=>setSel(null)}><Text style={{fontWeight:'700',textAlign:'center',color:C.NAVY}}>Close</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  filters:  {flexDirection:'row',backgroundColor:C.WHITE,padding:12,gap:6,borderBottomWidth:1,borderBottomColor:C.LGRAY,flexWrap:'wrap'},
  tab:      {paddingHorizontal:12,paddingVertical:6,borderRadius:999,backgroundColor:C.OFF},
  tabOn:    {backgroundColor:C.NAVY},
  tabTx:    {fontSize:12,fontWeight:'600',color:C.GRAY},
  item:     {flexDirection:'row',alignItems:'center',gap:10,backgroundColor:C.WHITE,borderRadius:14,padding:12,borderWidth:1.5,borderColor:C.LGRAY},
  av:       {width:40,height:40,borderRadius:12,backgroundColor:C.OFF,alignItems:'center',justifyContent:'center'},
  chip:     {paddingHorizontal:8,paddingVertical:2,borderRadius:999,marginTop:3},
  empty:    {padding:40,alignItems:'center'},
  overlay:  {position:'absolute',inset:0,backgroundColor:'rgba(0,0,0,0.45)',justifyContent:'flex-end'},
  modal:    {backgroundColor:C.WHITE,borderRadius:22,padding:22,margin:12},
  mTitle:   {fontSize:17,fontWeight:'800',color:C.NAVY,marginBottom:14},
  row:      {flexDirection:'row',justifyContent:'space-between',paddingVertical:8,borderBottomWidth:1,borderBottomColor:C.OFF},
  btn:      {padding:13,borderRadius:12},
  LGRAY:    {borderColor:'#E2E8F0'}
})
