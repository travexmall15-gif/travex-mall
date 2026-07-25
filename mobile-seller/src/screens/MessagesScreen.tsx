import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { sb, fmtTZS, NAVY, OFF, GRAY } from '../lib/supabase'

export default function MessagesScreen() {
  const [contacts, setContacts] = useState<any[]>([])
  const [shopWA,   setShopWA]  = useState('')

  useEffect(()=>{
    ;(async()=>{
      const raw = await AsyncStorage.getItem('seller_session')
      if (!raw) return
      const {id} = JSON.parse(raw)
      const {data:shop} = await sb.from('pending_payments').select('shop_whatsapp').eq('id',id).maybeSingle()
      if (shop?.shop_whatsapp) setShopWA(shop.shop_whatsapp.replace(/[^0-9]/g,''))
      const {data:orders} = await sb.from('orders').select('*').eq('shop_id',id).order('created_at',{ascending:false})
      const seen: Record<string,boolean> = {}
      const unique = (orders||[]).filter(o=>{
        const key = o.customer_phone||o.customer_name
        if (seen[key]) return false; seen[key]=true; return true
      })
      setContacts(unique)
    })()
  },[])

  const openWA = (phone: string, name: string) => {
    const num = phone ? phone.replace(/[^0-9]/g,'') : shopWA
    Linking.openURL('https://wa.me/'+num)
  }

  if (contacts.length===0) return (
    <View style={{flex:1,backgroundColor:OFF,alignItems:'center',justifyContent:'center'}}>
      <Text style={{fontSize:16,fontWeight:'700',color:NAVY,marginBottom:8}}>No contacts yet</Text>
      <Text style={{fontSize:13,color:GRAY,textAlign:'center',paddingHorizontal:40}}>Customers who place orders will appear here. You can chat them on WhatsApp.</Text>
    </View>
  )

  return (
    <FlatList data={contacts} keyExtractor={o=>o.id}
      style={{backgroundColor:OFF}}
      contentContainerStyle={{padding:16,gap:8}}
      renderItem={({item:o})=>(
        <TouchableOpacity style={s.item} onPress={()=>openWA(o.customer_phone,o.customer_name)} activeOpacity={0.85}>
          <View style={s.av}><Text style={{fontWeight:'800',color:'#fff',fontSize:15}}>{(o.customer_name||'?').slice(0,2).toUpperCase()}</Text></View>
          <View style={{flex:1}}>
            <Text style={s.name}>{o.customer_name||'Customer'}</Text>
            <Text style={{fontSize:11,color:GRAY}}>Order: {o.product_name||''} · {fmtTZS(o.amount||0)}</Text>
          </View>
          <View style={s.wa}>
            <Text style={{color:'#fff',fontSize:18}}>💬</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  )
}

const s = StyleSheet.create({
  item: { flexDirection:'row',alignItems:'center',gap:12,backgroundColor:'#fff',borderRadius:14,padding:14,borderWidth:1.5,borderColor:'#E2E8F0' },
  av:   { width:48,height:48,borderRadius:24,backgroundColor:NAVY,alignItems:'center',justifyContent:'center' },
  name: { fontSize:15,fontWeight:'700',color:NAVY,marginBottom:2 },
  wa:   { width:40,height:40,borderRadius:20,backgroundColor:'#25D366',alignItems:'center',justifyContent:'center' },
})
