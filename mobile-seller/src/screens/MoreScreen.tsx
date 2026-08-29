import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { sb, C } from '../lib/supabase'

export default function MoreScreen({ navigation }: any) {
  const [shop, setShop]     = useState<any>(null)
  const [isPrem, setPrem]   = useState(false)
  const [aiModal, setAI]    = useState(false)
  const [msg, setMsg]       = useState('')
  const [chat, setChat]     = useState([{role:'ai',text:'Hello! I am your AI business assistant. Ask me anything about your shop.'}])
  const [sending, setSend]  = useState(false)

  useEffect(() => {
    AsyncStorage.getItem('seller_session').then(raw => {
      if (!raw) {return}
      const {id} = JSON.parse(raw)
      sb.from('pending_payments').select('*').eq('id',id).maybeSingle().then(({data}) => {
        if (data) { setShop(data); setPrem(data.plan==='premium') }
      })
    })
  }, [])

  const lockAlert = (f: string) => Alert.alert('Premium Feature', f+' is available on Premium plan (TZS 45,000/month).', [{text:'OK'}])

  const sendAI = async () => {
    if (!msg.trim()||sending) {return}
    const m = msg.trim(); setMsg('')
    setChat(c=>[...c,{role:'user',text:m}])
    setSend(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'Content-Type':'application/json','anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
        body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:400,system:'You are a business assistant for a seller on ShopNekt. Shop: '+(shop?.shop_name||'')+'. Be concise.',messages:[{role:'user',content:m}]})
      })
      const d = await res.json()
      setChat(c=>[...c,{role:'ai',text:d?.content?.[0]?.text||'Sorry, try again.'}])
    } catch { setChat(c=>[...c,{role:'ai',text:'Connection error. Try again.'}]) }
    setSend(false)
  }

  const logout = () => Alert.alert('Logout','Are you sure?',[{text:'Cancel'},{text:'Logout',style:'destructive',onPress:async()=>{await AsyncStorage.removeItem('seller_session');navigation.replace('Login')}}])

  const items = [
    {label:'Flash Deals', sub:'Limited-time deals', locked:!isPrem, onPress:()=>isPrem?null:lockAlert('Flash Deals')},
    {label:'Group Buy',   sub:'Bulk buying',         locked:!isPrem, onPress:()=>isPrem?null:lockAlert('Group Buy')},
    {label:'AI Assistant',sub:'AI business help',    locked:!isPrem, onPress:()=>isPrem?setAI(true):lockAlert('AI Assistant')},
    {label:'View My Shop',sub:'Public shop page',    locked:false,   onPress:()=>{}},
    {label:'Settings',    sub:'Account settings',    locked:false,   onPress:()=>{}},
  ]

  return (
    <ScrollView style={{flex:1,backgroundColor:C.OFF}} contentContainerStyle={{padding:16}}>
      {shop&&(
        <View style={s.shopCard}>
          <View style={s.shopAv}><Text style={{fontSize:20,fontWeight:'900',color:C.GOLD}}>{(shop.shop_name||'S').slice(0,2).toUpperCase()}</Text></View>
          <View style={{flex:1}}>
            <Text style={{fontSize:16,fontWeight:'800',color:C.NAVY}}>{shop.shop_name}</Text>
            <Text style={{fontSize:11,color:C.GRAY,marginTop:2}}>{shop.shop_category} · {shop.shop_region}</Text>
          </View>
          <View style={[s.badge,{backgroundColor:isPrem?'rgba(201,168,76,0.15)':'rgba(100,116,139,0.1)'}]}>
            <Text style={{fontSize:10,fontWeight:'700',color:isPrem?'#8B6914':C.GRAY}}>{isPrem?'Premium':'Basic'}</Text>
          </View>
        </View>
      )}

      {items.map(item=>(
        <TouchableOpacity key={item.label} style={s.item} onPress={item.onPress} activeOpacity={0.85}>
          <View style={{flex:1}}>
            <Text style={{fontSize:15,fontWeight:'700',color:C.NAVY}}>{item.label}</Text>
            <Text style={{fontSize:11,color:C.GRAY,marginTop:2}}>{item.sub}</Text>
          </View>
          {item.locked&&<View style={s.proBadge}><Text style={{fontSize:9,fontWeight:'700',color:C.NAVY}}>PRO</Text></View>}
          <Text style={{color:C.GRAY,fontSize:18}}>{'>'}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Text style={{color:C.RED,fontWeight:'700',fontSize:15}}>Logout</Text>
      </TouchableOpacity>

      <Modal visible={aiModal} animationType="slide">
        <View style={{flex:1,backgroundColor:C.OFF}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,backgroundColor:C.WHITE,borderBottomWidth:1,borderBottomColor:C.LGRAY}}>
            <Text style={{fontSize:16,fontWeight:'800',color:C.NAVY}}>AI Assistant</Text>
            <TouchableOpacity onPress={()=>setAI(false)}><Text style={{fontSize:20,color:C.GRAY}}>×</Text></TouchableOpacity>
          </View>
          <ScrollView style={{flex:1,padding:16}} contentContainerStyle={{gap:10}}>
            {chat.map((m,i)=>(
              <View key={i} style={[s.bubble,m.role==='user'?s.bubbleU:s.bubbleA]}>
                <Text style={{color:m.role==='user'?C.WHITE:C.NAVY,fontSize:14,lineHeight:20}}>{m.text}</Text>
              </View>
            ))}
            {sending&&<View style={s.bubbleA}><Text style={{color:C.GRAY,fontSize:14}}>Thinking...</Text></View>}
          </ScrollView>
          <View style={{flexDirection:'row',gap:8,padding:12,backgroundColor:C.WHITE,borderTopWidth:1,borderTopColor:C.LGRAY}}>
            <TextInput style={{flex:1,backgroundColor:C.OFF,borderRadius:999,borderWidth:1.5,borderColor:C.LGRAY,paddingHorizontal:16,paddingVertical:10,fontSize:14}} placeholder="Ask anything..." value={msg} onChangeText={setMsg} onSubmitEditing={sendAI} placeholderTextColor="#94A3B8"/>
            <TouchableOpacity style={{backgroundColor:C.NAVY,borderRadius:999,paddingHorizontal:18,paddingVertical:10,justifyContent:'center'}} onPress={sendAI}>
              <Text style={{color:C.WHITE,fontWeight:'700'}}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  shopCard: {flexDirection:'row',alignItems:'center',gap:12,backgroundColor:C.WHITE,borderRadius:16,padding:16,marginBottom:14,borderWidth:1.5,borderColor:C.LGRAY},
  shopAv:   {width:48,height:48,borderRadius:14,backgroundColor:C.NAVY,alignItems:'center',justifyContent:'center'},
  badge:    {paddingHorizontal:10,paddingVertical:4,borderRadius:999},
  item:     {flexDirection:'row',alignItems:'center',gap:14,backgroundColor:C.WHITE,borderRadius:14,padding:16,marginBottom:10,borderWidth:1.5,borderColor:C.LGRAY},
  proBadge: {backgroundColor:C.GOLD,paddingHorizontal:8,paddingVertical:3,borderRadius:999},
  logoutBtn:{marginTop:8,padding:16,backgroundColor:'rgba(220,38,38,0.06)',borderRadius:14,borderWidth:1,borderColor:'rgba(220,38,38,0.15)',alignItems:'center'},
  bubble:   {maxWidth:'80%',padding:12,borderRadius:16},
  bubbleU:  {backgroundColor:C.NAVY,alignSelf:'flex-end',borderBottomRightRadius:4},
  bubbleA:  {backgroundColor:C.WHITE,alignSelf:'flex-start',borderBottomLeftRadius:4,borderWidth:1.5,borderColor:C.LGRAY},
  LGRAY:    {borderColor:'#E2E8F0'}
})
