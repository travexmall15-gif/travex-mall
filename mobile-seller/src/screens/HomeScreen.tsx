import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { sb, C, fmtTZS, ago } from '../lib/supabase'

export default function HomeScreen({ navigation }: any) {
  const [shop, setShop]     = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [prods, setProds]   = useState(0)
  const [ref, setRef]       = useState(false)

  const load = async () => {
    const raw = await AsyncStorage.getItem('seller_session')
    if (!raw) {return}
    const { id } = JSON.parse(raw)
    const { data: s } = await sb.from('pending_payments').select('*').eq('id',id).maybeSingle()
    if (s) {setShop(s)}
    const { data: o } = await sb.from('orders').select('*').eq('shop_id',id).order('created_at',{ascending:false})
    setOrders(o||[])
    const { count } = await sb.from('products').select('*',{count:'exact',head:true}).eq('shop_id',id)
    setProds(count||0)
  }

  useEffect(() => { load() }, [])

  const today = new Date().toISOString().split('T')[0]
  const month = today.slice(0,7)
  const todayRev = orders.filter(o => o.created_at?.startsWith(today)).reduce((a,o)=>a+(Number(o.amount)||0),0)
  const monthRev = orders.filter(o => o.created_at?.startsWith(month)).reduce((a,o)=>a+(Number(o.amount)||0),0)
  const pending  = orders.filter(o=>o.status==='pending').length
  const h = new Date().getHours()
  const greeting = h<12?'Good morning':h<17?'Good afternoon':'Good evening'

  const weekDays = Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-(6-i))
    const labels=['Mo','Tu','We','Th','Fr','Sa','Su']
    return { date:d.toISOString().split('T')[0], label:labels[d.getDay()===0?6:d.getDay()-1], today:i===6 }
  })
  const vals = weekDays.map(d=>orders.filter(o=>o.created_at?.startsWith(d.date)).reduce((a,o)=>a+(Number(o.amount)||0),0))
  const maxV = Math.max(...vals,1)

  const statCards = [
    {label:'Today Revenue', val:fmtTZS(todayRev), color:C.GREEN},
    {label:'This Month',    val:fmtTZS(monthRev), color:C.NAVY},
    {label:'Products',      val:String(prods),     color:C.NAVY},
    {label:'Pending',       val:String(pending),   color:pending>0?C.RED:C.GREEN},
  ]

  const qaItems = [
    {label:'View Orders',  action:()=>navigation.navigate('Orders')},
    {label:'Record Sale',  action:()=>navigation.navigate('Finance')},
    {label:'Messages',     action:()=>navigation.navigate('Messages')},
    {label:'More Options', action:()=>navigation.navigate('More')},
  ]

  return (
    <ScrollView style={{flex:1,backgroundColor:C.OFF}} refreshControl={<RefreshControl refreshing={ref} onRefresh={async()=>{setRef(true);await load();setRef(false)}}/>}>
      <View style={s.header}>
        <Text style={s.greeting}>{greeting}, {shop?.owner_name?.split(' ')[0]||'Seller'}</Text>
        <Text style={s.shopName}>{shop?.shop_name||'Loading...'}</Text>
        <View style={[s.badge,{backgroundColor:shop?.plan==='premium'?'rgba(201,168,76,0.2)':'rgba(255,255,255,0.12)'}]}>
          <Text style={{fontSize:10,fontWeight:'700',color:shop?.plan==='premium'?C.GOLD:'rgba(255,255,255,0.7)'}}>
            {shop?.plan==='premium'?'PREMIUM':'BASIC'}
          </Text>
        </View>
      </View>

      <View style={s.pad}>
        <View style={s.grid}>
          {statCards.map(c=>(
            <View key={c.label} style={s.statCard}>
              <Text style={s.statLabel}>{c.label}</Text>
              <Text style={[s.statVal,{color:c.color}]}>{c.val}</Text>
            </View>
          ))}
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Revenue This Week</Text>
          <View style={{flexDirection:'row',alignItems:'flex-end',height:64,gap:4,marginTop:8}}>
            {weekDays.map((d,i)=>(
              <View key={d.label} style={{flex:1,alignItems:'center',gap:3}}>
                <View style={{flex:1,width:'100%',justifyContent:'flex-end'}}>
                  <View style={{height:Math.max((vals[i]/maxV)*54,3),borderRadius:4,backgroundColor:d.today?C.GOLD:'#CBD5E1'}}/>
                </View>
                <Text style={{fontSize:9,color:C.GRAY}}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={s.secTitle}>Quick Actions</Text>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:14}}>
          {qaItems.map(a=>(
            <TouchableOpacity key={a.label} onPress={a.action} style={s.qa} activeOpacity={0.8}>
              <Text style={{fontSize:12,fontWeight:'700',color:C.NAVY,textAlign:'center'}}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <Text style={s.secTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={()=>navigation.navigate('Orders')}>
            <Text style={{fontSize:12,color:'#3B82F6',fontWeight:'600'}}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={s.card}>
          {orders.length===0
            ? <Text style={{color:C.GRAY,textAlign:'center',padding:16,fontSize:13}}>No orders yet</Text>
            : orders.slice(0,4).map(o=>(
              <TouchableOpacity key={o.id} style={s.orderRow} activeOpacity={0.8} onPress={()=>navigation.navigate('Orders')}>
                <View style={s.orderAv}><Text style={{fontWeight:'800',color:C.NAVY}}>{(o.customer_name||'?').slice(0,2).toUpperCase()}</Text></View>
                <View style={{flex:1}}>
                  <Text style={{fontSize:13,fontWeight:'700',color:C.NAVY}}>{o.customer_name||'Customer'}</Text>
                  <Text style={{fontSize:11,color:C.GRAY}}>{ago(o.created_at)}</Text>
                </View>
                <Text style={{fontSize:13,fontWeight:'800',color:C.GREEN}}>{fmtTZS(o.amount||0)}</Text>
              </TouchableOpacity>
            ))
          }
        </View>
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  header:   {backgroundColor:C.NAVY,padding:20,paddingTop:52},
  greeting: {fontSize:22,fontWeight:'900',color:C.WHITE,letterSpacing:-0.5},
  shopName: {fontSize:13,color:'rgba(255,255,255,0.5)',marginTop:2,marginBottom:8},
  badge:    {alignSelf:'flex-start',paddingHorizontal:10,paddingVertical:4,borderRadius:999},
  pad:      {padding:16},
  grid:     {flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:12},
  statCard: {width:'47%',backgroundColor:C.WHITE,borderRadius:14,padding:14,borderWidth:1.5,borderColor:C.LGRAY},
  statLabel:{fontSize:10,fontWeight:'600',color:C.GRAY,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4},
  statVal:  {fontSize:20,fontWeight:'900'},
  card:     {backgroundColor:C.WHITE,borderRadius:14,padding:14,borderWidth:1.5,borderColor:C.LGRAY,marginBottom:12},
  cardTitle:{fontSize:13,fontWeight:'700',color:C.NAVY},
  secTitle: {fontSize:14,fontWeight:'800',color:C.NAVY,marginBottom:8},
  qa:       {width:'47%',backgroundColor:C.WHITE,borderRadius:12,padding:14,alignItems:'center',borderWidth:1.5,borderColor:C.LGRAY},
  orderRow: {flexDirection:'row',alignItems:'center',gap:10,paddingVertical:10,borderBottomWidth:1,borderBottomColor:C.OFF},
  orderAv:  {width:36,height:36,borderRadius:10,backgroundColor:C.OFF,alignItems:'center',justifyContent:'center'},
  LGRAY:    {borderColor:'#E2E8F0'}
})
