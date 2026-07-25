import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, RefreshControl, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { sb, fmtTZS, NAVY, GREEN, RED, OFF, GRAY, GOLD } from '../lib/supabase'

type Period = 'today'|'week'|'month'
const PERIODS: {key:Period; label:string}[] = [{key:'today',label:'Today'},{key:'week',label:'This Week'},{key:'month',label:'This Month'}]

export default function FinanceScreen() {
  const [period, setPeriod]   = useState<Period>('today')
  const [orders, setOrders]   = useState<any[]>([])
  const [sales, setSales]     = useState<any[]>([])
  const [shopId, setShopId]   = useState('')
  const [refreshing, setRef]  = useState(false)
  const [modal, setModal]     = useState(false)
  const [type,  setType]      = useState<'income'|'expense'>('income')
  const [desc,  setDesc]      = useState('')
  const [amount,setAmt]       = useState('')
  const [date,  setDate]      = useState(new Date().toISOString().split('T')[0])

  const load = useCallback(async () => {
    const raw = await AsyncStorage.getItem('seller_session')
    if (!raw) return
    const {id} = JSON.parse(raw); setShopId(id)
    const {data:o} = await sb.from('orders').select('*').eq('shop_id',id)
    setOrders(o||[])
    const {data:s} = await sb.from('seller_sales').select('*').eq('store_id',id).order('date',{ascending:false})
    setSales(s||[])
  },[])

  useEffect(()=>{load()},[])
  const onRefresh = async()=>{setRef(true);await load();setRef(false)}

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const weekStart = new Date(now); weekStart.setDate(now.getDate()-now.getDay()+1)
  const ws = weekStart.toISOString().split('T')[0]
  const ms = today.slice(0,7)

  const filterDate = (d: string) => period==='today'?d.startsWith(today):period==='week'?d>=ws:d.startsWith(ms)

  const filtOrders = orders.filter(o=>filterDate(o.created_at||''))
  const filtSales  = sales.filter(s=>filterDate(s.date||''))
  const autoIncome = filtOrders.reduce((a,o)=>a+(Number(o.amount)||0),0)
  const manIncome  = filtSales.filter(s=>s.type==='income').reduce((a,s)=>a+(Number(s.amount)||0),0)
  const expense    = filtSales.filter(s=>s.type==='expense').reduce((a,s)=>a+(Number(s.amount)||0),0)
  const income     = autoIncome+manIncome
  const profit     = income-expense

  const txs = [
    ...filtOrders.map(o=>({desc:'Order: '+(o.customer_name||'Customer'),amount:Number(o.amount)||0,type:'income',date:o.created_at})),
    ...filtSales.map(s=>({desc:s.description||'Transaction',amount:Number(s.amount)||0,type:s.type,date:s.date})),
  ].sort((a,b)=>b.date>a.date?1:-1)

  const saveTx = async()=>{
    if(!desc.trim()||!amount){ Alert.alert('Error','Please fill all fields'); return }
    await sb.from('seller_sales').insert({type,description:desc.trim(),amount:Number(amount),date,store_id:shopId,created_at:new Date().toISOString()})
    setDesc('');setAmt('');setDate(today);setModal(false)
    await load()
  }

  return (
    <View style={{flex:1,backgroundColor:OFF}}>
      <ScrollView contentContainerStyle={{padding:16}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
        {/* Period tabs */}
        <View style={s.tabs}>
          {PERIODS.map(p=>(
            <TouchableOpacity key={p.key} onPress={()=>setPeriod(p.key)} style={[s.tab,period===p.key&&s.tabA]}>
              <Text style={[s.tabT,period===p.key&&s.tabTA]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* P&L Summary */}
        <View style={{flexDirection:'row',gap:8,marginBottom:16}}>
          {[{label:'Income',val:fmtTZS(income),color:GREEN},{label:'Expenses',val:fmtTZS(expense),color:RED},{label:'Profit',val:(profit>=0?'+':'')+fmtTZS(Math.abs(profit)),color:profit>=0?GREEN:RED}].map(c=>(
            <View key={c.label} style={[s.finCard,{flex:1}]}>
              <Text style={s.finLabel}>{c.label}</Text>
              <Text style={[s.finVal,{color:c.color}]}>{c.val}</Text>
            </View>
          ))}
        </View>

        {/* Transactions */}
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <Text style={{fontSize:15,fontWeight:'800',color:NAVY}}>Transactions</Text>
          <TouchableOpacity onPress={()=>setModal(true)} style={s.addBtn}>
            <Text style={{color:'#fff',fontSize:12,fontWeight:'700'}}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <View style={s.card}>
          {txs.length===0
            ? <Text style={{color:GRAY,textAlign:'center',padding:20,fontSize:13}}>No transactions for this period</Text>
            : txs.map((t,i)=>(
              <View key={i} style={[s.tx,i<txs.length-1&&{borderBottomWidth:1,borderBottomColor:'#F8FAFF'}]}>
                <View style={[s.dot,{backgroundColor:t.type==='income'?GREEN:RED}]}/>
                <View style={{flex:1}}>
                  <Text style={{fontSize:13,fontWeight:'600',color:NAVY}}>{t.desc}</Text>
                  <Text style={{fontSize:10,color:GRAY}}>{t.date?.split('T')[0]||t.date}</Text>
                </View>
                <Text style={{fontSize:14,fontWeight:'800',color:t.type==='income'?GREEN:RED}}>
                  {t.type==='income'?'+':'-'}{fmtTZS(t.amount)}
                </Text>
              </View>
            ))
          }
        </View>
      </ScrollView>

      {/* Add Transaction Modal */}
      <Modal visible={modal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Record Transaction</Text>
            <View style={{flexDirection:'row',gap:8,marginBottom:14}}>
              {(['income','expense'] as const).map(t=>(
                <TouchableOpacity key={t} onPress={()=>setType(t)} style={[s.typeBtn,{backgroundColor:type===t?(t==='income'?GREEN:RED):'#F1F5F9'}]}>
                  <Text style={{color:type===t?'#fff':GRAY,fontWeight:'700',fontSize:13}}>{t==='income'?'Income':'Expense'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={s.inp} placeholder="Description" value={desc} onChangeText={setDesc} placeholderTextColor="#94A3B8"/>
            <TextInput style={s.inp} placeholder="Amount (TZS)" value={amount} onChangeText={setAmt} keyboardType="numeric" placeholderTextColor="#94A3B8"/>
            <TextInput style={s.inp} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholderTextColor="#94A3B8"/>
            <View style={{flexDirection:'row',gap:8,marginTop:4}}>
              <TouchableOpacity style={[s.btn,{backgroundColor:NAVY,flex:1}]} onPress={saveTx}>
                <Text style={{color:'#fff',fontWeight:'700',textAlign:'center'}}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btn,{backgroundColor:'#F1F5F9',flex:0.6}]} onPress={()=>setModal(false)}>
                <Text style={{color:NAVY,fontWeight:'700',textAlign:'center'}}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  tabs:    { flexDirection:'row',backgroundColor:'#fff',borderRadius:999,padding:3,gap:3,marginBottom:16,borderWidth:1.5,borderColor:'#E2E8F0' },
  tab:     { flex:1,padding:8,borderRadius:999,alignItems:'center' },
  tabA:    { backgroundColor:NAVY },
  tabT:    { fontSize:12,fontWeight:'600',color:GRAY },
  tabTA:   { color:'#fff' },
  finCard: { backgroundColor:'#fff',borderRadius:12,padding:12,alignItems:'center',borderWidth:1.5,borderColor:'#E2E8F0' },
  finLabel:{ fontSize:9,fontWeight:'600',color:GRAY,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4 },
  finVal:  { fontSize:12,fontWeight:'900',textAlign:'center' },
  card:    { backgroundColor:'#fff',borderRadius:14,padding:14,borderWidth:1.5,borderColor:'#E2E8F0' },
  tx:      { flexDirection:'row',alignItems:'center',gap:10,paddingVertical:10 },
  dot:     { width:8,height:8,borderRadius:4,flexShrink:0 },
  addBtn:  { backgroundColor:NAVY,borderRadius:999,paddingHorizontal:14,paddingVertical:7 },
  overlay: { flex:1,backgroundColor:'rgba(0,0,0,0.45)',justifyContent:'flex-end' },
  modal:   { backgroundColor:'#fff',borderRadius:22,padding:22,margin:12 },
  modalTitle:{ fontSize:17,fontWeight:'800',color:NAVY,marginBottom:16 },
  inp:     { backgroundColor:'#F8FAFF',borderWidth:1.5,borderColor:'#E2E8F0',borderRadius:12,padding:12,fontSize:14,color:NAVY,marginBottom:10 },
  btn:     { padding:13,borderRadius:12 },
  typeBtn: { flex:1,padding:11,borderRadius:12,alignItems:'center' },
})
