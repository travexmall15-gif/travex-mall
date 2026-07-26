import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { sb, NAVY, GOLD, OFF, GRAY, RED, GREEN } from '../lib/supabase'

export default function MoreScreen({ navigation }: any) {
  const [shop, setShop]       = useState<any>(null)
  const [isPrem, setPrem]     = useState(false)
  const [aiModal, setAIModal] = useState(false)
  const [msg, setMsg]         = useState('')
  const [chat, setChat]       = useState<{ role: string; text: string }[]>([
    { role: 'ai', text: 'Hello! I am your AI business assistant. Ask me anything about your shop.' }
  ])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem('seller_session').then(raw => {
      if (!raw) return
      const sess = JSON.parse(raw)
      sb.from('pending_payments').select('*').eq('id', sess.id).maybeSingle().then(({ data }) => {
        if (data) { setShop(data); setPrem(data.plan === 'premium') }
      })
    })
  }, [])

  const lockAlert = (feat: string) =>
    Alert.alert('Premium Feature', feat + ' is available on Premium plan.\n\nUpgrade to TZS 45,000/month to unlock.', [
      { text: 'Cancel' },
      { text: 'Upgrade', onPress: () => {} }
    ])

  const sendAI = async () => {
    if (!msg.trim() || sending) return
    const userMsg = msg.trim()
    setMsg('')
    setChat(c => [...c, { role: 'user', text: userMsg }])
    setSending(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 400,
          system: 'You are a business assistant for a seller on ShopNekt marketplace in Tanzania. Shop: ' + (shop?.shop_name || '') + '. Be concise and helpful.',
          messages: [{ role: 'user', content: userMsg }]
        })
      })
      const d = await res.json()
      const reply = d?.content?.[0]?.text || 'Sorry, try again.'
      setChat(c => [...c, { role: 'ai', text: reply }])
    } catch {
      setChat(c => [...c, { role: 'ai', text: 'Connection error. Please check your internet and try again.' }])
    }
    setSending(false)
  }

  const logout = () =>
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await AsyncStorage.removeItem('seller_session')
        navigation.replace('Login')
      }}
    ])

  const menuItems = [
    { label: 'Products',     sub: 'Manage your products',       locked: false, onPress: () => navigation.navigate('Products') },
    { label: 'Flash Deals',  sub: 'Create limited-time deals',  locked: !isPrem, onPress: () => isPrem ? null : lockAlert('Flash Deals') },
    { label: 'Group Buy',    sub: 'Bulk buying campaigns',       locked: !isPrem, onPress: () => isPrem ? null : lockAlert('Group Buy') },
    { label: 'AI Assistant', sub: 'AI powered business help',   locked: !isPrem, onPress: () => isPrem ? setAIModal(true) : lockAlert('AI Assistant') },
    { label: 'View My Shop', sub: 'See your public shop page',  locked: false, onPress: () => {} },
    { label: 'Settings',     sub: 'Shop and account settings',  locked: false, onPress: () => {} },
  ]

  return (
    <ScrollView style={{ flex: 1, backgroundColor: OFF }} contentContainerStyle={{ padding: 16 }}>
      {shop && (
        <View style={s.shopCard}>
          <View style={s.shopAv}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: GOLD }}>
              {(shop.shop_name || 'S').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: NAVY }}>{shop.shop_name}</Text>
            <Text style={{ fontSize: 11, color: GRAY, marginTop: 2 }}>{shop.shop_category} · {shop.shop_region}</Text>
          </View>
          <View style={[s.planBadge, { backgroundColor: isPrem ? 'rgba(201,168,76,0.15)' : 'rgba(100,116,139,0.1)' }]}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: isPrem ? '#8B6914' : GRAY }}>
              {isPrem ? 'Premium' : 'Basic'}
            </Text>
          </View>
        </View>
      )}

      {menuItems.map(item => (
        <TouchableOpacity key={item.label} style={s.item} onPress={item.onPress} activeOpacity={0.85}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>{item.label}</Text>
            <Text style={s.subLabel}>{item.sub}</Text>
          </View>
          {item.locked && (
            <View style={s.lockBadge}>
              <Text style={{ fontSize: 9, fontWeight: '700', color: NAVY }}>PRO</Text>
            </View>
          )}
          <Text style={{ color: GRAY, fontSize: 20 }}>{'>'}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Text style={{ color: RED, fontWeight: '700', fontSize: 15 }}>Logout</Text>
      </TouchableOpacity>

      <Modal visible={aiModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: OFF }}>
          <View style={s.modalHead}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: NAVY }}>AI Assistant</Text>
            <TouchableOpacity onPress={() => setAIModal(false)}>
              <Text style={{ fontSize: 20, color: GRAY }}>x</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ gap: 10 }}>
            {chat.map((m, i) => (
              <View key={i} style={[s.bubble, m.role === 'user' ? s.bubbleUser : s.bubbleAI]}>
                <Text style={{ color: m.role === 'user' ? '#fff' : NAVY, fontSize: 14, lineHeight: 20 }}>{m.text}</Text>
              </View>
            ))}
            {sending && (
              <View style={s.bubbleAI}>
                <Text style={{ color: GRAY, fontSize: 14 }}>Thinking...</Text>
              </View>
            )}
          </ScrollView>
          <View style={s.chatRow}>
            <TextInput
              style={s.chatInp}
              placeholder="Ask anything..."
              value={msg}
              onChangeText={setMsg}
              placeholderTextColor="#94A3B8"
              onSubmitEditing={sendAI}
            />
            <TouchableOpacity style={s.sendBtn} onPress={sendAI}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  shopCard:  { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:'#fff', borderRadius:16, padding:16, marginBottom:16, borderWidth:1.5, borderColor:'#E2E8F0' },
  shopAv:    { width:48, height:48, borderRadius:14, backgroundColor:NAVY, alignItems:'center', justifyContent:'center' },
  planBadge: { paddingHorizontal:10, paddingVertical:4, borderRadius:999 },
  item:      { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#fff', borderRadius:14, padding:16, marginBottom:10, borderWidth:1.5, borderColor:'#E2E8F0' },
  label:     { fontSize:15, fontWeight:'700', color:NAVY },
  subLabel:  { fontSize:11, color:GRAY, marginTop:2 },
  lockBadge: { backgroundColor:GOLD, paddingHorizontal:8, paddingVertical:3, borderRadius:999 },
  logoutBtn: { marginTop:10, padding:16, backgroundColor:'rgba(220,38,38,0.06)', borderRadius:14, borderWidth:1, borderColor:'rgba(220,38,38,0.15)', alignItems:'center' },
  modalHead: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:16, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor:'#E2E8F0' },
  bubble:    { maxWidth:'80%', padding:12, borderRadius:16 },
  bubbleUser:{ backgroundColor:NAVY, alignSelf:'flex-end', borderBottomRightRadius:4 },
  bubbleAI:  { backgroundColor:'#fff', alignSelf:'flex-start', borderBottomLeftRadius:4, borderWidth:1.5, borderColor:'#E2E8F0' },
  chatRow:   { flexDirection:'row', gap:8, padding:12, backgroundColor:'#fff', borderTopWidth:1, borderTopColor:'#E2E8F0' },
  chatInp:   { flex:1, backgroundColor:'#F8FAFF', borderRadius:999, borderWidth:1.5, borderColor:'#E2E8F0', paddingHorizontal:16, paddingVertical:10, fontSize:14 },
  sendBtn:   { backgroundColor:NAVY, borderRadius:999, paddingHorizontal:18, paddingVertical:10, justifyContent:'center' },
})
