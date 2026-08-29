import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { sb, C, fmtTZS } from '../lib/supabase'

export default function MessagesScreen() {
  const [contacts, setContacts] = useState<any[]>([])

  useEffect(() => {
    AsyncStorage.getItem('seller_session').then(raw => {
      if (!raw) {return}
      const {id} = JSON.parse(raw)
      sb.from('orders').select('*').eq('shop_id',id).order('created_at',{ascending:false}).then(({data}) => {
        const seen: Record<string,boolean> = {}
        setContacts((data||[]).filter(o => { const k=o.customer_phone||o.customer_name; if(seen[k]) {return false;} seen[k]=true; return true }))
      })
    })
  }, [])

  if (!contacts.length) {return (
    <View style={{flex:1,backgroundColor:C.OFF,alignItems:'center',justifyContent:'center',padding:32}}>
      <Text style={{fontSize:16,fontWeight:'700',color:C.NAVY,marginBottom:8}}>No contacts yet</Text>
      <Text style={{fontSize:13,color:C.GRAY,textAlign:'center',lineHeight:20}}>Customers who order from you will appear here.</Text>
    </View>
  )}

  return (
    <FlatList data={contacts} keyExtractor={o=>o.id}
      style={{backgroundColor:C.OFF}}
      contentContainerStyle={{padding:16,gap:8}}
      renderItem={({item:o}) => (
        <TouchableOpacity style={s.item} onPress={()=>{ const n=(o.customer_phone||'').replace(/\D/g,''); if(n) {Linking.openURL('https://wa.me/'+n)} }} activeOpacity={0.85}>
          <View style={s.av}>
            <Text style={{fontWeight:'800',color:C.WHITE,fontSize:15}}>{(o.customer_name||'?').slice(0,2).toUpperCase()}</Text>
          </View>
          <View style={{flex:1}}>
            <Text style={{fontSize:15,fontWeight:'700',color:C.NAVY,marginBottom:2}}>{o.customer_name||'Customer'}</Text>
            <Text style={{fontSize:11,color:C.GRAY}}>{o.product_name||''} · {fmtTZS(o.amount||0)}</Text>
          </View>
          <View style={s.wa}><Text style={{color:C.WHITE,fontSize:12,fontWeight:'700'}}>WA</Text></View>
        </TouchableOpacity>
      )}
    />
  )
}

const s = StyleSheet.create({
  item: {flexDirection:'row',alignItems:'center',gap:12,backgroundColor:C.WHITE,borderRadius:14,padding:14,borderWidth:1.5,borderColor:C.LGRAY},
  av:   {width:48,height:48,borderRadius:24,backgroundColor:C.NAVY,alignItems:'center',justifyContent:'center'},
  wa:   {width:40,height:40,borderRadius:20,backgroundColor:'#25D366',alignItems:'center',justifyContent:'center'},
  LGRAY:{borderColor:'#E2E8F0'}
})
